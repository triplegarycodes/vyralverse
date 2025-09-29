import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { VerseGlyph } from '../components/VerseGlyph';
import { NeonButton } from '../components/NeonButton';
import { VerseTextField } from '../components/VerseTextField';
import { NeoMascot } from '../components/NeoMascot';
import { useVerseTheme } from '../theme';
import { useVerseStore } from '../hooks/useVerseStore';
import { saveUserName, updateThemeSeed } from '../services/dataStore';
import { RootStackParamList } from '../navigation/types';

export type SparkScreenProps = NativeStackScreenProps<RootStackParamList, 'Spark'>;

export const SparkScreen: React.FC<SparkScreenProps> = ({ navigation }) => {
  const { user } = useVerseStore();
  const [name, setName] = useState(user?.name ?? '');
  const { palette, updateSeed } = useVerseTheme(user?.settings?.themeSeed ?? 'verse');

  const handleIgnite = async () => {
    if (!name.trim()) {
      Alert.alert('Etch your name');
      return;
    }
    await saveUserName(name.trim());
    await updateThemeSeed(name.trim());
    updateSeed(name.trim());
    navigation.navigate('Core');
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}
      accessibilityLabel="Spark Screen - Entry Void">
      <NeoMascot mood="chill" palette={palette} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.glyphContainer}>
          <VerseGlyph size={120} color={palette.accent} />
        </View>
        <Text style={[styles.header, { color: palette.primary }]}>Welcome to V’erse. Etch your name.</Text>
        <VerseTextField
          palette={palette}
          value={name}
          onChangeText={setName}
          accessibilityLabel="Name input"
          placeholder="Neo Hustler"
        />
        <NeonButton title="Ignite" onPress={handleIgnite} palette={palette} intensity="light" />
        <Text style={[styles.hint, { color: palette.text }]}>Swipe left for a holo tutorial guided by Neo.</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  content: {
    paddingTop: 120,
    paddingBottom: 60,
  },
  glyphContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  header: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 1.5,
  },
  hint: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
});
