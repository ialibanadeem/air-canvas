import type { Stroke } from '../types/canvas';

/**
 * Renders all completed strokes and current active stroke onto an HTML5 Canvas 2D context.
 */
export function renderCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  strokes: Stroke[],
  activeStroke: Stroke | null,
  activeEraser: { position: { x: number; y: number }; size: number } | null
) {
  ctx.clearRect(0, 0, width, height);

  // Enable high quality anti-aliasing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. Draw all saved strokes
  for (const stroke of strokes) {
    drawSingleStroke(ctx, stroke, width, height);
  }

  // 2. Draw current active drawing stroke
  if (activeStroke && activeStroke.points.length > 0) {
    drawSingleStroke(ctx, activeStroke, width, height);
  }

  // 3. Draw active eraser preview cursor if erasing
  if (activeEraser) {
    drawEraserCursor(ctx, activeEraser.position, activeEraser.size, width, height);
  }
}

/**
 * Draws a single stroke according to its brush style (Apple Pencil Vector Ink Shaders)
 */
export function drawSingleStroke(
  ctx: CanvasRenderingContext2D,
  stroke: Stroke,
  canvasWidth: number,
  canvasHeight: number
) {
  if (stroke.points.length < 2) return;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const alpha = stroke.opacity / 100;

  switch (stroke.style) {
    case 'solid': {
      // Apple Pencil Fluid Ink Shader
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.shadowBlur = 0;

      drawPathPointsSmooth(ctx, stroke.points, canvasWidth, canvasHeight);
      ctx.stroke();
      break;
    }

    case 'glow': {
      // Pass 1: Blurred Glow Aura
      ctx.globalAlpha = alpha * 0.75;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size * 1.8;
      ctx.shadowColor = stroke.color;
      ctx.shadowBlur = stroke.size * 1.8;
      drawPathPointsSmooth(ctx, stroke.points, canvasWidth, canvasHeight);
      ctx.stroke();

      // Pass 2: Bright Core
      ctx.globalAlpha = alpha;
      ctx.shadowBlur = 0;
      ctx.lineWidth = stroke.size * 0.8;
      ctx.strokeStyle = '#ffffff';
      drawPathPointsSmooth(ctx, stroke.points, canvasWidth, canvasHeight);
      ctx.stroke();
      break;
    }

    case 'neon': {
      // Pass 1: Wide Outer Cyan/Magenta Aura
      ctx.globalAlpha = alpha * 0.5;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size * 2.4;
      ctx.shadowColor = stroke.color;
      ctx.shadowBlur = stroke.size * 2.8;
      drawPathPointsSmooth(ctx, stroke.points, canvasWidth, canvasHeight);
      ctx.stroke();

      // Pass 2: Intense Neon Mid-Tone
      ctx.globalAlpha = alpha * 0.9;
      ctx.lineWidth = stroke.size * 1.3;
      ctx.shadowBlur = stroke.size;
      drawPathPointsSmooth(ctx, stroke.points, canvasWidth, canvasHeight);
      ctx.stroke();

      // Pass 3: White Hot Core
      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;
      ctx.lineWidth = Math.max(2, stroke.size * 0.55);
      ctx.strokeStyle = '#ffffff';
      drawPathPointsSmooth(ctx, stroke.points, canvasWidth, canvasHeight);
      ctx.stroke();
      break;
    }

    case 'marker': {
      ctx.globalAlpha = alpha * 0.65;
      ctx.lineCap = 'square';
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size * 1.4;
      drawPathPointsSmooth(ctx, stroke.points, canvasWidth, canvasHeight);
      ctx.stroke();
      break;
    }

    case 'pencil': {
      ctx.globalAlpha = alpha * 0.85;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = Math.max(1, stroke.size * 0.6);

      // Main line
      drawPathPointsSmooth(ctx, stroke.points, canvasWidth, canvasHeight);
      ctx.stroke();

      // Parallel subtle sketch line for graphite texture
      ctx.beginPath();
      for (let i = 0; i < stroke.points.length; i++) {
        const pt = stroke.points[i];
        const px = pt.x * canvasWidth + 1.2;
        const py = pt.y * canvasHeight - 1.2;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.globalAlpha = alpha * 0.35;
      ctx.stroke();
      break;
    }

    case 'highlighter': {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = alpha * 0.4;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size * 2.5;
      ctx.lineCap = 'square';
      drawPathPointsSmooth(ctx, stroke.points, canvasWidth, canvasHeight);
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}

/**
 * Apple Pencil Cubic Bezier Curve Fitting for smooth vector curves
 */
function drawPathPointsSmooth(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  canvasWidth: number,
  canvasHeight: number
) {
  ctx.beginPath();
  if (points.length === 0) return;

  const p0 = points[0];
  const startX = p0.x * canvasWidth;
  const startY = p0.y * canvasHeight;
  ctx.moveTo(startX, startY);

  if (points.length === 2) {
    ctx.lineTo(points[1].x * canvasWidth, points[1].y * canvasHeight);
    return;
  }

  for (let i = 1; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const midX = ((p1.x + p2.x) / 2) * canvasWidth;
    const midY = ((p1.y + p2.y) / 2) * canvasHeight;
    ctx.quadraticCurveTo(p1.x * canvasWidth, p1.y * canvasHeight, midX, midY);
  }

  const lastPt = points[points.length - 1];
  ctx.lineTo(lastPt.x * canvasWidth, lastPt.y * canvasHeight);
}

/**
 * Renders Eraser Cursor Indicator
 */
function drawEraserCursor(
  ctx: CanvasRenderingContext2D,
  pos: { x: number; y: number },
  radius: number,
  canvasWidth: number,
  canvasHeight: number
) {
  const cx = pos.x * canvasWidth;
  const cy = pos.y * canvasHeight;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
  ctx.fill();

  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#ef4444';
  ctx.setLineDash([4, 4]);
  ctx.stroke();
  ctx.restore();
}

/**
 * Erases points from strokes within specified radius
 */
export function eraseStrokesInRadius(
  strokes: Stroke[],
  eraserPos: { x: number; y: number },
  eraserRadiusPx: number,
  canvasWidth: number,
  canvasHeight: number
): Stroke[] {
  const normRadiusX = eraserRadiusPx / canvasWidth;
  const normRadiusY = eraserRadiusPx / canvasHeight;
  const maxNormDistSq = normRadiusX * normRadiusY;

  const remainingStrokes: Stroke[] = [];

  for (const stroke of strokes) {
    const filteredPoints = stroke.points.filter((pt) => {
      const dx = pt.x - eraserPos.x;
      const dy = pt.y - eraserPos.y;
      return dx * dx + dy * dy > maxNormDistSq;
    });

    if (filteredPoints.length >= 2) {
      remainingStrokes.push({
        ...stroke,
        points: filteredPoints,
      });
    }
  }

  return remainingStrokes;
}

/**
 * Converts stored vector strokes into resolution-independent SVG String
 */
export function exportStrokesToSVG(strokes: Stroke[], width: number, height: number): string {
  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">\n`;
  svgContent += `  <rect width="100%" height="100%" fill="#0b0f19" />\n`;

  for (const stroke of strokes) {
    if (stroke.points.length < 2) continue;

    let pathD = '';
    const startX = stroke.points[0].x * width;
    const startY = stroke.points[0].y * height;
    pathD += `M ${startX.toFixed(1)} ${startY.toFixed(1)} `;

    for (let i = 1; i < stroke.points.length; i++) {
      const pt = stroke.points[i];
      pathD += `L ${(pt.x * width).toFixed(1)} ${(pt.y * height).toFixed(1)} `;
    }

    const opacity = stroke.opacity / 100;
    svgContent += `  <path d="${pathD.trim()}" stroke="${stroke.color}" stroke-width="${stroke.size}" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="${opacity}" />\n`;
  }

  svgContent += `</svg>`;
  return svgContent;
}
