import type { Point2D } from '../types/tracking';

/**
 * Dual-pass Sub-pixel Low-Pass Filter for silky smooth finger tracking.
 * Filters out high-frequency camera noise and micro hand tremors.
 */
export class TemporalSmoother {
  private prevX: number | null = null;
  private prevY: number | null = null;
  private velX: number = 0;
  private velY: number = 0;

  public reset() {
    this.prevX = null;
    this.prevY = null;
    this.velX = 0;
    this.velY = 0;
  }

  public smooth(rawX: number, rawY: number, smoothingPower: number): Point2D {
    if (this.prevX === null || this.prevY === null) {
      this.prevX = rawX;
      this.prevY = rawY;
      return { x: rawX, y: rawY, timestamp: Date.now() };
    }

    // Adaptive smoothing factor based on smoothing power (alpha: 0.35 to 0.65)
    const baseAlpha = Math.max(0.25, 0.70 - (smoothingPower / 100) * 0.45);

    // Calculate displacement
    const dx = rawX - this.prevX;
    const dy = rawY - this.prevY;

    // Velocity-aware smoothing: smooth slow shivers heavily, follow fast motion accurately
    this.velX = 0.5 * this.velX + 0.5 * dx;
    this.velY = 0.5 * this.velY + 0.5 * dy;

    const speed = Math.hypot(this.velX, this.velY);
    const dynamicAlpha = Math.min(0.85, baseAlpha + speed * 1.5);

    const smoothedX = this.prevX + dynamicAlpha * dx;
    const smoothedY = this.prevY + dynamicAlpha * dy;

    this.prevX = smoothedX;
    this.prevY = smoothedY;

    return {
      x: smoothedX,
      y: smoothedY,
      timestamp: Date.now(),
    };
  }
}

/**
 * Chaikin Subdivision for smooth vector curve rendering.
 */
export function chaikinSubdivide(points: Point2D[], iterations = 2): Point2D[] {
  if (points.length < 3) return points;

  let current = points;

  for (let it = 0; it < iterations; it++) {
    const next: Point2D[] = [current[0]];

    for (let i = 0; i < current.length - 1; i++) {
      const p0 = current[i];
      const p1 = current[i + 1];

      const q = {
        x: 0.75 * p0.x + 0.25 * p1.x,
        y: 0.75 * p0.y + 0.25 * p1.y,
        timestamp: p0.timestamp,
      };
      const r = {
        x: 0.25 * p0.x + 0.75 * p1.x,
        y: 0.25 * p0.y + 0.75 * p1.y,
        timestamp: p1.timestamp,
      };

      next.push(q, r);
    }

    next.push(current[current.length - 1]);
    current = next;
  }

  return current;
}

/**
 * Centripetal Catmull-Rom Spline Interpolation.
 */
export function interpolateCatmullRom(
  p0: Point2D,
  p1: Point2D,
  p2: Point2D,
  p3: Point2D,
  steps: number = 4
): Point2D[] {
  const points: Point2D[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const t2 = t * t;
    const t3 = t2 * t;

    const x =
      0.5 *
      (2 * p1.x +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);

    const y =
      0.5 *
      (2 * p1.y +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);

    points.push({ x, y, timestamp: Date.now() });
  }

  return points;
}

/**
 * Ultra-smooth vector stroke generator.
 */
export function generateSmoothStrokePoints(rawPoints: Point2D[], smoothingPower: number): Point2D[] {
  if (rawPoints.length < 2) return rawPoints;

  const filtered: Point2D[] = [rawPoints[0]];
  const minDistSq = 0.000001; // ~1px

  for (let i = 1; i < rawPoints.length; i++) {
    const last = filtered[filtered.length - 1];
    const curr = rawPoints[i];
    const distSq = (curr.x - last.x) ** 2 + (curr.y - last.y) ** 2;
    if (distSq >= minDistSq || i === rawPoints.length - 1) {
      filtered.push(curr);
    }
  }

  if (filtered.length < 3) return filtered;

  const chaikinPoints = chaikinSubdivide(filtered, 2);
  const result: Point2D[] = [chaikinPoints[0]];

  for (let i = 0; i < chaikinPoints.length - 1; i++) {
    const p0 = i > 0 ? chaikinPoints[i - 1] : chaikinPoints[i];
    const p1 = chaikinPoints[i];
    const p2 = chaikinPoints[i + 1];
    const p3 = i < chaikinPoints.length - 2 ? chaikinPoints[i + 2] : p2;

    const steps = Math.min(6, Math.max(3, Math.floor(smoothingPower / 16)));
    const interpolated = interpolateCatmullRom(p0, p1, p2, p3, steps);

    result.push(...interpolated.slice(1));
  }

  return result;
}
