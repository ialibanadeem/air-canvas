export type GestureType = 'START_HOLD' | 'DRAW' | 'ERASE' | 'CLEAR_HOLD' | 'PAUSE' | 'NONE';

export interface Point3D {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface Point2D {
  x: number;
  y: number;
  pressure?: number;
  timestamp?: number;
}

export interface GestureState {
  activeGesture: GestureType;
  confidence: number;
  holdProgress: number; // 0 to 1 for hold-to-clear countdown
  drawStartProgress: number; // 0 to 1 for 2-second hold-to-draw activation
  cursorPosition: Point2D | null;
  indexTipPosition: Point2D | null;
  handDetected: boolean;
  landmarks: Point3D[] | null;
}

export interface TelemetryData {
  fps: number;
  latencyMs: number;
  confidence: number;
  gesture: GestureType;
  strokeCount: number;
  totalPointsCount: number;
  resolution: string;
  handCount: number;
}
