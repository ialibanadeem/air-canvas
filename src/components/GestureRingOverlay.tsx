import React from 'react';
import type { Point2D, GestureType } from '../types/tracking';

interface GestureRingOverlayProps {
  cursorPosition: Point2D | null;
  activeGesture: GestureType;
  holdProgress: number; // 0 to 1 for clear hold
  drawStartProgress: number; // 0 to 1 for 2s draw start activation
  width: number;
  height: number;
  brushSize: number;
  brushColor: string;
}

export const GestureRingOverlay: React.FC<GestureRingOverlayProps> = ({
  cursorPosition,
  activeGesture,
  holdProgress,
  drawStartProgress,
  width,
  height,
  brushSize,
  brushColor,
}) => {
  if (!cursorPosition) return null;

  const cx = cursorPosition.x * width;
  const cy = cursorPosition.y * height;

  const ringRadius = 40;
  const circumference = 2 * Math.PI * ringRadius;
  
  const isHoldingClear = activeGesture === 'CLEAR_HOLD';
  const clearDashOffset = circumference - holdProgress * circumference;

  const isStartingDraw = drawStartProgress > 0 && drawStartProgress < 1.0;
  const drawStartDashOffset = circumference - drawStartProgress * circumference;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {/* 2-SECOND HOLD-TO-START ACTIVATION RING */}
      {isStartingDraw && (
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center transition-all duration-75"
          style={{ left: `${cx}px`, top: `${cy}px` }}
        >
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r={ringRadius}
              className="stroke-cyan-950/80 fill-none"
              strokeWidth="5"
            />
            <circle
              cx="48"
              cy="48"
              r={ringRadius}
              className="stroke-cyan-400 fill-none transition-all duration-75 ease-linear"
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={drawStartDashOffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold font-mono text-cyan-300 animate-pulse">STARTING</span>
            <span className="text-xs font-black font-mono text-white">
              {Math.round(drawStartProgress * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* DRAWING INK TIP CURSOR */}
      {activeGesture === 'DRAW' && (
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-75"
          style={{
            left: `${cx}px`,
            top: `${cy}px`,
            width: `${Math.max(12, brushSize)}px`,
            height: `${Math.max(12, brushSize)}px`,
            backgroundColor: brushColor,
            boxShadow: `0 0 16px ${brushColor}, 0 0 4px #fff`,
            border: '2px solid #ffffff',
          }}
        />
      )}

      {/* Hold-to-Clear SVG Countdown Circle Overlay */}
      {isHoldingClear && (
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center"
          style={{ left: `${cx}px`, top: `${cy}px` }}
        >
          <svg className="w-28 h-28 transform -rotate-90">
            <circle
              cx="56"
              cy="56"
              r={45}
              className="stroke-gray-700/60 fill-none"
              strokeWidth="6"
            />
            <circle
              cx="56"
              cy="56"
              r={45}
              className="stroke-red-500 fill-none transition-all duration-75 ease-linear"
              strokeWidth="6"
              strokeDasharray={2 * Math.PI * 45}
              strokeDashoffset={clearDashOffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs font-bold font-mono text-red-400 animate-pulse">CLEARING</span>
            <span className="text-sm font-black font-mono text-white">
              {Math.round(holdProgress * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
