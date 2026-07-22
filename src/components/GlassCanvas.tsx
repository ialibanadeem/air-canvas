import React, { useRef, useEffect } from 'react';
import type { GlassSettings } from '../types/glass';
import type { Stroke } from '../types/canvas';
import { renderCanvas } from '../utils/canvasRenderer';

interface GlassCanvasProps {
  glassSettings: GlassSettings;
  strokes: Stroke[];
  activeStroke: Stroke | null;
  activeEraser: { position: { x: number; y: number }; size: number } | null;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  width: number;
  height: number;
}

export const GlassCanvas: React.FC<GlassCanvasProps> = ({
  glassSettings,
  strokes,
  activeStroke,
  activeEraser,
  canvasRef,
  width,
  height,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Render canvas strokes whenever state updates
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderCanvas(ctx, width, height, strokes, activeStroke, activeEraser);
  }, [strokes, activeStroke, activeEraser, width, height, canvasRef]);

  // Construct dynamic inline glass style object
  const glassStyle: React.CSSProperties = {
    backgroundColor: glassSettings.tintColor,
    opacity: Math.max(0.05, glassSettings.opacity / 100),
    backdropFilter: glassSettings.blur > 0 ? `blur(${glassSettings.blur}px)` : 'none',
    WebkitBackdropFilter: glassSettings.blur > 0 ? `blur(${glassSettings.blur}px)` : 'none',
    border: glassSettings.border ? '1px solid rgba(255, 255, 255, 0.25)' : 'none',
    boxShadow: glassSettings.glow
      ? `0 0 35px ${glassSettings.glowColor}40, inset 0 0 15px rgba(255,255,255,0.15)`
      : 'inset 0 0 20px rgba(255, 255, 255, 0.08)',
  };

  return (
    <div ref={containerRef} className="glass-canvas-container">
      {/* Dynamic Virtual Glass Backdrop Shader Layer */}
      <div className="glass-surface-layer" style={glassStyle} />

      {/* Light Reflection Shimmer Effect */}
      {glassSettings.reflection && <div className="glass-reflection-shimmer" />}

      {/* Canvas Graphics Layer */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="glass-drawing-canvas"
      />
    </div>
  );
};
