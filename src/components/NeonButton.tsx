```tsx
// src/components/NeonButton.tsx - Neon-Charged Button for V'erse
import React, { PropsWithChildren, useCallback } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, ViewStyle, Animated } from 'react-native';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { useVerseTheme } from '../hooks/useVerseTheme';

// Define VersePalette type for strict typing
interface VersePalette {
  primary: string;
  accent: string;
  background: string;
  card: string;
  text: string;
  outline: string;
}

const intensityMap: Record<'light' | 'medium' | 'heavy', HapticFeedbackTypes> = {
  light: 'impactLight',
  medium: 'impactMedium',
  heavy: 'impactHeavy',
};

type HapticTrigger = (type: HapticFeedbackTypes, options: HapticOptions) => void;

type HapticOptions = {
  enableVibrateFallback?: boolean;
  ignoreAndroidSystemSettings?: boolean;
};

let cachedTrigger: HapticTrigger | null = null;

const getTrigger = (): HapticTrigger | null => {
  if (Platform.OS === 'web') {
    return null;
  }

  if (cachedTrigger) {
    return cachedTrigger;
  }

  try {
    const module: typeof import('react-native-haptic-feedback') = require('react-native-haptic-feedback');
    const haptics = module.default ?? module;

    if (typeof haptics?.trigger === 'function') {
      cachedTrigger = (type: HapticFeedbackTypes, options: HapticOptions) => {
        haptics.trigger(type, options);
      };
      return cachedTrigger;
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('Haptics unavailable:', error);
    }
  }

  return null;
};

type NeonButtonProps = PropsWithChildren<{
  title: string;
  onPress: () => void;
  palette?: VersePalette;
  intensity?: 'light' | 'medium' | 'heavy';
  style?: StyleProp<ViewStyle>;
}>;

export const NeonButton: React.FC<NeonButtonProps> = ({
  title,
  onPress,
  palette,
  children,
  intensity = 'light',
  style,
}) => {
  const theme = useVerseTheme(); // Pull dynamic theme
  const buttonPalette: VersePalette = palette ?? theme; // Fallback to theme
  const scaleAnim = React.useRef(new Animated.Value(1)).current; // Fallback animation for web

  const handlePress = useCallback(() => {
    const trigger = getTrigger();

    if (trigger) {
      trigger(intensityMap[intensity], {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
    } else {
      // Fallback animation for web/no haptics
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
    }

    onPress();
  }, [intensity, onPress, scaleAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={handlePress}
        style={[
          styles.button,
          {
            backgroundColor: buttonPalette.primary,
            shadowColor: buttonPalette.accent,
            borderColor: buttonPalette.outline,
          },
          style,
        ]}
        accessibilityLabel={title}
        accessibilityRole="button"
      >
        <Text
          style={[styles.text, { color: buttonPalette.text }]}
          accessibilityTraits="button"
        >
          {title}
        </Text>
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 8,
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
  },
  text: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 1.2,
  },
});
```
