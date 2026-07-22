import type { Point3D, GestureType } from '../types/tracking';

export interface GestureResult {
  gesture: GestureType;
  confidence: number;
  cursorPoint: { x: number; y: number } | null;
  indexTip: { x: number; y: number } | null;
}

export function detectGesture(landmarks: Point3D[] | null): GestureResult {
  if (!landmarks || landmarks.length < 21) {
    return {
      gesture: 'NONE',
      confidence: 0,
      cursorPoint: null,
      indexTip: null,
    };
  }

  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const thumbIp = landmarks[3];

  const indexTip = landmarks[8];
  const indexPip = landmarks[6];
  const indexMcp = landmarks[5];

  const middleTip = landmarks[12];
  const middlePip = landmarks[10];

  const ringTip = landmarks[16];
  const ringPip = landmarks[14];

  const pinkyTip = landmarks[20];
  const pinkyPip = landmarks[18];

  // Distances from wrist to tips & PIP joints
  const distIndex = Math.hypot(indexTip.x - wrist.x, indexTip.y - wrist.y);
  const distMiddle = Math.hypot(middleTip.x - wrist.x, middleTip.y - wrist.y);
  const distRing = Math.hypot(ringTip.x - wrist.x, ringTip.y - wrist.y);
  const distPinky = Math.hypot(pinkyTip.x - wrist.x, pinkyTip.y - wrist.y);
  const distThumb = Math.hypot(thumbTip.x - wrist.x, thumbTip.y - wrist.y);

  const distIndexPip = Math.hypot(indexPip.x - wrist.x, indexPip.y - wrist.y);
  const distMiddlePip = Math.hypot(middlePip.x - wrist.x, middlePip.y - wrist.y);
  const distRingPip = Math.hypot(ringPip.x - wrist.x, ringPip.y - wrist.y);
  const distPinkyPip = Math.hypot(pinkyPip.x - wrist.x, pinkyPip.y - wrist.y);
  const distThumbIp = Math.hypot(thumbIp.x - wrist.x, thumbIp.y - wrist.y);

  // Extension checks
  const indexIsExtended = distIndex > distIndexPip * 1.12;
  const middleIsExtended = distMiddle > distMiddlePip * 1.12;
  const ringIsExtended = distRing > distRingPip * 1.12;
  const pinkyIsExtended = distPinky > distPinkyPip * 1.12;
  const thumbIsExtended = distThumb > distThumbIp * 1.1;

  const rawIndexPos = { x: indexTip.x, y: indexTip.y };

  // 1. OPEN PALM (Clear Canvas Hold Gesture)
  if (indexIsExtended && middleIsExtended && ringIsExtended && pinkyIsExtended && thumbIsExtended) {
    const palmCenter = {
      x: (wrist.x + indexMcp.x + landmarks[17].x) / 3,
      y: (wrist.y + indexMcp.y + landmarks[17].y) / 3,
    };
    return {
      gesture: 'CLEAR_HOLD',
      confidence: 0.95,
      cursorPoint: palmCenter,
      indexTip: rawIndexPos,
    };
  }

  // 2. ERASER (Index + Middle extended together, Ring & Pinky folded)
  if (indexIsExtended && middleIsExtended && !ringIsExtended && !pinkyIsExtended) {
    const eraserCursor = {
      x: (indexTip.x + middleTip.x) / 2,
      y: (indexTip.y + middleTip.y) / 2,
    };
    return {
      gesture: 'ERASE',
      confidence: 0.92,
      cursorPoint: eraserCursor,
      indexTip: rawIndexPos,
    };
  }

  // 3. DRAWING (Only Index Finger Extended -> PEN DOWN)
  // Index must be extended AND middle finger folded
  if (indexIsExtended && !middleIsExtended && distIndex > distMiddle * 1.08) {
    return {
      gesture: 'DRAW',
      confidence: 0.96,
      cursorPoint: rawIndexPos,
      indexTip: rawIndexPos,
    };
  }

  // 4. PEN UP / PAUSE / FIST (Index folded or fist -> LIFT PEN / END STROKE)
  return {
    gesture: 'PAUSE',
    confidence: 0.9,
    cursorPoint: rawIndexPos,
    indexTip: rawIndexPos,
  };
}
