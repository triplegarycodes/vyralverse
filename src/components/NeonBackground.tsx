// Step 7: Neon background primitive for immersive gradients
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNeonTheme } from '../theme/ThemeProvider';

export type NeonBackgroundProps = React.PropsWithChildren<{
  variant?: 'purple' | 'cyan';
}>;

const gradientMap: Record<'purple' | 'cyan', string[]> = {
  purple: ['rgba(127,91,255,0.85)', 'rgba(20,240,255,0.2)'],
  cyan: ['rgba(0,212,255,0.85)', 'rgba(108,91,255,0.2)']
};

export const NeonBackground: React.FC<NeonBackgroundProps> = ({ children, variant = 'purple' }) => {
  const {
    theme: {
      colors: { background }
    }
  } = useNeonTheme();

  const colors = [background, ...gradientMap[variant]];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
