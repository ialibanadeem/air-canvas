import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import type { Point3D } from '../types/tracking';

export class HandTrackerService {
  private handLandmarker: HandLandmarker | null = null;
  private isInitializing: boolean = false;
  private lastVideoTime: number = -1;
  private lastFrameTimestamp: number = performance.now();
  private frameCounterMs: number = 0;
  private fps: number = 0;
  private latencyMs: number = 0;

  public async initialize(): Promise<boolean> {
    if (this.handLandmarker) return true;
    if (this.isInitializing) return false;

    this.isInitializing = true;

    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      this.isInitializing = false;
      return true;
    } catch (err) {
      console.warn('Failed to load GPU delegate for MediaPipe HandLandmarker, trying CPU fallback...', err);
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        this.isInitializing = false;
        return true;
      } catch (fallbackErr) {
        console.error('Failed to initialize HandLandmarker:', fallbackErr);
        this.isInitializing = false;
        return false;
      }
    }
  }

  public processVideoFrame(
    video: HTMLVideoElement,
    mirror: boolean
  ): {
    landmarks: Point3D[] | null;
    confidence: number;
    fps: number;
    latencyMs: number;
    handCount: number;
  } {
    const now = performance.now();
    const frameDelta = now - this.lastFrameTimestamp;
    if (frameDelta > 0) {
      this.fps = Math.round(1000 / frameDelta);
    }
    this.lastFrameTimestamp = now;

    if (!this.handLandmarker || video.currentTime === this.lastVideoTime || video.readyState < 2) {
      return {
        landmarks: null,
        confidence: 0,
        fps: this.fps,
        latencyMs: this.latencyMs,
        handCount: 0,
      };
    }

    this.lastVideoTime = video.currentTime;
    const startTime = performance.now();

    // Use strictly monotonic integer timestamp in ms for MediaPipe
    const videoTimestampMs = Math.round(video.currentTime * 1000);
    this.frameCounterMs = Math.max(this.frameCounterMs + 1, videoTimestampMs);

    try {
      const results = this.handLandmarker.detectForVideo(video, this.frameCounterMs);
      this.latencyMs = Math.round(performance.now() - startTime);

      if (results.landmarks && results.landmarks.length > 0) {
        const rawLandmarks = results.landmarks[0];
        const confidence = results.handednesses?.[0]?.[0]?.score || 0.9;

        const processedLandmarks: Point3D[] = rawLandmarks.map((pt) => ({
          x: mirror ? 1 - pt.x : pt.x,
          y: pt.y,
          z: pt.z,
        }));

        return {
          landmarks: processedLandmarks,
          confidence: Math.round(confidence * 100) / 100,
          fps: this.fps,
          latencyMs: this.latencyMs,
          handCount: results.landmarks.length,
        };
      }
    } catch (e) {
      console.error('Error during MediaPipe detection loop:', e);
    }

    return {
      landmarks: null,
      confidence: 0,
      fps: this.fps,
      latencyMs: this.latencyMs,
      handCount: 0,
    };
  }

  public dispose() {
    if (this.handLandmarker) {
      this.handLandmarker.close();
      this.handLandmarker = null;
    }
  }
}

export const handTracker = new HandTrackerService();
