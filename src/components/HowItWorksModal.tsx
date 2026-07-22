import React from 'react';
import { X, Cpu, Activity, ShieldCheck, GitCommit } from 'lucide-react';
import type { TelemetryData } from '../types/tracking';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: TelemetryData;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  isOpen,
  onClose,
  telemetry,
}) => {
  if (!isOpen) return null;

  const PIPELINE_STEPS = [
    { title: 'Webcam Stream', desc: 'Captures 60 FPS HTML5 video frame stream from user camera input' },
    { title: 'Hand Detection', desc: 'Hardware accelerated SSD anchor-based bounding box detection model' },
    { title: 'Landmark Tracking', desc: '21 3D hand keypoints extracted at sub-pixel precision' },
    { title: 'Gesture Recognition', desc: 'Geometric angular classification for Draw, Erase, and Palm Clear' },
    { title: 'Tip Normalization', desc: 'Index tip (Landmark 8) mapped with horizontal mirror compensation' },
    { title: 'Stroke Smoothing', desc: 'Exponential Moving Average & Catmull-Rom spline curve generator' },
    { title: 'Multi-Pass Renderer', desc: 'Canvas 2D context rendering with solid, glow, neon, & pencil shaders' },
    { title: 'Glass Layer Shaders', desc: 'Real-time backdrop-blur, custom glass tint, border, & glow optics' },
  ];

  return (
    <div className="modal-backdrop">
      <div className="how-it-works-modal-card">
        <div className="modal-header">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white font-mono">COMPUTER VISION SYSTEM PIPELINE</h2>
          </div>
          <button className="sidebar-close-btn" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body">
          {/* Live Telemetry Summary */}
          <div className="telemetry-banner">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-gray-300">REAL-TIME SYSTEM METRICS</span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="metric-box">
                <span className="text-xs text-gray-400">Tracking Speed</span>
                <span className="text-base font-mono font-bold text-yellow-400">{telemetry.fps} FPS</span>
              </div>
              <div className="metric-box">
                <span className="text-xs text-gray-400">Pipeline Latency</span>
                <span className="text-base font-mono font-bold text-emerald-400">{telemetry.latencyMs} ms</span>
              </div>
              <div className="metric-box">
                <span className="text-xs text-gray-400">Confidence</span>
                <span className="text-base font-mono font-bold text-cyan-400">{Math.round(telemetry.confidence * 100)}%</span>
              </div>
              <div className="metric-box">
                <span className="text-xs text-gray-400">Active Strokes</span>
                <span className="text-base font-mono font-bold text-indigo-400">{telemetry.strokeCount}</span>
              </div>
            </div>
          </div>

          {/* Pipeline Flow Graph */}
          <h3 className="text-sm font-bold text-gray-200 uppercase font-mono tracking-wider mb-3">
            Processing Architecture
          </h3>
          <div className="pipeline-flow-list">
            {PIPELINE_STEPS.map((step, idx) => (
              <div key={idx} className="pipeline-step-node">
                <div className="node-index font-mono">{idx + 1}</div>
                <div className="node-content">
                  <span className="node-title font-semibold text-cyan-300">{step.title}</span>
                  <span className="node-desc text-xs text-gray-400">{step.desc}</span>
                </div>
                {idx < PIPELINE_STEPS.length - 1 && <GitCommit className="w-4 h-4 text-cyan-600 shrink-0" />}
              </div>
            ))}
          </div>

          <div className="architecture-notes">
            <div className="flex items-center space-x-2 text-cyan-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-bold font-mono">Zero-Latency Client Computation</span>
            </div>
            <p className="text-xs text-gray-300">
              This application compiles MediaPipe tasks into WebAssembly (WASM) and leverages WebGL hardware acceleration to run real-time inference directly inside the client browser at 30+ FPS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
