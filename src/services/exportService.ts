import type { Stroke } from '../types/canvas';
import { exportStrokesToSVG } from '../utils/canvasRenderer';

/**
 * Downloads drawing as an SVG vector file
 */
export function downloadSVG(strokes: Stroke[], width: number, height: number, filename = 'air-canvas-drawing.svg') {
  const svgString = exportStrokesToSVG(strokes, width, height);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Captures current drawing canvas (or combined view) as a high-resolution PNG image download
 */
export function downloadPNG(canvas: HTMLCanvasElement, filename = 'air-canvas-snapshot.png') {
  if (!canvas) return;

  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
