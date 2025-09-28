// Step 12: Core collaborative chat screen wiring FlashList + composer
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useFocusEffect } from '@react-navigation/native';
import { NeonBackground } from '../../components/NeonBackground';
import { NeonCard } from '../../components/NeonCard';
import { NeonButton } from '../../components/NeonButton';
import { useNeonTheme } from '../../theme/ThemeProvider';
import { useCoreStore } from '../../state/coreStore';
import { NeoMascot } from '../../components/NeoMascot';
import { useToast } from '../../components/ToastProvider';

export const CoreScreen: React.FC = () => {
  const { theme } = useNeonTheme();
  const { messages, load, sendMessage } = useCoreStore();
  const [input, setInput] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    load('core');
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load('core');
    }, [load])
  );

  const handleSend = async () => {
    if (!input.trim()) return;
    const ok = await sendMessage(input);
    if (ok) {
      showToast('Signal fired to the Core grid.');
      setInput('');
    }
  };

  return (
    <NeonBackground>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.flex}
      >
        <View style={[styles.container, { padding: theme.spacing.lg }]}
 accessibilityRole="main">
          <Text style={[styles.heading, { color: theme.colors.text }]}>Core Grid</Text>
          <FlashList
            data={messages}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => (
              <NeonCard style={{ marginBottom: theme.spacing.md }}>
                <Text style={[styles.author, { color: theme.colors.accent }]}>{item.author}</Text>
                <Text style={{ color: theme.colors.text, marginTop: theme.spacing.xs }}>
                  {item.content}
                </Text>
                <Text style={[styles.timestamp, { color: theme.colors.textMuted }]}> 
                  {new Date(item.created_at).toLocaleTimeString()}
                </Text>
              </NeonCard>
            )}
            estimatedItemSize={160}
            contentContainerStyle={{ paddingBottom: 120 }}
          />
          <View style={[styles.composer, { backgroundColor: theme.colors.surfaceAlt }]}
 accessibilityRole="form">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Signal your update..."
              placeholderTextColor={theme.colors.textMuted}
              style={[styles.input, { color: theme.colors.text }]}
              multiline
            />
            <NeonButton label="Transmit" onPress={handleSend} />
          </View>
        </View>
        <NeoMascot />
      </KeyboardAvoidingView>
    </NeonBackground>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  container: {
    flex: 1
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 24
  },
  composer: {
    borderRadius: 24,
    padding: 16,
    gap: 12,
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16
  },
  input: {
    minHeight: 60,
    fontSize: 16
  },
  author: {
    fontSize: 14,
    fontWeight: '700'
  },
  timestamp: {
    fontSize: 12,
    marginTop: 12
  }
});
