import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ViewportMode, BackgroundPreset, BrushSettings, Stroke } from './types/canvas';
import type { GlassSettings } from './types/glass';
import { GLASS_PRESETS } from './types/glass';
import type { GestureState, TelemetryData } from './types/tracking';
import { handTracker } from './services/handTracker';
import { detectGesture } from './utils/gestureRecognition';
import { TemporalSmoother, generateSmoothStrokePoints } from './utils/strokeEngine';
import { eraseStrokesInRadius } from './utils/canvasRenderer';
import { downloadPNG, downloadSVG } from './services/exportService';

import { Navigation } from './components/Navigation';
import { ControlDock } from './components/ControlDock';
import { SidebarPanel } from './components/SidebarPanel';
import { ViewportContainer } from './components/ViewportContainer';
import { GestureInstructionsModal } from './components/GestureInstructionsModal';

export const App: React.FC = () => {
  // 1. Viewport & Camera State
  const [viewportMode, setViewportMode] = useState<ViewportMode>('camera');
  const [backgroundPreset, setBackgroundPreset] = useState<BackgroundPreset>('dark-grid');
  const [mirrorCamera, setMirrorCamera] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // 2. Glass Settings State
  const [glassSettings, setGlassSettings] = useState<GlassSettings>({
    mode: 'frosted',
    ...GLASS_PRESETS.frosted,
  });

  // 3. Brush & Physics Settings State
  const [brushSettings, setBrushSettings] = useState<BrushSettings>({
    color: '#3b82f6', // Default Blue
    size: 6,
    opacity: 100,
    style: 'solid',
    smoothing: 30,
    eraserSize: 45,
    handwritingMode: true,
  });

  const [isEraserActive, setIsEraserActive] = useState<boolean>(false);

  // 4. Drawing Canvas History State
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [undoStack, setUndoStack] = useState<Stroke[]>([]);
  const [activeStroke, setActiveStroke] = useState<Stroke | null>(null);

  // 5. Tracking & Gesture State
  const [gestureState, setGestureState] = useState<GestureState>({
    activeGesture: 'NONE',
    confidence: 0,
    holdProgress: 0,
    drawStartProgress: 0,
    cursorPosition: null,
    indexTipPosition: null,
    handDetected: false,
    landmarks: null,
  });

  const [telemetry, setTelemetry] = useState<TelemetryData>({
    fps: 0,
    latencyMs: 0,
    confidence: 0,
    gesture: 'NONE',
    strokeCount: 0,
    totalPointsCount: 0,
    resolution: '1280x720',
    handCount: 0,
  });

  // 6. UI Modals & Drawer State
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isGestureGuideOpen, setIsGestureGuideOpen] = useState<boolean>(false);

  // 7. Refs for Uninterrupted 60 FPS Loop Execution
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  const strokesRef = useRef(strokes);
  strokesRef.current = strokes;

  const activeStrokeRef = useRef(activeStroke);
  activeStrokeRef.current = activeStroke;

  const brushSettingsRef = useRef(brushSettings);
  brushSettingsRef.current = brushSettings;

  const isEraserActiveRef = useRef(isEraserActive);
  isEraserActiveRef.current = isEraserActive;

  const dimensionsRef = useRef(dimensions);
  dimensionsRef.current = dimensions;

  const smootherRef = useRef(new TemporalSmoother());
  const activeRawPointsRef = useRef<{ x: number; y: number }[]>([]);
  const holdTimerRef = useRef<number>(0);
  const animationFrameIdRef = useRef<number | null>(null);

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize Webcam Stream
  const requestCameraAccess = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 60 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };
      }
    } catch (err) {
      console.error('Error opening webcam stream:', err);
    }
  }, []);

  useEffect(() => {
    requestCameraAccess();
  }, [requestCameraAccess]);

  // Initialize MediaPipe Hand Tracker
  useEffect(() => {
    handTracker.initialize();
    return () => handTracker.dispose();
  }, []);

  // Main Uninterrupted Detection Loop
  useEffect(() => {
    let isSubscribed = true;

    const processFrame = () => {
      if (!isSubscribed) return;

      if (videoRef.current && videoRef.current.readyState >= 2) {
        const trackResult = handTracker.processVideoFrame(videoRef.current, mirrorCamera);
        const gestureRes = detectGesture(trackResult.landmarks);

        const currentGesture = isEraserActiveRef.current ? 'ERASE' : gestureRes.gesture;
        const currentStrokes = strokesRef.current;
        const currentActiveStroke = activeStrokeRef.current;
        const currentBrush = brushSettingsRef.current;
        const currentDims = dimensionsRef.current;

        // Telemetry Update
        setTelemetry({
          fps: trackResult.fps,
          latencyMs: trackResult.latencyMs,
          confidence: trackResult.confidence,
          gesture: currentGesture,
          strokeCount: currentStrokes.length,
          totalPointsCount: currentStrokes.reduce((acc, s) => acc + s.points.length, 0),
          resolution: `${currentDims.width}x${currentDims.height}`,
          handCount: trackResult.handCount,
        });

        // 1. INSTANT 0-DELAY DRAWING ACROSS FULL CANVAS
        if (currentGesture === 'DRAW' && gestureRes.cursorPoint) {
          const smoothedPt = smootherRef.current.smooth(
            gestureRes.cursorPoint.x,
            gestureRes.cursorPoint.y,
            currentBrush.smoothing
          );

          // If user switches pen style or color mid-session, commit old stroke & start new stroke segment
          if (
            currentActiveStroke &&
            (currentActiveStroke.style !== currentBrush.style ||
              currentActiveStroke.color !== currentBrush.color ||
              currentActiveStroke.size !== currentBrush.size)
          ) {
            if (activeRawPointsRef.current.length >= 2) {
              setStrokes((prev) => [...prev, currentActiveStroke]);
            }
            activeRawPointsRef.current = [smoothedPt];
          } else {
            activeRawPointsRef.current.push(smoothedPt);
          }

          const smoothPoints = generateSmoothStrokePoints(
            activeRawPointsRef.current,
            currentBrush.smoothing
          );

          const updatedStroke: Stroke = {
            id:
              currentActiveStroke &&
              currentActiveStroke.style === currentBrush.style &&
              currentActiveStroke.color === currentBrush.color
                ? currentActiveStroke.id
                : `stroke-${Date.now()}`,
            points: smoothPoints,
            color: currentBrush.color,
            size: currentBrush.size,
            opacity: currentBrush.opacity,
            style: currentBrush.style,
            timestamp: Date.now(),
          };

          setActiveStroke(updatedStroke);
        } else {
          // Hand lowered / finger folded -> Instantly end stroke segment
          if (activeRawPointsRef.current.length >= 2 && currentActiveStroke) {
            setStrokes((prev) => [...prev, currentActiveStroke]);
            setUndoStack([]);
          }
          activeRawPointsRef.current = [];
          smootherRef.current.reset();
          setActiveStroke(null);
        }

        // 2. ERASER GESTURE LOGIC
        if (currentGesture === 'ERASE' && gestureRes.cursorPoint) {
          setStrokes((prev) =>
            eraseStrokesInRadius(
              prev,
              gestureRes.cursorPoint!,
              currentBrush.eraserSize,
              currentDims.width,
              currentDims.height
            )
          );
        }

        // 3. HOLD-TO-CLEAR PALM GESTURE LOGIC
        if (currentGesture === 'CLEAR_HOLD') {
          holdTimerRef.current += 1 / (trackResult.fps || 30);
          const progress = Math.min(1, holdTimerRef.current / 1.5);

          if (progress >= 1) {
            setStrokes([]);
            setUndoStack([]);
            holdTimerRef.current = 0;
          }

          setGestureState({
            activeGesture: 'CLEAR_HOLD',
            confidence: gestureRes.confidence,
            holdProgress: progress,
            drawStartProgress: 0,
            cursorPosition: gestureRes.cursorPoint,
            indexTipPosition: gestureRes.indexTip,
            handDetected: true,
            landmarks: trackResult.landmarks,
          });
        } else {
          holdTimerRef.current = 0;
          setGestureState({
            activeGesture: currentGesture,
            confidence: gestureRes.confidence,
            holdProgress: 0,
            drawStartProgress: 0,
            cursorPosition: gestureRes.cursorPoint,
            indexTipPosition: gestureRes.indexTip,
            handDetected: trackResult.handCount > 0,
            landmarks: trackResult.landmarks,
          });
        }
      }

      animationFrameIdRef.current = requestAnimationFrame(processFrame);
    };

    animationFrameIdRef.current = requestAnimationFrame(processFrame);

    return () => {
      isSubscribed = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [mirrorCamera]);

  // Undo / Redo Actions
  const handleUndo = useCallback(() => {
    if (strokes.length === 0) return;
    const lastStroke = strokes[strokes.length - 1];
    setStrokes((prev) => prev.slice(0, prev.length - 1));
    setUndoStack((prev) => [...prev, lastStroke]);
  }, [strokes]);

  const handleRedo = useCallback(() => {
    if (undoStack.length === 0) return;
    const nextStroke = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
    setStrokes((prev) => [...prev, nextStroke]);
  }, [undoStack]);

  const handleClearCanvas = useCallback(() => {
    setStrokes([]);
    setUndoStack([]);
  }, []);

  // Keyboard Shortcuts Listener (Ctrl+Z, Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Fullscreen Handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="app-main-shell">
      {/* Top Header Navigation */}
      <Navigation
        viewportMode={viewportMode}
        setViewportMode={setViewportMode}
        mirrorCamera={mirrorCamera}
        setMirrorCamera={setMirrorCamera}
        onOpenGestureGuide={() => setIsGestureGuideOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={strokes.length > 0}
        canRedo={undoStack.length > 0}
        onClearCanvas={handleClearCanvas}
        onExportPNG={() => canvasRef.current && downloadPNG(canvasRef.current)}
        onExportSVG={() => downloadSVG(strokes, dimensions.width, dimensions.height)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        brushSettings={brushSettings}
        setBrushSettings={setBrushSettings}
      />

      {/* Main Fullscreen Viewport Layer */}
      <ViewportContainer
        viewportMode={viewportMode}
        backgroundPreset={backgroundPreset}
        mirrorCamera={mirrorCamera}
        debugMode={false}
        videoRef={videoRef}
        canvasRef={canvasRef}
        glassSettings={glassSettings}
        brushSettings={brushSettings}
        strokes={strokes}
        activeStroke={activeStroke}
        activeEraser={
          isEraserActive && gestureState.cursorPosition
            ? { position: gestureState.cursorPosition, size: brushSettings.eraserSize }
            : null
        }
        gestureState={gestureState}
        telemetry={telemetry}
        viewportDimensions={dimensions}
      />

      {/* Floating Bottom Quick Dock */}
      <ControlDock
        brushSettings={brushSettings}
        setBrushSettings={setBrushSettings}
        isEraserActive={isEraserActive}
        setIsEraserActive={setIsEraserActive}
        activeGesture={gestureState.activeGesture}
        onQuickClear={handleClearCanvas}
      />

      {/* Right Settings Sidebar Drawer */}
      <SidebarPanel
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        glassSettings={glassSettings}
        setGlassSettings={setGlassSettings}
        brushSettings={brushSettings}
        setBrushSettings={setBrushSettings}
        backgroundPreset={backgroundPreset}
        setBackgroundPreset={setBackgroundPreset}
      />

      {/* Hand Gesture Instructions Modal */}
      <GestureInstructionsModal
        isOpen={isGestureGuideOpen}
        onClose={() => setIsGestureGuideOpen(false)}
      />
    </div>
  );
};
