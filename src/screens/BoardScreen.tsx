import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NeonButton } from '../components/NeonButton';
import { NeoMascot } from '../components/NeoMascot';
import { NeoSpeechBubble } from '../components/NeoSpeechBubble';
import { NeonThreeCanvas } from '../components/three/NeonThreeCanvas';
import { VerseTextField } from '../components/VerseTextField';
import { useVerseTheme } from '../theme';
import { useVerseStore } from '../hooks/useVerseStore';
import { addGoal } from '../services/dataStore';
import { generateQuest } from '../services/skrybe';
import { RootStackParamList } from '../navigation/types';

export type BoardScreenProps = NativeStackScreenProps<RootStackParamList, 'Board'>;

export const BoardScreen: React.FC<BoardScreenProps> = ({ navigation }) => {
  const store = useVerseStore();
  const { palette } = useVerseTheme(store.user?.settings?.themeSeed ?? store.user?.name ?? 'verse');
  const [goal, setGoal] = useState('');
  const [neoLine, setNeoLine] = useState('Map your cosmos—each quest ignites the horde.');

  const goals = useMemo(() => store.goals, [store.goals]);

  const handleLaunch = async () => {
    if (!goal.trim()) {
      return;
    }
    await addGoal(goal.trim());
    const quest = await generateQuest(goal.trim());
    setNeoLine(quest);
    setGoal('');
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}
      accessibilityLabel="Board Screen - Goals Dashboard">
      <NeoMascot mood="savage" palette={palette} />
      <Text style={[styles.header, { color: palette.primary }]}>Map Your Cosmos</Text>
      <NeonThreeCanvas variant="starmap" palette={palette} style={styles.canvas} />
      <View style={styles.form}>
        <VerseTextField palette={palette} label="Goal" value={goal} onChangeText={setGoal} />
        <NeonButton title="Launch Quest" onPress={handleLaunch} palette={palette} intensity="heavy" />
      </View>
      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[styles.goalCard, { borderColor: palette.outline, backgroundColor: palette.card }]}>
            <Text style={[styles.goalTitle, { color: palette.text }]}>{item.label}</Text>
            <Text style={[styles.goalMeta, { color: palette.text }]}>Forged {new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
        )}
      />
      <NeoSpeechBubble text={neoLine} palette={palette} />
      <NeonButton title="Storm the Zone" onPress={() => navigation.navigate('Zone')} palette={palette} intensity="medium" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 120,
    paddingHorizontal: 20,
    gap: 16,
  },
  header: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 20,
    letterSpacing: 1.2,
  },
  canvas: {
    height: 240,
  },
  form: {
    gap: 12,
  },
  list: {
    flexGrow: 0,
    maxHeight: 220,
  },
  listContent: {
    gap: 12,
    paddingBottom: 12,
  },
  goalCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  goalTitle: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 16,
  },
  goalMeta: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 12,
    marginTop: 4,
  },
});
