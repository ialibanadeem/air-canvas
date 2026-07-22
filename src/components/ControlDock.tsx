import React from 'react';
import {
  PenTool,
  Sparkles,
  Zap,
  Highlighter,
  Pencil,
  Square,
  Eraser,
  Palette,
} from 'lucide-react';
import type { BrushSettings, BrushStyle } from '../types/canvas';
import type { GestureType } from '../types/tracking';

interface ControlDockProps {
  brushSettings: BrushSettings;
  setBrushSettings: React.Dispatch<React.SetStateAction<BrushSettings>>;
  isEraserActive: boolean;
  setIsEraserActive: (active: boolean | ((prev: boolean) => boolean)) => void;
  activeGesture: GestureType;
  onQuickClear: () => void;
}

const PRESET_COLORS = [
  '#00f0ff', // Neon Cyan
  '#ec4899', // Neon Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ffffff', // Pure White
  '#ef4444', // Red
  '#3b82f6', // Electric Blue
];

const BRUSH_STYLES: { id: BrushStyle; name: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'solid', name: 'Solid', icon: PenTool },
  { id: 'glow', name: 'Glow', icon: Sparkles },
  { id: 'neon', name: 'Neon', icon: Zap },
  { id: 'marker', name: 'Marker', icon: Square },
  { id: 'pencil', name: 'Pencil', icon: Pencil },
  { id: 'highlighter', name: 'Highlighter', icon: Highlighter },
];

export const ControlDock: React.FC<ControlDockProps> = ({
  brushSettings,
  setBrushSettings,
  isEraserActive,
  setIsEraserActive,
}) => {
  return (
    <div className="floating-control-dock">
      {/* Eraser Tool Toggle */}
      <button
        className={`dock-tool-btn ${isEraserActive ? 'active-eraser' : ''}`}
        onClick={() => setIsEraserActive((prev) => !prev)}
        title="Toggle Eraser Mode"
      >
        <Eraser className="w-4 h-4" />
        <span>Eraser</span>
      </button>

      <div className="dock-divider" />

      {/* Brush Styles Selector */}
      <div className="dock-style-selector">
        {BRUSH_STYLES.map((style) => {
          const Icon = style.icon;
          const isActive = !isEraserActive && brushSettings.style === style.id;
          return (
            <button
              key={style.id}
              className={`style-btn ${isActive ? 'active' : ''}`}
              onClick={() => {
                setIsEraserActive(false);
                setBrushSettings((prev) => ({ ...prev, style: style.id }));
              }}
              title={`${style.name} Brush`}
            >
              <Icon className="w-4 h-4" />
              <span>{style.name}</span>
            </button>
          );
        })}
      </div>

      <div className="dock-divider" />

      {/* Color Swatches */}
      <div className="dock-color-swatches">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            className={`swatch-btn ${brushSettings.color === color && !isEraserActive ? 'active' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => {
              setIsEraserActive(false);
              setBrushSettings((prev) => ({ ...prev, color }));
            }}
            title={`Select ${color}`}
          />
        ))}

        <label className="custom-color-picker-label" title="Custom Color Picker">
          <Palette className="w-4 h-4 text-gray-300 hover:text-white" />
          <input
            type="color"
            value={brushSettings.color}
            onChange={(e) => {
              setIsEraserActive(false);
              setBrushSettings((prev) => ({ ...prev, color: e.target.value }));
            }}
            className="sr-only"
          />
        </label>
      </div>

      <div className="dock-divider" />

      {/* Size Slider Quick Control */}
      <div className="dock-size-control">
        <span className="text-xs text-gray-400 font-medium">Size</span>
        <input
          type="range"
          min="1"
          max="50"
          value={brushSettings.size}
          onChange={(e) =>
            setBrushSettings((prev) => ({ ...prev, size: Number(e.target.value) }))
          }
          className="dock-slider"
        />
        <span className="size-indicator-pill">{brushSettings.size}px</span>
      </div>
    </div>
  );
};
