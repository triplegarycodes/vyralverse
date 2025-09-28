// Step 5: Neon-first design tokens powering the global theme
export type NeonAccent = 'violet' | 'cyan' | 'magenta' | 'emerald';

export const baseColors = {
  dark: {
    background: '#04010F',
    surface: '#0B0720',
    surfaceAlt: '#110C2F',
    border: '#1F1B3B',
    text: '#F5F5FF',
    textMuted: '#B0B0D0',
    warning: '#FF7A7A'
  },
  light: {
    background: '#F5F5FF',
    surface: '#EBE7FF',
    surfaceAlt: '#E1D8FF',
    border: '#C0B9F2',
    text: '#120A3D',
    textMuted: '#4A3E7D',
    warning: '#C44D56'
  }
};

export const accentPalette: Record<NeonAccent, { primary: string; secondary: string }> = {
  violet: { primary: '#7F5BFF', secondary: '#14F0FF' },
  cyan: { primary: '#00D4FF', secondary: '#6C5BFF' },
  magenta: { primary: '#FF3FD1', secondary: '#7F5BFF' },
  emerald: { primary: '#38F4B5', secondary: '#00D4FF' }
};

export const radii = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  full: 999
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32
};

export const shadows = {
  neon(accent: NeonAccent) {
    return {
      shadowColor: accentPalette[accent].primary,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.35,
      shadowRadius: 32,
      elevation: 18
    };
  }
};

export type ThemeTokens = {
  mode: 'dark' | 'light';
  colors: typeof baseColors.dark & { accent: string; accentSecondary: string };
  radii: typeof radii;
  spacing: typeof spacing;
  shadows: typeof shadows;
  fontScale: number;
};

export const buildTheme = (mode: 'dark' | 'light', accent: NeonAccent, fontScale: number): ThemeTokens => {
  const palette = mode === 'dark' ? baseColors.dark : baseColors.light;
  const accentColors = accentPalette[accent];
  return {
    mode,
    colors: {
      ...palette,
      accent: accentColors.primary,
      accentSecondary: accentColors.secondary
    },
    radii,
    spacing,
    shadows,
    fontScale
  };
};
