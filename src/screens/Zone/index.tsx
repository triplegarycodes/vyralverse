// Step 16: Zone community feed with composer + moderation
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Share } from 'react-native';
import { NeonBackground } from '../../components/NeonBackground';
import { NeonCard } from '../../components/NeonCard';
import { NeonButton } from '../../components/NeonButton';
import { useToast } from '../../components/ToastProvider';
import { useNeonTheme } from '../../theme/ThemeProvider';
import { useZoneStore } from '../../state/zoneStore';
import { NeoMascot } from '../../components/NeoMascot';

export const ZoneScreen: React.FC = () => {
  const { theme } = useNeonTheme();
  const { posts, hydrate, createPost, togglePin } = useZoneStore();
  const [body, setBody] = useState('Dropping my first neon win.');
  const { showToast } = useToast();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <NeonBackground>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.lg }}>
        <Text style={[styles.heading, { color: theme.colors.text }]}>Zone Broadcast</Text>
        <NeonCard>
          <Text style={[styles.subheading, { color: theme.colors.text }]}>Share a pulse</Text>
          <TextInput
            value={body}
            onChangeText={setBody}
            style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
            placeholder="Your neon broadcast"
            placeholderTextColor={theme.colors.textMuted}
            multiline
          />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <NeonButton
                label="Send"
                onPress={async () => {
                  const ok = await createPost('You', body);
                  if (ok) {
                    showToast('Transmission sent to the Zone.');
                  }
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <NeonButton
                label="Share"
                onPress={() =>
                  Share.share({
                    message: 'Join me in the Vyral Verse Zone: vyral://zone'
                  })
                }
              />
            </View>
          </View>
        </NeonCard>
        {posts.map(post => (
          <NeonCard key={post.id}>
            <Text style={[styles.author, { color: theme.colors.accent }]}>{post.author}</Text>
            <Text style={{ color: theme.colors.text, marginTop: theme.spacing.xs }}>{post.body}</Text>
            <Text style={{ color: theme.colors.textMuted, marginTop: theme.spacing.xs }}>
              {new Date(post.created_at).toLocaleString()}
            </Text>
            <NeonButton
              label={post.pinned ? 'Unpin' : 'Pin'}
              onPress={() => togglePin(post.id ?? 0, !post.pinned)}
            />
          </NeonCard>
        ))}
      </ScrollView>
      <NeoMascot />
    </NeonBackground>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 30,
    fontWeight: '700'
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    minHeight: 80,
    marginBottom: 12
  },
  author: {
    fontSize: 16,
    fontWeight: '700'
  }
});
