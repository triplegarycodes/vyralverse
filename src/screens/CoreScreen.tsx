import React, { useMemo, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { NeonButton } from '../components/NeonButton';
import { VerseTextField } from '../components/VerseTextField';
import { NeoMascot } from '../components/NeoMascot';
import { NeoSpeechBubble } from '../components/NeoSpeechBubble';
import { NeonThreeCanvas } from '../components/three/NeonThreeCanvas';
import { useVerseTheme } from '../theme';
import { useVerseStore } from '../hooks/useVerseStore';
import { addGoal, createProject } from '../services/dataStore';
import { generateDevotional, processEchoScan } from '../services/skrybe';
import { RootStackParamList } from '../navigation/types';

export type CoreScreenProps = NativeStackScreenProps<RootStackParamList, 'Core'>;

export const CoreScreen: React.FC<CoreScreenProps> = ({ navigation }) => {
  const store = useVerseStore();
  const { palette } = useVerseTheme(store.user?.settings?.themeSeed ?? store.user?.name ?? 'verse');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [devotional, setDevotional] = useState('Crush doubt—hustle’s a blade, Eph 6:12');
  const [echo, setEcho] = useState<{ caption: string; quest: string; reaction: string } | null>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const recentProjects = useMemo(() => store.projects.slice(0, 5), [store.projects]);

  const handleCreateProject = async () => {
    if (!projectTitle.trim()) {
      Alert.alert('Give your forge a title');
      return;
    }
    await createProject(projectTitle.trim(), projectDescription.trim());
    setProjectTitle('');
    setProjectDescription('');
    navigation.navigate('Tree');
  };

  const handleDevotional = async () => {
    const fresh = await generateDevotional();
    setDevotional(fresh);
  };

  const handleScan = async () => {
    if (!permission || !permission.granted) {
      await requestPermission();
    }
    const result = await processEchoScan();
    setEcho(result);
    await addGoal(result.quest);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: palette.background }]}
      contentContainerStyle={styles.content}
      accessibilityLabel="Core Screen - Project Collab">
      <NeoMascot mood={echo ? 'zeal' : 'hype'} palette={palette} />
      <Text style={[styles.header, { color: palette.primary }]}>Forge Your Project</Text>
      <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.outline }]}>
        <VerseTextField palette={palette} label="Project Title" value={projectTitle} onChangeText={setProjectTitle} />
        <VerseTextField
          palette={palette}
          label="Mission Brief"
          value={projectDescription}
          onChangeText={setProjectDescription}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          style={styles.multiline}
        />
        <NeonButton title="Create & Share" onPress={handleCreateProject} palette={palette} intensity="medium" />
      </View>

      <View style={[styles.card, { backgroundColor: '#FFF8E1', borderColor: palette.primary }]}>
        <Text style={[styles.cardTitle, { color: palette.primary }]}>Devotional Spark</Text>
        <Text style={[styles.cardBody, { color: palette.primary }]}>{devotional}</Text>
        <NeonButton title="Pray & Push" onPress={handleDevotional} palette={palette} intensity="medium" />
      </View>

      <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.outline }]}>
        <Text style={[styles.cardTitle, { color: palette.text }]}>Verse Echo</Text>
        {permission?.granted ? (
          <CameraView style={styles.camera} facing="back" />
        ) : (
          <View style={[styles.camera, styles.cameraPlaceholder]}>
            <Text style={[styles.cardBody, { color: palette.text }]}>Tap scan to awaken Verse Echo.</Text>
          </View>
        )}
        <NeonButton title="Scan & Echo" onPress={handleScan} palette={palette} intensity="heavy" />
        {echo ? (
          <View>
            <Text style={[styles.cardBody, { color: palette.text }]}>Caption: {echo.caption}</Text>
            <Text style={[styles.cardBody, { color: palette.text }]}>Quest: {echo.quest}</Text>
            <NeonThreeCanvas variant="echo" palette={palette} style={styles.canvas} />
            <NeoSpeechBubble text={echo.reaction} palette={palette} />
          </View>
        ) : null}
      </View>

      <Text style={[styles.subHeader, { color: palette.text }]}>Recent Projects</Text>
      <FlatList
        data={recentProjects}
        keyExtractor={(item) => item.id}
        horizontal
        contentContainerStyle={styles.projectList}
        renderItem={({ item }) => (
          <View style={[styles.projectCard, { borderColor: palette.outline, backgroundColor: palette.card }]}>
            <Text style={[styles.projectTitle, { color: palette.text }]}>{item.title}</Text>
            <Text style={[styles.projectDescription, { color: palette.text }]} numberOfLines={2}>
              {item.description || 'No description—just raw neon intent.'}
            </Text>
          </View>
        )}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 120,
    paddingBottom: 80,
    gap: 24,
  },
  header: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 20,
    letterSpacing: 1.2,
  },
  subHeader: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 18,
    marginTop: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 18,
    letterSpacing: 1,
  },
  cardBody: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  multiline: {
    minHeight: 80,
  },
  camera: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  cameraPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FF4500',
    backgroundColor: 'rgba(28,37,38,0.6)',
  },
  canvas: {
    marginTop: 12,
    height: 180,
  },
  projectList: {
    gap: 16,
  },
  projectCard: {
    width: 200,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  projectTitle: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 16,
    marginBottom: 8,
  },
  projectDescription: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 12,
    lineHeight: 18,
  },
});
