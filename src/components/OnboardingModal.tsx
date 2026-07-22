import React, { useState } from 'react';
import { Camera, Hand, CheckCircle2, ChevronRight, Sparkles, Move } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  hasCameraAccess: boolean;
  requestCameraAccess: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  hasCameraAccess,
  requestCameraAccess,
}) => {
  const [step, setStep] = useState<number>(1);
  const [calibratedCorners, setCalibratedCorners] = useState<{ [key: string]: boolean }>({
    topLeft: false,
    topRight: false,
    bottomLeft: false,
    bottomRight: false,
  });

  if (!isOpen) return null;

  const allCalibrated =
    calibratedCorners.topLeft &&
    calibratedCorners.topRight &&
    calibratedCorners.bottomLeft &&
    calibratedCorners.bottomRight;

  return (
    <div className="modal-backdrop">
      <div className="onboarding-modal-card">
        {/* Step Progress Header */}
        <div className="onboarding-header">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white font-mono">AIR CANVAS STUDIO ONBOARDING</h2>
          </div>
          <div className="step-dots">
            <span className={`step-dot ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`} />
            <span className={`step-dot ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`} />
            <span className={`step-dot ${step === 3 ? 'active' : ''}`} />
          </div>
        </div>

        {/* STEP 1: CAMERA PERMISSION */}
        {step === 1 && (
          <div className="step-content">
            <div className="step-icon-hero">
              <Camera className="w-12 h-12 text-cyan-400 animate-bounce" />
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2">Step 1: Enable Webcam Stream</h3>
            <p className="text-sm text-gray-300 text-center mb-6 max-w-md">
              Air Canvas uses local, hardware-accelerated MediaPipe Computer Vision in your browser.
              No video data leaves your device.
            </p>

            {hasCameraAccess ? (
              <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-4 py-3 rounded-lg mb-6">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-semibold">Webcam Feed Active & Connected!</span>
              </div>
            ) : (
              <button className="nav-btn-primary w-full py-3 justify-center mb-6" onClick={requestCameraAccess}>
                <Camera className="w-5 h-5" />
                <span>Allow Camera Access</span>
              </button>
            )}

            <div className="flex justify-end">
              <button
                className="nav-btn-primary"
                disabled={!hasCameraAccess}
                onClick={() => setStep(2)}
              >
                <span>Continue to Gestures</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: GESTURE TUTORIAL */}
        {step === 2 && (
          <div className="step-content">
            <h3 className="text-xl font-bold text-white text-center mb-1">Step 2: Air Gesture Guide</h3>
            <p className="text-xs text-gray-400 text-center mb-4">
              Master the 3 main hand gestures for seamless air drawing
            </p>

            <div className="gesture-guide-grid">
              {/* Gesture 1: Draw */}
              <div className="gesture-card">
                <div className="gesture-card-badge">DRAW</div>
                <div className="gesture-illustration text-cyan-400">
                  <Hand className="w-8 h-8 rotate-12" />
                </div>
                <span className="gesture-title">Index Finger Extended</span>
                <p className="gesture-desc">Raise index finger up while folding other fingers to write in the air.</p>
              </div>

              {/* Gesture 2: Erase */}
              <div className="gesture-card">
                <div className="gesture-card-badge text-red-400">ERASE</div>
                <div className="gesture-illustration text-red-400">
                  <div className="flex space-x-1">
                    <Hand className="w-8 h-8" />
                  </div>
                </div>
                <span className="gesture-title">2 Fingers Raised</span>
                <p className="gesture-desc">Raise Index + Middle fingers together to trigger the eraser tool.</p>
              </div>

              {/* Gesture 3: Hold Clear */}
              <div className="gesture-card">
                <div className="gesture-card-badge text-amber-400">CLEAR</div>
                <div className="gesture-illustration text-amber-400">
                  <Hand className="w-8 h-8" />
                </div>
                <span className="gesture-title">Open Palm Hold</span>
                <p className="gesture-desc">Hold open palm (5 fingers) for 1.5s countdown to clear canvas.</p>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button className="nav-btn-secondary" onClick={() => setStep(1)}>
                Back
              </button>
              <button className="nav-btn-primary" onClick={() => setStep(3)}>
                <span>Start Air Calibration</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: AIR REACH CALIBRATION */}
        {step === 3 && (
          <div className="step-content">
            <h3 className="text-xl font-bold text-white text-center mb-1">Step 3: Calibration Check</h3>
            <p className="text-xs text-gray-300 text-center mb-4">
              Click or move your finger near each corner target to confirm full screen coverage.
            </p>

            <div className="calibration-box">
              <button
                className={`calib-target top-2 left-2 ${calibratedCorners.topLeft ? 'done' : ''}`}
                onClick={() => setCalibratedCorners((prev) => ({ ...prev, topLeft: true }))}
              >
                <Move className="w-4 h-4" /> Top-Left
              </button>
              <button
                className={`calib-target top-2 right-2 ${calibratedCorners.topRight ? 'done' : ''}`}
                onClick={() => setCalibratedCorners((prev) => ({ ...prev, topRight: true }))}
              >
                <Move className="w-4 h-4" /> Top-Right
              </button>
              <button
                className={`calib-target bottom-2 left-2 ${calibratedCorners.bottomLeft ? 'done' : ''}`}
                onClick={() => setCalibratedCorners((prev) => ({ ...prev, bottomLeft: true }))}
              >
                <Move className="w-4 h-4" /> Bottom-Left
              </button>
              <button
                className={`calib-target bottom-2 right-2 ${calibratedCorners.bottomRight ? 'done' : ''}`}
                onClick={() => setCalibratedCorners((prev) => ({ ...prev, bottomRight: true }))}
              >
                <Move className="w-4 h-4" /> Bottom-Right
              </button>

              <div className="flex flex-col items-center justify-center h-full">
                <span className="text-xs font-mono text-cyan-400 mb-2">TARGET CALIBRATION</span>
                <div className="w-32 h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 transition-all duration-300"
                    style={{
                      width: `${(Object.values(calibratedCorners).filter(Boolean).length / 4) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button className="nav-btn-secondary" onClick={() => setStep(2)}>
                Back
              </button>
              <button
                className="nav-btn-primary"
                onClick={() => {
                  if (!allCalibrated) {
                    setCalibratedCorners({
                      topLeft: true,
                      topRight: true,
                      bottomLeft: true,
                      bottomRight: true,
                    });
                  }
                  onComplete();
                }}
              >
                <span>{allCalibrated ? 'Launch Air Canvas' : 'Skip & Launch'}</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
