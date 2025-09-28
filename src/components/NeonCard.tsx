// Step 7: Animated neon card component
import React from 'react';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { StyleSheet, ViewStyle } from 'react-native';
import { useNeonTheme } from '../theme/ThemeProvider';

export type NeonCardProps = React.PropsWithChildren<{
  style?: ViewStyle;
}>;

export const NeonCard: React.FC<NeonCardProps> = ({ children, style }) => {
  const {
    theme: { colors, radii, spacing, shadows },
    accent
  } = useNeonTheme();

  return (
    <Animated.View
      entering={FadeInUp.springify().damping(14).mass(0.9)}
      exiting={FadeOutDown.duration(180)}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderRadius: radii.lg,
          padding: spacing.lg,
          borderWidth: 1,
          borderColor: colors.border,
          ...shadows.neon(accent)
        },
        style
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%'
  }
});
