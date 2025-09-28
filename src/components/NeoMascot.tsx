// Step 19: Neo mascot assistant reacting to milestones
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  withTiming,
  useAnimatedStyle
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useNeoStore } from '../state/neoStore';
import { useNeonTheme } from '../theme/ThemeProvider';

type MascotVisual = {
  glyph: string;
  gradient: string[];
};

const mascotVisuals: Record<'idle' | 'celebrate' | 'alert', MascotVisual> = {
  idle: {
    glyph: '◎',
    gradient: ['rgba(120,98,255,0.9)', 'rgba(9,9,40,0.9)']
  },
  celebrate: {
    glyph: '✶',
    gradient: ['rgba(42,255,210,1)', 'rgba(42,96,255,0.9)']
  },
  alert: {
    glyph: '⚡',
    gradient: ['rgba(255,121,91,1)', 'rgba(146,42,255,0.9)']
  }
};

export const NeoMascot: React.FC = () => {
  const { state, message, acknowledge } = useNeoStore();
  const { theme } = useNeonTheme();
  const { colors, spacing, radii } = theme;
  const scale = useSharedValue(0.9);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const visual = useMemo(() => mascotVisuals[state], [state]);
  const glyphColor = theme.mode === 'dark' ? '#04010F' : '#F5F5FF';

  const handlePress = () => {
    scale.value = withTiming(1.05, { duration: 180 }, () => {
      scale.value = withTiming(1, { duration: 140 });
    });
    acknowledge();
  };

  if (!message) {
    return null;
  }

  return (
    <Animated.View entering={FadeIn.delay(200)} exiting={FadeOut} style={styles.container}>
      <Pressable onPress={handlePress} style={styles.pressable} accessibilityRole="button">
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surfaceAlt,
            borderRadius: radii.lg,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderWidth: 1,
            borderColor: colors.border
          }}
        >
          <Animated.View style={[{ marginRight: spacing.sm }, animatedStyle]}>
            <LinearGradient
              colors={visual.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.mascotBubble}
            >
              <Text style={[styles.glyph, { color: glyphColor }]}>{visual.glyph}</Text>
            </LinearGradient>
          </Animated.View>
          <Text style={[styles.text, { color: colors.text }]}>{message}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    right: 16
  },
  pressable: {
    maxWidth: 280
  },
  mascotBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  glyph: {
    fontSize: 20,
    fontWeight: '700'
  },
  text: {
    fontSize: 14,
    fontWeight: '600'
  }
});
