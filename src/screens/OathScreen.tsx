import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NeonButton } from '../components/NeonButton';
import { NeoMascot } from '../components/NeoMascot';
import { NeonThreeCanvas } from '../components/three/NeonThreeCanvas';
import { useVerseTheme } from '../theme';
import { useVerseStore } from '../hooks/useVerseStore';
import { signOath } from '../services/dataStore';
import { RootStackParamList } from '../navigation/types';

export type OathScreenProps = NativeStackScreenProps<RootStackParamList, 'Oath'>;

export const OathScreen: React.FC<OathScreenProps> = ({ navigation }) => {
  const store = useVerseStore();
  const { palette } = useVerseTheme(store.user?.settings?.themeSeed ?? store.user?.name ?? 'verse');
  const [signed, setSigned] = useState(!!store.user?.oathSigned);

  const handleEtch = async () => {
    await signOath();
    setSigned(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: '#228B22' }]}
      accessibilityLabel="Oath Screen - Eternal Commitment">
      <NeoMascot mood={signed ? 'loyal' : 'spark'} palette={palette} />
      <Text style={[styles.header, { color: palette.accent }]}>Seal Your Verse</Text>
      <NeonThreeCanvas variant="forest" palette={{ ...palette, background: '#228B22' }} style={styles.canvas} />
      <Text style={[styles.oathText, { color: palette.text }]}>
        I join V’erse to forge, create, connect, crush with faith.
      </Text>
      {signed ? (
        <Text style={[styles.signedText, { color: palette.primary }]}>Horde Awakens</Text>
      ) : (
        <NeonButton title="Etch Eternal" onPress={handleEtch} palette={palette} intensity="heavy" />
      )}
      <NeonButton title="Forge Your Arsenal" onPress={() => navigation.navigate('Shop')} palette={palette} intensity="medium" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 120,
    paddingHorizontal: 24,
    gap: 18,
  },
  header: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 20,
    letterSpacing: 1.2,
  },
  canvas: {
    height: 220,
  },
  oathText: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  signedText: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 12,
  },
});
