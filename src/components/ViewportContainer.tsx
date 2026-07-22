import React from 'react';
import type { ViewportMode, BackgroundPreset, Stroke, BrushSettings } from '../types/canvas';
import type { GlassSettings } from '../types/glass';
import type { TelemetryData, GestureState } from '../types/tracking';
import { GlassCanvas } from './GlassCanvas';
import { DebugHUD } from './DebugHUD';
import { GestureRingOverlay } from './GestureRingOverlay';
import { WatermarkBadge } from './WatermarkBadge';

interface ViewportContainerProps {
  viewportMode: ViewportMode;
  backgroundPreset: BackgroundPreset;
  mirrorCamera: boolean;
  debugMode: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  glassSettings: GlassSettings;
  brushSettings: BrushSettings;
  strokes: Stroke[];
  activeStroke: Stroke | null;
  activeEraser: { position: { x: number; y: number }; size: number } | null;
  gestureState: GestureState;
  telemetry: TelemetryData;
  viewportDimensions: { width: number; height: number };
}

export const ViewportContainer: React.FC<ViewportContainerProps> = ({
  viewportMode,
  backgroundPreset,
  mirrorCamera,
  debugMode,
  videoRef,
  canvasRef,
  glassSettings,
  brushSettings,
  strokes,
  activeStroke,
  activeEraser,
  gestureState,
  telemetry,
  viewportDimensions,
}) => {
  return (
    <main className={`viewport-container mode-${viewportMode} bg-${backgroundPreset}`}>
      {/* 1. Webcam Stream Layer (Visible in Camera Mode) */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`webcam-stream ${mirrorCamera ? 'mirror-flip' : ''} ${
          viewportMode === 'canvas' ? 'hidden' : ''
        }`}
      />

      {/* 2. Backdrop Canvas Preset Surface (Visible in Canvas Mode or Presentation) */}
      {viewportMode !== 'camera' && (
        <div className={`backdrop-preset-layer preset-${backgroundPreset}`} />
      )}

      {/* 3. Virtual Glass Canvas Layer */}
      <GlassCanvas
        glassSettings={glassSettings}
        strokes={strokes}
        activeStroke={activeStroke}
        activeEraser={activeEraser}
        canvasRef={canvasRef}
        width={viewportDimensions.width}
        height={viewportDimensions.height}
      />

      {/* 4. Computer Vision Telemetry & Landmark Skeleton HUD */}
      {debugMode && (
        <DebugHUD
          landmarks={gestureState.landmarks}
          telemetry={telemetry}
          width={viewportDimensions.width}
          height={viewportDimensions.height}
          mirror={mirrorCamera}
        />
      )}

      {/* 5. Air Cursor Pointer & Hold-to-Clear / Hold-to-Start Countdown Ring */}
      <GestureRingOverlay
        cursorPosition={gestureState.cursorPosition}
        activeGesture={gestureState.activeGesture}
        holdProgress={gestureState.holdProgress}
        drawStartProgress={gestureState.drawStartProgress}
        width={viewportDimensions.width}
        height={viewportDimensions.height}
        brushSize={brushSettings.size}
        brushColor={brushSettings.color}
      />

      {/* 6. Portfolio Watermark Badge */}
      <WatermarkBadge />
    </main>
  );
};
