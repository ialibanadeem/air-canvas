# 🎨 Air Canvas Studio — Real-Time Computer Vision Spatial Painting Application

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg?style=flat-square&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Tasks_Vision-ff6f00.svg?style=flat-square&logo=google)](https://developers.google.com/mediapipe)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8.svg?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

> A high-performance, real-time Computer Vision web application that transforms standard webcams into an interactive, spatial digital glass canvas. Built with **React 18**, **TypeScript**, **MediaPipe WASM**, and **HTML5 Canvas 2D Vector Physics**.

**Author**: Aliba N.  
**LinkedIn**: [linkedin.com/in/aliba7](https://www.linkedin.com/in/aliba7/)

---

## 🌟 Architectural Highlights

Air Canvas Studio was engineered to demonstrate enterprise-grade real-time computer vision capabilities in the browser, focusing on zero-latency tracking, mathematical curve smoothing, and non-blocking 60 FPS rendering pipelines.

### 1. ⚡ High-Precision Gesture Recognition & Monotonic Pipeline
- **MediaPipe Hand Landmarker Integration**: Real-time 21-landmark 3D hand tracking operating via WebAssembly (WASM) and GPU acceleration.
- **Monotonic Frame Synchronization**: Solves frame drops and detection stalls by enforcing strictly monotonic integer millisecond timestamps (`video.currentTime * 1000`) for continuous 60 FPS tracking.
- **Hand-Scale Invariant Vector Classification**: Robust gesture classification using normalized 3D joint distances relative to wrist-to-MCP scale, ensuring stable gesture detection regardless of hand distance, camera angle, or tilt.

### 2. ✒️ Apple Pencil-Grade Vector Physics & Smoothing
- **Velocity-Aware Adaptive Low-Pass Filter**: Implementation of the 1Euro Filter (Casiez et al., CHI 2012) to dynamically adjust cutoff frequencies based on instantaneous hand speed—eliminating micro-tremors during slow writing while eliminating lag during fast strokes.
- **Chaikin Corner-Cutting Subdivision**: Double-pass Chaikin subdivision ($Q_i = 0.75P_i + 0.25P_{i+1}$, $R_i = 0.25P_i + 0.75P_{i+1}$) converts raw discrete camera coordinates into smooth parabolic curves.
- **Centripetal Catmull-Rom & Bezier Curve Interpolation**: Renders continuous, anti-aliased vector paths with sub-pixel precision.

### 3. 🖐️ Intuitive Air Controls & Spatial UI Collision
- **☝️ Air Draw (Pen Down)**: Point index finger up to write or draw ink instantly.
- **✊ Stroke Break (Pen Up)**: Fold index finger or form a fist to lift pen off canvas and reposition hand without creating unwanted connecting lines.
- **✌️ Gesture Eraser**: Extend Index + Middle fingers together to dynamically erase stroke points within a customizable radius.
- **🖐️ Open Palm Canvas Clear**: Hold an open palm facing the camera for 1.5 seconds with visual SVG radial countdown ring to clear all strokes.

---

## 🚀 Performance Metrics

| Metric | Target / Measured | Architecture Strategy |
| :--- | :--- | :--- |
| **FPS Target** | **60 FPS** | Uninterrupted `requestAnimationFrame` loop decoupled from React state via `useRef` buffers |
| **CV Detection Latency** | **< 12 ms** | MediaPipe GPU Delegate + WASM worker thread execution |
| **Stroke Interpolation** | **Sub-pixel** | Chaikin subdivision + Catmull-Rom 6-step spline sub-sampling |
| **Canvas Redraw Overhead** | **< 2 ms** | Dual-pass offscreen canvas rendering & vector path batching |

---

## 🛠️ Technology Stack & Dependencies

- **Frontend Framework**: React 18.3 + TypeScript 5.6 (Strict Mode)
- **Build Tooling & Bundler**: Vite 6.0 (HMR, ESM, SWC optimization)
- **Computer Vision**: `@mediapipe/tasks-vision` (Hand Landmarker WASM)
- **Design System & Styling**: Vanilla CSS Design Tokens, Glassmorphism, Tailwind CSS, Lucide Icons
- **Export Formats**: Raster PNG & Resolution-Independent Vector SVG

---

## 📁 Repository Structure

```
air_canvas/
├── src/
│   ├── components/
│   │   ├── ControlDock.tsx          # Floating bottom brush & tool dock
│   │   ├── DebugHUD.tsx             # Real-time CV telemetry & skeleton HUD
│   │   ├── GestureInstructionsModal.tsx # Redesigned visual gesture guide
│   │   ├── GestureRingOverlay.tsx   # Air cursor & radial countdown overlay
│   │   ├── GlassCanvas.tsx          # Virtual glass canvas surface
│   │   ├── Navigation.tsx           # Top glassmorphic header bar
│   │   ├── SidebarPanel.tsx         # Optics drawer (Glass, Brush, Backdrop)
│   │   ├── TopCanvasBarOverlay.tsx   # Spatial air button collision bar
│   │   ├── ViewportContainer.tsx    # Multi-mode viewport compositor
│   │   └── WatermarkBadge.tsx       # Minimal author attribution badge
│   ├── services/
│   │   ├── exportService.ts         # High-res PNG & SVG vector exporters
│   │   └── handTracker.ts           # MediaPipe HandLandmarker WASM service
│   ├── types/
│   │   ├── canvas.ts                # Brush, Stroke, & Viewport interfaces
│   │   ├── glass.ts                 # Glassmorphic optics settings & presets
│   │   └── tracking.ts              # Landmark 3D points & telemetry types
│   ├── utils/
│   │   ├── canvasRenderer.ts        # Apple Pencil multi-brush shader engine
│   │   ├── gestureRecognition.ts    # Hand-scale invariant 3D gesture classifier
│   │   └── strokeEngine.ts          # 1Euro filter, Chaikin subdivision, Catmull-Rom
│   ├── App.tsx                      # Core 60 FPS animation loop & state orchestrator
│   ├── index.css                    # Design tokens & glassmorphism utilities
│   └── main.tsx                     # Application entry point
├── public/                          # Static assets & WASM binaries
├── index.html                       # SEO metadata & HTML shell
├── package.json                     # Dependency manifests & build scripts
├── tsconfig.json                    # Strict TypeScript compilation rules
└── vite.config.ts                   # Vite bundler configuration
```

---

## 💻 Getting Started Locally

### Prerequisites

Ensure you have **Node.js (v18.0 or higher)** and **npm** installed.

### 1. Clone the Repository
```bash
git clone https://github.com/ialibanadeem/air-canvas.git
cd air-canvas
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://127.0.0.1:3000`. Grant camera permissions when prompted.

### 4. Build for Production
```bash
npm run build
```

---

## 🎨 Brush Styles & Shaders

1. **Solid Ink**: Crisp, high-definition digital vector stroke.
2. **Glow Aura**: Dual-pass white hot core with glowing ambient color halo.
3. **Neon Cyber**: Triple-pass white core, vibrant mid-tone, and wide outer glow.
4. **Marker**: Semi-translucent chisel-tip marker effect.
5. **Graphite Pencil**: Fine graphite texture line with parallel sketch accent.
6. **Highlighter**: Wide translucent overlay ink for emphasizing backdrop content.

---

*Designed and developed by **Aliba N.** Released under the [MIT License](LICENSE).*
