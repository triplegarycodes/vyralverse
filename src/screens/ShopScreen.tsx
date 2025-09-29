import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Switch, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NeonButton } from '../components/NeonButton';
import { NeoMascot } from '../components/NeoMascot';
import { VerseTextField } from '../components/VerseTextField';
import { useVerseTheme } from '../theme';
import { useVerseStore } from '../hooks/useVerseStore';
import { purchaseItem, toggleHaptics, updateThemeSeed } from '../services/dataStore';
import { RootStackParamList } from '../navigation/types';

const packs = [
  { id: 'zeal', title: 'Neon Zeal Skin', price: '$4.99', description: 'Ignite Neo with ember glow shaders.' },
  { id: 'chaos', title: 'Chaos Rune Skin', price: '$6.99', description: 'Rune-lit UI overlays & forge particles.' },
  { id: 'echo', title: 'Verse Echo Booster', price: '$9.99', description: 'Faster BLIP scans + story arcs.' },
];

export type ShopScreenProps = NativeStackScreenProps<RootStackParamList, 'Shop'>;

export const ShopScreen: React.FC<ShopScreenProps> = ({ navigation }) => {
  const store = useVerseStore();
  const { palette, updateSeed } = useVerseTheme(store.user?.settings?.themeSeed ?? store.user?.name ?? 'verse');
  const [themeSeed, setThemeSeed] = useState(store.user?.settings?.themeSeed ?? store.user?.name ?? 'verse');
  const hapticsEnabled = useMemo(() => store.user?.settings?.haptics ?? true, [store.user?.settings?.haptics]);

  const handlePurchase = async (item: { id: string; title: string; price: string }) => {
    await purchaseItem(item.title, item.price);
  };

  const handleHapticsToggle = async (value: boolean) => {
    await toggleHaptics(value);
  };

  const handleThemeSave = async () => {
    await updateThemeSeed(themeSeed);
    updateSeed(themeSeed);
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}
      accessibilityLabel="Shop Screen - V-Packs">
      <NeoMascot mood="spark" palette={palette} />
      <Text style={[styles.header, { color: palette.primary }]}>Forge Your Arsenal</Text>
      <FlatList
        data={packs}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[styles.packCard, { borderColor: palette.outline, backgroundColor: palette.card }]}>
            <Text style={[styles.packTitle, { color: palette.text }]}>{item.title}</Text>
            <Text style={[styles.packDescription, { color: palette.text }]}>{item.description}</Text>
            <Text style={[styles.packPrice, { color: palette.accent }]}>{item.price}</Text>
            <NeonButton title="Unlock" onPress={() => handlePurchase(item)} palette={palette} intensity="medium" />
          </View>
        )}
      />
      <View style={[styles.settingsCard, { borderColor: palette.outline, backgroundColor: palette.card }]}>
        <Text style={[styles.settingsTitle, { color: palette.text }]}>Settings</Text>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: palette.text }]}>Haptic Intensity</Text>
          <Switch
            value={hapticsEnabled}
            onValueChange={handleHapticsToggle}
            trackColor={{ true: palette.primary, false: '#555' }}
            thumbColor={hapticsEnabled ? palette.accent : '#999'}
          />
        </View>
        <VerseTextField palette={palette} label="Theme Glyph" value={themeSeed} onChangeText={setThemeSeed} />
        <NeonButton title="Save Theme" onPress={handleThemeSave} palette={palette} intensity="medium" />
      </View>
      <NeonButton title="Back to Core" onPress={() => navigation.navigate('Core')} palette={palette} intensity="medium" />
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
  list: {
    flexGrow: 0,
    maxHeight: 320,
  },
  listContent: {
    gap: 16,
    paddingBottom: 20,
  },
  packCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  packTitle: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 16,
  },
  packDescription: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  packPrice: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 14,
  },
  settingsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  settingsTitle: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 18,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLabel: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 14,
  },
});
