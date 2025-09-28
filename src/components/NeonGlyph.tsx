// Step 7: Glyph badge used where binary icons were previously referenced
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNeonTheme } from '../theme/ThemeProvider';

type NeonGlyphProps = {
  label: string;
  size?: number;
};

export const NeonGlyph: React.FC<NeonGlyphProps> = ({ label, size = 18 }) => {
  const { theme } = useNeonTheme();
  const dimension = size + 12;
  const textColor = theme.mode === 'dark' ? '#04010F' : '#F5F5FF';

  return (
    <LinearGradient
      colors={[theme.colors.accent, theme.colors.accentSecondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { width: dimension, height: dimension, borderRadius: dimension / 2 }]}
    >
      <Text style={[styles.label, { fontSize: size * 0.75, color: textColor }]}>{label}</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  label: {
    fontWeight: '700'
  }
});
