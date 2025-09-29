import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NeonButton } from '../components/NeonButton';
import { NeonThreeCanvas } from '../components/three/NeonThreeCanvas';
import { NeoMascot } from '../components/NeoMascot';
import { VerseTextField } from '../components/VerseTextField';
import { useVerseTheme } from '../theme';
import { useVerseStore } from '../hooks/useVerseStore';
import { addSeed } from '../services/dataStore';
import { RootStackParamList } from '../navigation/types';

export type TreeScreenProps = NativeStackScreenProps<RootStackParamList, 'Tree'>;

export const TreeScreen: React.FC<TreeScreenProps> = ({ navigation }) => {
  const store = useVerseStore();
  const { palette } = useVerseTheme(store.user?.settings?.themeSeed ?? store.user?.name ?? 'verse');
  const [seed, setSeed] = useState('');

  const seeds = useMemo(() => store.seeds, [store.seeds]);

  const handleBranchOut = async () => {
    if (!seed.trim()) {
      return;
    }
    await addSeed(seed.trim());
    setSeed('');
  };

  return (
    <View style={[styles.container, { backgroundColor: '#228B22' }]}
      accessibilityLabel="Tree Screen - Data Visualization">
      <NeoMascot mood="hype" palette={palette} />
      <Text style={[styles.header, { color: palette.accent }]}>Plant Your Seed</Text>
      <NeonThreeCanvas variant="tree" palette={{ ...palette, background: '#228B22' }} style={styles.canvas} />
      <View style={styles.form}>
        <VerseTextField palette={palette} label="Skill or Project Seed" value={seed} onChangeText={setSeed} />
        <NeonButton title="Branch Out" onPress={handleBranchOut} palette={palette} intensity="medium" />
      </View>
      <FlatList
        data={seeds}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[styles.seedCard, { borderColor: palette.outline, backgroundColor: palette.card }]}>
            <Text style={[styles.seedTitle, { color: palette.text }]}>{item.label}</Text>
            <Text style={[styles.seedBody, { color: palette.text }]}>XP rises with every grind.</Text>
          </View>
        )}
      />
      <NeonButton title="Map Goals" onPress={() => navigation.navigate('Board')} palette={palette} intensity="medium" />
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
    height: 260,
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
    paddingBottom: 16,
  },
  seedCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  seedTitle: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 16,
  },
  seedBody: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 12,
  },
});
