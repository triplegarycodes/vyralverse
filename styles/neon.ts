import { StyleSheet } from 'react-native';

export const colors = {
  verseBlack: '#05020f',
  verseCyan: '#43f0ff',
  versePurple: '#a855f7',
  verseOrange: '#ff8a3c',
  verseGreen: '#4ade80',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#0c111f',
};

export const typography = StyleSheet.create({
  title: {
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: 1,
  },
  subtle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

export const withOpacity = (hex: string, alpha: number) => {
  const sanitized = hex.replace('#', '');
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const shadows = {
  cyan: {
    shadowColor: colors.verseCyan,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  purple: {
    shadowColor: colors.versePurple,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 24,
  },
};
