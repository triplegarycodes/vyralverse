import React, { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import ReactNativeHapticFeedback, { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { EMBER_ORANGE, RADIANT_GOLD, VersePalette } from '../theme';

const intensityMap: Record<'light' | 'medium' | 'heavy', HapticFeedbackTypes> = {
  light: 'impactLight',
  medium: 'impactMedium',
  heavy: 'impactHeavy',
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
  const handlePress = () => {
    ReactNativeHapticFeedback.trigger(intensityMap[intensity], {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
    onPress();
  };

  const buttonPalette = palette ?? {
    primary: EMBER_ORANGE,
    accent: RADIANT_GOLD,
    background: '#000',
    card: '#222',
    text: RADIANT_GOLD,
    outline: RADIANT_GOLD,
  };

  return (
    <TouchableOpacity onPress={handlePress} style={[styles.button, { backgroundColor: buttonPalette.primary, shadowColor: buttonPalette.accent }, style]}>
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
