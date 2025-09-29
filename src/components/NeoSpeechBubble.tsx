import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { VersePalette } from '../theme';

type NeoSpeechBubbleProps = {
  text: string;
  palette: VersePalette;
};

export const NeoSpeechBubble: React.FC<NeoSpeechBubbleProps> = ({ text, palette }) => (
  <View
    style={[styles.container, { backgroundColor: palette.card, borderColor: palette.outline }]}
    accessibilityHint="Neo's latest prophecy"
  >
    <Text style={[styles.text, { color: palette.text }]}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-end',
  },
  text: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
});
