import React from 'react';
import {
  Camera,
  Layers,
  Presentation,
  FlipHorizontal,
  Download,
  Sliders,
  RotateCcw,
  RotateCw,
  Trash2,
  Maximize2,
  Minimize2,
  Sparkles,
  HelpCircle,
  Pencil,
} from 'lucide-react';
import type { ViewportMode, BrushSettings } from '../types/canvas';

interface NavigationProps {
  viewportMode: ViewportMode;
  setViewportMode: (mode: ViewportMode) => void;
  mirrorCamera: boolean;
  setMirrorCamera: (mirror: boolean | ((prev: boolean) => boolean)) => void;
  onOpenGestureGuide: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onClearCanvas: () => void;
  onExportPNG: () => void;
  onExportSVG: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  brushSettings: BrushSettings;
  setBrushSettings: React.Dispatch<React.SetStateAction<BrushSettings>>;
}

export const Navigation: React.FC<NavigationProps> = ({
  viewportMode,
  setViewportMode,
  mirrorCamera,
  setMirrorCamera,
  onOpenGestureGuide,
  onToggleSidebar,
  isSidebarOpen,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onClearCanvas,
  onExportPNG,
  onExportSVG,
  isFullscreen,
  onToggleFullscreen,
  brushSettings,
  setBrushSettings,
}) => {
  return (
    <header className="top-nav-bar">
      <div className="nav-brand">
        <div className="nav-logo-icon">
          <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
        </div>
        <div className="nav-title-block">
          <h1 className="nav-title">AIR CANVAS</h1>
          <span className="nav-subtitle">Computer Vision Studio</span>
        </div>
      </div>

      {/* Center Viewport Selector (Desktop Only) */}
      <div className="nav-mode-selector">
        <button
          className={`mode-btn ${viewportMode === 'camera' ? 'active' : ''}`}
          onClick={() => setViewportMode('camera')}
          title="Camera View (Webcam + Glass Drawing)"
        >
          <Camera className="w-4 h-4" />
          <span>Camera</span>
        </button>
        <button
          className={`mode-btn ${viewportMode === 'canvas' ? 'active' : ''}`}
          onClick={() => setViewportMode('canvas')}
          title="Canvas View (Glass Canvas with Backdrop)"
        >
          <Layers className="w-4 h-4" />
          <span>Canvas</span>
        </button>
        <button
          className={`mode-btn ${viewportMode === 'presentation' ? 'active' : ''}`}
          onClick={() => setViewportMode('presentation')}
          title="Presentation View (Clean Composite Output)"
        >
          <Presentation className="w-4 h-4" />
          <span>Presentation</span>
        </button>
      </div>

      {/* Mobile Web Exclusive Minimal Top Controls */}
      <div className="mobile-header-controls">
        {/* Pens: Pencil & Glow */}
        <button
          className={`mobile-pen-btn ${brushSettings.style === 'pencil' ? 'active' : ''}`}
          onClick={() => setBrushSettings((prev) => ({ ...prev, style: 'pencil' }))}
          title="Pencil Brush"
        >
          <Pencil className="w-3.5 h-3.5" />
          <span>Pencil</span>
        </button>
        <button
          className={`mobile-pen-btn ${brushSettings.style === 'glow' ? 'active' : ''}`}
          onClick={() => setBrushSettings((prev) => ({ ...prev, style: 'glow' }))}
          title="Glow Brush"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Glow</span>
        </button>

        <div className="mobile-nav-divider" />

        {/* Colors: Pink & Blue */}
        <button
          className={`mobile-swatch ${brushSettings.color === '#ec4899' ? 'active' : ''}`}
          style={{ backgroundColor: '#ec4899' }}
          onClick={() => setBrushSettings((prev) => ({ ...prev, color: '#ec4899' }))}
          title="Pink"
        />
        <button
          className={`mobile-swatch ${brushSettings.color === '#3b82f6' ? 'active' : ''}`}
          style={{ backgroundColor: '#3b82f6' }}
          onClick={() => setBrushSettings((prev) => ({ ...prev, color: '#3b82f6' }))}
          title="Blue"
        />
      </div>

      {/* Right Desktop Controls */}
      <div className="nav-actions">
        <button
          className={`icon-action-btn ${mirrorCamera ? 'active' : ''}`}
          onClick={() => setMirrorCamera((prev) => !prev)}
          title={`Mirror Camera: ${mirrorCamera ? 'ON' : 'OFF'}`}
        >
          <FlipHorizontal className="w-4 h-4" />
        </button>

        <div className="nav-divider" />

        <button
          className="icon-action-btn"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          className="icon-action-btn"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <button className="icon-action-btn text-red-400 hover:text-red-300" onClick={onClearCanvas} title="Clear Canvas">
          <Trash2 className="w-4 h-4" />
        </button>

        <div className="nav-divider" />

        <div className="export-dropdown-group">
          <button className="nav-btn-primary" onClick={onExportPNG} title="Export PNG Image">
            <Download className="w-4 h-4" />
            <span>PNG</span>
          </button>
          <button className="nav-btn-secondary" onClick={onExportSVG} title="Export SVG Vector">
            <span>SVG</span>
          </button>
        </div>

        <button
          className="icon-action-btn text-cyan-400 hover:text-cyan-300"
          onClick={onOpenGestureGuide}
          title="Hand Gesture Instructions Guide"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          className={`icon-action-btn ${isSidebarOpen ? 'active' : ''}`}
          onClick={onToggleSidebar}
          title="Toggle Controls Sidebar"
        >
          <Sliders className="w-4 h-4" />
        </button>

        <button
          className="icon-action-btn"
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Mode'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
