import React, { useState } from 'react';
import { X, Sparkles, Sliders, Eye, Check } from 'lucide-react';
import type { GlassSettings, GlassPreset } from '../types/glass';
import { GLASS_PRESETS } from '../types/glass';
import type { BrushSettings, BackgroundPreset } from '../types/canvas';

interface SidebarPanelProps {
  isOpen: boolean;
  onClose: () => void;
  glassSettings: GlassSettings;
  setGlassSettings: React.Dispatch<React.SetStateAction<GlassSettings>>;
  brushSettings: BrushSettings;
  setBrushSettings: React.Dispatch<React.SetStateAction<BrushSettings>>;
  backgroundPreset: BackgroundPreset;
  setBackgroundPreset: (preset: BackgroundPreset) => void;
}

export const SidebarPanel: React.FC<SidebarPanelProps> = ({
  isOpen,
  onClose,
  glassSettings,
  setGlassSettings,
  brushSettings,
  setBrushSettings,
  backgroundPreset,
  setBackgroundPreset,
}) => {
  const [activeTab, setActiveTab] = useState<'glass' | 'brush' | 'canvas'>('glass');

  if (!isOpen) return null;

  const handleApplyPreset = (preset: GlassPreset) => {
    if (preset === 'custom') {
      setGlassSettings((prev) => ({ ...prev, mode: 'custom' }));
    } else {
      setGlassSettings({
        mode: preset,
        ...GLASS_PRESETS[preset],
      });
    }
  };

  return (
    <aside className="sidebar-drawer">
      <div className="sidebar-header">
        <div className="sidebar-tabs">
          <button
            className={`tab-btn ${activeTab === 'glass' ? 'active' : ''}`}
            onClick={() => setActiveTab('glass')}
          >
            <Sparkles className="w-4 h-4" />
            <span>Virtual Glass</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'brush' ? 'active' : ''}`}
            onClick={() => setActiveTab('brush')}
          >
            <Sliders className="w-4 h-4" />
            <span>Brush & Physics</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'canvas' ? 'active' : ''}`}
            onClick={() => setActiveTab('canvas')}
          >
            <Eye className="w-4 h-4" />
            <span>Backdrop</span>
          </button>
        </div>
        <button className="sidebar-close-btn" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="sidebar-body">
        {/* TAB 1: GLASS SETTINGS */}
        {activeTab === 'glass' && (
          <div className="settings-section">
            <h3 className="section-title">Glass Canvas Presets</h3>
            <div className="preset-grid">
              {(['clear', 'frosted', 'dark', 'neon', 'custom'] as GlassPreset[]).map((preset) => (
                <button
                  key={preset}
                  className={`preset-card ${glassSettings.mode === preset ? 'active' : ''}`}
                  onClick={() => handleApplyPreset(preset)}
                >
                  <span className="preset-name">{preset.toUpperCase()}</span>
                  {glassSettings.mode === preset && <Check className="w-4 h-4 text-cyan-400" />}
                </button>
              ))}
            </div>

            <hr className="sidebar-divider" />

            <h3 className="section-title">Glass Optics & Layers</h3>

            {/* Opacity */}
            <div className="control-group">
              <div className="control-label">
                <span>Glass Opacity</span>
                <span className="control-val">{glassSettings.opacity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={glassSettings.opacity}
                onChange={(e) =>
                  setGlassSettings((prev) => ({
                    ...prev,
                    mode: 'custom',
                    opacity: Number(e.target.value),
                  }))
                }
                className="custom-range-slider"
              />
            </div>

            {/* Blur Intensity */}
            <div className="control-group">
              <div className="control-label">
                <span>Frosted Blur Intensity</span>
                <span className="control-val">{glassSettings.blur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={glassSettings.blur}
                onChange={(e) =>
                  setGlassSettings((prev) => ({
                    ...prev,
                    mode: 'custom',
                    blur: Number(e.target.value),
                  }))
                }
                className="custom-range-slider"
              />
            </div>

            {/* Tint Color */}
            <div className="control-group">
              <div className="control-label">
                <span>Glass Surface Tint</span>
                <div className="color-swatch-row">
                  <div
                    className="color-preview-circle"
                    style={{ backgroundColor: glassSettings.tintColor }}
                  />
                  <input
                    type="color"
                    value={glassSettings.tintColor}
                    onChange={(e) =>
                      setGlassSettings((prev) => ({
                        ...prev,
                        mode: 'custom',
                        tintColor: e.target.value,
                      }))
                    }
                    className="custom-color-input"
                  />
                </div>
              </div>
            </div>

            <hr className="sidebar-divider" />

            <h3 className="section-title">Glass Aesthetics & Effects</h3>

            <div className="toggle-row">
              <span>Subtle Glass Border</span>
              <button
                className={`toggle-switch ${glassSettings.border ? 'on' : ''}`}
                onClick={() =>
                  setGlassSettings((prev) => ({ ...prev, mode: 'custom', border: !prev.border }))
                }
              >
                <span className="toggle-thumb" />
              </button>
            </div>

            <div className="toggle-row">
              <span>Light Reflection Highlights</span>
              <button
                className={`toggle-switch ${glassSettings.reflection ? 'on' : ''}`}
                onClick={() =>
                  setGlassSettings((prev) => ({
                    ...prev,
                    mode: 'custom',
                    reflection: !prev.reflection,
                  }))
                }
              >
                <span className="toggle-thumb" />
              </button>
            </div>

            <div className="toggle-row">
              <span>Ambient Outer Glow</span>
              <button
                className={`toggle-switch ${glassSettings.glow ? 'on' : ''}`}
                onClick={() =>
                  setGlassSettings((prev) => ({ ...prev, mode: 'custom', glow: !prev.glow }))
                }
              >
                <span className="toggle-thumb" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: BRUSH & PHYSICS SETTINGS */}
        {activeTab === 'brush' && (
          <div className="settings-section">
            <h3 className="section-title">Brush Stroke Properties</h3>

            {/* Brush Size */}
            <div className="control-group">
              <div className="control-label">
                <span>Brush Diameter</span>
                <span className="control-val">{brushSettings.size}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={brushSettings.size}
                onChange={(e) =>
                  setBrushSettings((prev) => ({ ...prev, size: Number(e.target.value) }))
                }
                className="custom-range-slider"
              />
            </div>

            {/* Brush Opacity */}
            <div className="control-group">
              <div className="control-label">
                <span>Stroke Opacity</span>
                <span className="control-val">{brushSettings.opacity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={brushSettings.opacity}
                onChange={(e) =>
                  setBrushSettings((prev) => ({ ...prev, opacity: Number(e.target.value) }))
                }
                className="custom-range-slider"
              />
            </div>

            <hr className="sidebar-divider" />

            <h3 className="section-title">Hand Motion Physics & Smoothing</h3>

            <div className="toggle-row">
              <span>1Euro Adaptive Low-Pass Filter</span>
              <button
                className={`toggle-switch ${brushSettings.handwritingMode ? 'on' : ''}`}
                onClick={() =>
                  setBrushSettings((prev) => ({ ...prev, handwritingMode: !prev.handwritingMode }))
                }
              >
                <span className="toggle-thumb" />
              </button>
            </div>

            {/* Smoothing Power */}
            <div className="control-group">
              <div className="control-label">
                <span>Jitter Reduction & Smoothing</span>
                <span className="control-val">{brushSettings.smoothing}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={brushSettings.smoothing}
                onChange={(e) =>
                  setBrushSettings((prev) => ({ ...prev, smoothing: Number(e.target.value) }))
                }
                className="custom-range-slider"
              />
              <p className="text-xs text-gray-400 mt-1">
                Catmull-Rom spline curves and 1Euro adaptive low-pass filter eliminate tracking jitter for clean air writing.
              </p>
            </div>

            <hr className="sidebar-divider" />

            <h3 className="section-title">Eraser Radius</h3>

            <div className="control-group">
              <div className="control-label">
                <span>Eraser Circle Radius</span>
                <span className="control-val">{brushSettings.eraserSize}px</span>
              </div>
              <input
                type="range"
                min="10"
                max="120"
                value={brushSettings.eraserSize}
                onChange={(e) =>
                  setBrushSettings((prev) => ({ ...prev, eraserSize: Number(e.target.value) }))
                }
                className="custom-range-slider"
              />
            </div>
          </div>
        )}

        {/* TAB 3: BACKDROP SETTINGS */}
        {activeTab === 'canvas' && (
          <div className="settings-section">
            <h3 className="section-title">Canvas Backdrop Preset</h3>
            <div className="backdrop-preset-list">
              {[
                { id: 'dark-grid', name: 'Dark Isometric Grid', desc: 'Sleek dark grid background' },
                { id: 'blueprint', name: 'Cyber Blueprint', desc: 'Technical blue architect grid' },
                { id: 'deep-space', name: 'Deep Space Nebula', desc: 'Dark cosmic gradient' },
                { id: 'minimal-dark', name: 'Minimal Charcoal', desc: 'Clean dark studio background' },
                { id: 'studio-white', name: 'Studio White Glass', desc: 'Clean bright workspace' },
              ].map((b) => (
                <button
                  key={b.id}
                  className={`backdrop-card ${backgroundPreset === b.id ? 'active' : ''}`}
                  onClick={() => setBackgroundPreset(b.id as BackgroundPreset)}
                >
                  <div className="backdrop-info">
                    <span className="backdrop-title">{b.name}</span>
                    <span className="backdrop-desc">{b.desc}</span>
                  </div>
                  {backgroundPreset === b.id && <Check className="w-5 h-5 text-cyan-400" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
