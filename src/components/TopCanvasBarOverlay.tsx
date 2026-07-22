import React from 'react';

interface TopCanvasBarOverlayProps {
  activeColor: string;
  onSelectColor: (color: string) => void;
  onClear: () => void;
  hoveredButton: string | null;
}

export const TOP_BUTTONS = [
  { id: 'clear', label: 'CLEAR ALL', color: '#ef4444', isClear: true, minX: 0.04, maxX: 0.20 },
  { id: 'blue', label: 'BLUE', color: '#3b82f6', isClear: false, minX: 0.23, maxX: 0.38 },
  { id: 'green', label: 'GREEN', color: '#10b981', isClear: false, minX: 0.41, maxX: 0.56 },
  { id: 'red', label: 'RED', color: '#ef4444', isClear: false, minX: 0.59, maxX: 0.74 },
  { id: 'yellow', label: 'YELLOW', color: '#f59e0b', isClear: false, minX: 0.77, maxX: 0.92 },
];

export const TopCanvasBarOverlay: React.FC<TopCanvasBarOverlayProps> = ({
  activeColor,
  hoveredButton,
}) => {
  return (
    <div className="absolute top-16 left-0 right-0 z-25 flex justify-center items-center pointer-events-none px-4">
      <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md p-2 rounded-2xl border border-white/15 shadow-2xl">
        {TOP_BUTTONS.map((btn) => {
          const isSelected = !btn.isClear && activeColor.toLowerCase() === btn.color.toLowerCase();
          const isHovered = hoveredButton === btn.id;

          return (
            <div
              key={btn.id}
              className={`flex items-center justify-center px-5 py-2.5 rounded-xl transition-all duration-150 border font-mono text-xs font-bold ${
                btn.isClear
                  ? isHovered
                    ? 'bg-red-600 text-white border-red-400 scale-110 shadow-lg shadow-red-500/50'
                    : 'bg-red-950/80 text-red-300 border-red-500/40'
                  : isSelected
                  ? 'scale-105 border-white text-white shadow-lg'
                  : isHovered
                  ? 'scale-110 border-cyan-400 text-white shadow-md shadow-cyan-500/30'
                  : 'border-white/10 text-gray-300 bg-white/5'
              }`}
              style={{
                backgroundColor: !btn.isClear && (isSelected || isHovered) ? btn.color : undefined,
                boxShadow: isSelected ? `0 0 15px ${btn.color}` : undefined,
              }}
            >
              {btn.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};
