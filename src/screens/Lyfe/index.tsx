// Step 13: Lyfe module — AI lessons with XP tracking
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { NeonBackground } from '../../components/NeonBackground';
import { NeonCard } from '../../components/NeonCard';
import { NeonButton } from '../../components/NeonButton';
import { useToast } from '../../components/ToastProvider';
import { useNeonTheme } from '../../theme/ThemeProvider';
import { useLyfeStore } from '../../state/lyfeStore';

export const LyfeScreen: React.FC = () => {
  const { theme } = useNeonTheme();
  const { lessons, progress, hydrate, generateLesson, markComplete, loading } = useLyfeStore();
  const [topic, setTopic] = useState('Flow Rituals');
  const { showToast } = useToast();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <NeonBackground variant="cyan">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.lg }}
      >
        <Text style={[styles.heading, { color: theme.colors.text }]}>Lyfe Lessons</Text>
        <NeonCard>
          <Text style={[styles.subheading, { color: theme.colors.text }]}>Summon a lesson</Text>
          <TextInput
            value={topic}
            onChangeText={setTopic}
            style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
            placeholder="Topic"
            placeholderTextColor={theme.colors.textMuted}
          />
          <NeonButton
            label={loading ? 'Generating...' : 'Generate Outline'}
            onPress={async () => {
              await generateLesson(topic);
              showToast('New Lyfe outline generated.');
            }}
          />
        </NeonCard>
        {lessons.map(lesson => {
          const progressEntry = progress.find(item => item.lesson_id === lesson.id);
          const bullets: string[] = JSON.parse(lesson.outline);
          const completion = progressEntry?.status === 'complete';
          return (
            <NeonCard key={lesson.id}>
              <Text style={[styles.lessonTitle, { color: theme.colors.accent }]}>{lesson.topic}</Text>
              {bullets.map(bullet => (
                <Text key={bullet} style={{ color: theme.colors.text, marginTop: theme.spacing.xs }}>
                  • {bullet}
                </Text>
              ))}
              <Text style={{ color: theme.colors.textMuted, marginTop: theme.spacing.md }}>
                XP: {progressEntry?.xp ?? 0}
              </Text>
              {!completion && (
                <NeonButton
                  label="Mark Complete"
                  onPress={async () => {
                    await markComplete(lesson.id ?? 0);
                    showToast('Lesson marked complete.');
                  }}
                />
              )}
            </NeonCard>
          );
        })}
      </ScrollView>
    </NeonBackground>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 32,
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
    marginBottom: 16
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12
  }
});
