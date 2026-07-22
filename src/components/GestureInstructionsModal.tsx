import React from 'react';
import { X, Sparkles } from 'lucide-react';

interface GestureInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GestureInstructionsModal: React.FC<GestureInstructionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="gesture-modal-card animate-modal-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="gesture-modal-header">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-heading tracking-wide">
                Air Gesture Guide
              </h2>
              <p className="text-[11px] text-cyan-400/80 font-mono">
                Computer Vision Interaction Controls
              </p>
            </div>
          </div>
          <button className="sidebar-close-btn" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Cards Grid */}
        <div className="gesture-modal-body">
          <div className="gesture-cards-grid">
            {/* Gesture 1: Air Draw */}
            <div className="instruction-gesture-card card-cyan">
              <div className="card-top-row">
                <span className="gesture-pill pill-cyan">01 • DRAW</span>
                <span className="gesture-emoji">☝️</span>
              </div>
              <h4 className="instruction-title">Point Index Finger</h4>
              <p className="instruction-desc">
                Point your index finger up to draw vector ink strokes seamlessly on glass.
              </p>
            </div>

            {/* Gesture 2: Pen Up / Break Stroke */}
            <div className="instruction-gesture-card card-amber">
              <div className="card-top-row">
                <span className="gesture-pill pill-amber">02 • PEN UP</span>
                <span className="gesture-emoji">✊</span>
              </div>
              <h4 className="instruction-title">Fold Finger / Fist</h4>
              <p className="instruction-desc">
                Curl your index finger or make a fist to break the stroke and reposition your hand.
              </p>
            </div>

            {/* Gesture 3: Erase */}
            <div className="instruction-gesture-card card-pink">
              <div className="card-top-row">
                <span className="gesture-pill pill-pink">03 • ERASE</span>
                <span className="gesture-emoji">✌️</span>
              </div>
              <h4 className="instruction-title">2 Fingers Extended</h4>
              <p className="instruction-desc">
                Extend index and middle fingers together to erase any ink points on canvas.
              </p>
            </div>

            {/* Gesture 4: Hold Clear */}
            <div className="instruction-gesture-card card-emerald">
              <div className="card-top-row">
                <span className="gesture-pill pill-emerald">04 • CLEAR ALL</span>
                <span className="gesture-emoji">🖐️</span>
              </div>
              <h4 className="instruction-title">Hold Open Palm</h4>
              <p className="instruction-desc">
                Hold your open palm facing the camera for 1.5s to clear the entire canvas.
              </p>
            </div>
          </div>

          {/* Start CTA Button */}
          <button className="gesture-cta-button" onClick={onClose}>
            <span>Got It! Start Air Drawing</span>
          </button>
        </div>
      </div>
    </div>
  );
};
