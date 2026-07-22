export type GlassPreset = 'clear' | 'frosted' | 'dark' | 'neon' | 'custom';

export interface GlassSettings {
  mode: GlassPreset;
  opacity: number; // 0 to 100
  tintColor: string; // Hex color string
  blur: number; // 0 to 40 px
  border: boolean;
  reflection: boolean;
  glow: boolean;
  glowColor: string;
}

export const GLASS_PRESETS: Record<GlassPreset, Omit<GlassSettings, 'mode'>> = {
  clear: {
    opacity: 15,
    tintColor: '#ffffff',
    blur: 4,
    border: true,
    reflection: true,
    glow: false,
    glowColor: '#3b82f6',
  },
  frosted: {
    opacity: 35,
    tintColor: '#e0f2fe',
    blur: 16,
    border: true,
    reflection: true,
    glow: false,
    glowColor: '#0284c7',
  },
  dark: {
    opacity: 65,
    tintColor: '#0f172a',
    blur: 12,
    border: true,
    reflection: true,
    glow: true,
    glowColor: '#6366f1',
  },
  neon: {
    opacity: 45,
    tintColor: '#090d16',
    blur: 8,
    border: true,
    reflection: true,
    glow: true,
    glowColor: '#00f0ff',
  },
  custom: {
    opacity: 30,
    tintColor: '#1e293b',
    blur: 10,
    border: true,
    reflection: true,
    glow: true,
    glowColor: '#ec4899',
  },
};
