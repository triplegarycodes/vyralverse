import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { VersePalette } from '../theme';

type VerseTextFieldProps = TextInputProps & {
  label?: string;
  palette: VersePalette;
};

export const VerseTextField: React.FC<VerseTextFieldProps> = ({ label, palette, style, ...rest }) => {
  return (
    <View style={styles.container}>
      {label ? <Text style={[styles.label, { color: palette.text }]}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={palette.accent}
        style={[
          styles.input,
          {
            backgroundColor: palette.card,
            borderColor: palette.outline,
            color: palette.text,
          },
          style,
        ]}
        {...rest}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    width: '100%',
  },
  label: {
    fontFamily: 'OpenSans_400Regular',
    marginBottom: 6,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  input: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
});
