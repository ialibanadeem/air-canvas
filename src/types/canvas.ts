import type { Point2D } from './tracking';

export type BrushStyle = 'solid' | 'glow' | 'neon' | 'marker' | 'pencil' | 'highlighter';

export type ViewportMode = 'camera' | 'canvas' | 'presentation';

export type BackgroundPreset = 'dark-grid' | 'blueprint' | 'deep-space' | 'studio-white' | 'minimal-dark';

export interface BrushSettings {
  color: string;
  size: number; // 1 to 50
  opacity: number; // 0 to 100
  style: BrushStyle;
  smoothing: number; // 0 to 100
  eraserSize: number; // 10 to 120
  handwritingMode: boolean; // Enables 1Euro smoothing
}

export interface Stroke {
  id: string;
  points: Point2D[];
  color: string;
  size: number;
  opacity: number;
  style: BrushStyle;
  timestamp: number;
}

export interface CanvasHistory {
  strokes: Stroke[];
  undoStack: Stroke[];
}
