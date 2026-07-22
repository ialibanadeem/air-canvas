import React, { useRef, useEffect } from 'react';
import type { Point3D, TelemetryData } from '../types/tracking';

interface DebugHUDProps {
  landmarks: Point3D[] | null;
  telemetry: TelemetryData;
  width: number;
  height: number;
  mirror: boolean;
}

// 21 Hand Connections according to MediaPipe standard graph
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // Index
  [5, 9], [9, 10], [10, 11], [11, 12], // Middle
  [9, 13], [13, 14], [14, 15], [15, 16], // Ring
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
];

export const DebugHUD: React.FC<DebugHUDProps> = ({
  landmarks,
  telemetry,
  width,
  height,
}) => {
  const debugCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = debugCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    if (!landmarks || landmarks.length < 21) return;

    ctx.save();

    // 1. Draw Skeleton Joint Connections
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2.5;

    for (const [i, j] of HAND_CONNECTIONS) {
      const p1 = landmarks[i];
      const p2 = landmarks[j];

      ctx.beginPath();
      ctx.moveTo(p1.x * width, p1.y * height);
      ctx.lineTo(p2.x * width, p2.y * height);
      ctx.stroke();
    }

    // 2. Draw Landmark Points
    for (let i = 0; i < landmarks.length; i++) {
      const pt = landmarks[i];
      const cx = pt.x * width;
      const cy = pt.y * height;

      ctx.beginPath();
      ctx.arc(cx, cy, i === 8 ? 7 : 4, 0, 2 * Math.PI);

      if (i === 8) {
        // Index Finger Tip Highlight
        ctx.fillStyle = '#ec4899';
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 10;
      } else if (i === 4 || i === 12 || i === 16 || i === 20) {
        // Other Finger Tips
        ctx.fillStyle = '#3b82f6';
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 0;
      }
      ctx.fill();
    }

    ctx.restore();
  }, [landmarks, width, height]);

  return (
    <div className="debug-hud-overlay">
      {/* Hand Skeleton Debug Canvas */}
      <canvas
        ref={debugCanvasRef}
        width={width}
        height={height}
        className="debug-skeleton-canvas"
      />

      {/* Telemetry Metrics Panel */}
      <div className="telemetry-panel">
        <div className="telemetry-header">
          <span className="telemetry-title font-mono font-bold text-cyan-400">CV TELEMETRY HUD</span>
          <span className="live-pill">LIVE</span>
        </div>
        <div className="telemetry-grid">
          <div className="metric-item">
            <span className="metric-label">Gesture</span>
            <span className={`metric-value font-mono ${telemetry.gesture === 'DRAW' ? 'text-green-400' : 'text-cyan-300'}`}>
              {telemetry.gesture}
            </span>
          </div>

          <div className="metric-item">
            <span className="metric-label">FPS</span>
            <span className="metric-value font-mono text-yellow-400">{telemetry.fps}</span>
          </div>

          <div className="metric-item">
            <span className="metric-label">Latency</span>
            <span className="metric-value font-mono text-gray-200">{telemetry.latencyMs} ms</span>
          </div>

          <div className="metric-item">
            <span className="metric-label">Confidence</span>
            <span className="metric-value font-mono text-emerald-400">{Math.round(telemetry.confidence * 100)}%</span>
          </div>

          <div className="metric-item">
            <span className="metric-label">Strokes</span>
            <span className="metric-value font-mono text-cyan-200">{telemetry.strokeCount}</span>
          </div>

          <div className="metric-item">
            <span className="metric-label">Resolution</span>
            <span className="metric-value font-mono text-gray-400">{telemetry.resolution}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
