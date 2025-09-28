// Step 17: Skrybe creative hub UI with note editor
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { NeonBackground } from '../../components/NeonBackground';
import { NeonCard } from '../../components/NeonCard';
import { NeonButton } from '../../components/NeonButton';
import { useToast } from '../../components/ToastProvider';
import { useNeonTheme } from '../../theme/ThemeProvider';
import { useSkrybeStore } from '../../state/skrybeStore';

export const SkrybeScreen: React.FC = () => {
  const { theme } = useNeonTheme();
  const { notes, hydrate, addNote, deleteNote } = useSkrybeStore();
  const [title, setTitle] = useState('Manifesto Pulse');
  const [body, setBody] = useState('Sketch your future sprint...');
  const { showToast } = useToast();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;

  return (
    <NeonBackground>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.lg }}>
        <Text style={[styles.heading, { color: theme.colors.text }]}>Skrybe Forge</Text>
        <NeonCard>
          <Text style={[styles.subheading, { color: theme.colors.text }]}>Compose</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
            placeholder="Title"
            placeholderTextColor={theme.colors.textMuted}
          />
          <TextInput
            value={body}
            onChangeText={setBody}
            style={[styles.textarea, { color: theme.colors.text, borderColor: theme.colors.border }]}
            placeholder="Write your neon note"
            placeholderTextColor={theme.colors.textMuted}
            multiline
          />
          <Text style={{ color: theme.colors.textMuted, marginBottom: theme.spacing.sm }}>
            Word count: {wordCount}
          </Text>
          <NeonButton
            label="Save Note"
            onPress={async () => {
              await addNote(title, body);
              showToast('Skrybe entry saved.');
            }}
          />
        </NeonCard>
        {notes.map(note => (
          <NeonCard key={note.id}>
            <Text style={[styles.noteTitle, { color: theme.colors.accent }]}>{note.title}</Text>
            <Text style={{ color: theme.colors.text, marginTop: theme.spacing.xs }}>{note.body}</Text>
            <Text style={{ color: theme.colors.textMuted, marginTop: theme.spacing.xs }}>
              {new Date(note.updated_at).toLocaleString()} — {note.word_count} words
            </Text>
            <NeonButton
              label="Delete"
              onPress={async () => {
                await deleteNote(note.id ?? 0);
                showToast('Note removed.');
              }}
            />
          </NeonCard>
        ))}
      </ScrollView>
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
    marginBottom: 12
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    minHeight: 120,
    marginBottom: 12
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '700'
  }
});
