import React, { PropsWithChildren, useCallback } from 'react';
import { Platform, StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import type { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { EMBER_ORANGE, RADIANT_GOLD, VersePalette } from '../theme';

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
  const handlePress = useCallback(() => {
    const trigger = getTrigger();

    trigger?.(intensityMap[intensity], {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });

    onPress();
  }, [intensity, onPress]);

  const buttonPalette = palette ?? {
    primary: EMBER_ORANGE,
    accent: RADIANT_GOLD,
    background: '#000',
    card: '#222',
    text: RADIANT_GOLD,
    outline: RADIANT_GOLD,
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.button,
        {
          backgroundColor: buttonPalette.primary,
          shadowColor: buttonPalette.accent,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: buttonPalette.text }]}>{title}</Text>
      {children}
    </TouchableOpacity>
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
  },
  text: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 1.2,
  },
});
