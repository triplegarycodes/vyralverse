// Step 7: Neon button with gradient fill and subtle interactions
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useNeonTheme } from '../theme/ThemeProvider';

export type NeonButtonProps = {
  label: string;
  onPress?: () => void;
  icon?: React.ReactNode;
};

export const NeonButton: React.FC<NeonButtonProps> = ({ label, onPress, icon }) => {
  const {
    theme: { colors, radii, spacing }
  } = useNeonTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 12, stiffness: 120 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 120 });
      }}
      style={styles.pressable}
    >
      <Animated.View style={[styles.wrapper, animatedStyle]}> 
        <LinearGradient
          colors={[colors.accent, colors.accentSecondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: radii.lg,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.lg,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon}
          <Text style={[styles.label, { color: '#04010F' }]}>{label}</Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    width: '100%'
  },
  wrapper: {
    width: '100%'
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 8
  }
});
