import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Camera as CameraIcon, Scan, Zap, AlertCircle } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { EnvironmentScan, Quest } from '@core/types';
import { colors, withOpacity } from '../styles/neon';

interface LensCoreInterfaceProps {
  onQuestGenerated: (quest: Quest) => void;
}

export const LensCoreInterface: React.FC<LensCoreInterfaceProps> = ({ onQuestGenerated }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const hasCameraAccess = Boolean(permission?.granted);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<EnvironmentScan | null>(null);
  const [generatedQuests, setGeneratedQuests] = useState<Quest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 1024;

  useEffect(() => {
    if (!permission) {
      requestPermission().catch(() => {
        setError('Camera access denied. Please enable camera permissions.');
      });
    }
  }, [permission, requestPermission]);

  const simulateObjectDetection = (): EnvironmentScan => {
    const objects = [
      { label: 'book', confidence: 0.92, bounds: { x: 100, y: 100, width: 200, height: 300 }, context: 'study_tool' as const },
      { label: 'laptop', confidence: 0.88, bounds: { x: 350, y: 150, width: 400, height: 250 }, context: 'study_tool' as const },
      { label: 'cell phone', confidence: 0.78, bounds: { x: 500, y: 50, width: 100, height: 150 }, context: 'distraction' as const },
    ];

    return {
      objects,
      people: 1,
      activity: 'studying',
      mood: 'focused',
      location: 'study_room',
      timeOfDay: new Date().getHours() < 12 ? 'morning' : 'afternoon',
      userState: {
        likelyIntent: 'academic_work',
        focusLevel: 0.8,
        energyEstimate: 0.7,
        stressIndicators: 0.3,
      },
    };
  };

  const generateQuestsFromEnvironment = (scan: EnvironmentScan): Quest[] => {
    const quests: Quest[] = [];
    const baseId = `quest_${Date.now()}`;

    if (scan.activity === 'studying') {
      quests.push({
        id: `${baseId}_study`,
        title: '📚 Study Session Quest',
        description: 'Master your current subject with focused practice',
        type: 'learning',
        difficulty: 3,
        objectives: [
          {
            id: 'obj_1',
            description: '25 minutes of focused study time',
            type: 'action',
            quantity: 1,
            completed: false,
          },
          {
            id: 'obj_2',
            description: 'Summarize 3 key concepts',
            type: 'create',
            quantity: 3,
            completed: false,
          },
        ],
        rewards: [
          { type: 'xp', value: 200 },
          { type: 'vTokens', value: 75 },
        ],
        timeLimit: 45,
        environmentRequirements: scan,
        generatedFrom: 'camera',
      });
    }

    quests.push({
      id: `${baseId}_focus`,
      title: '🎯 Deep Focus Challenge',
      description: 'Eliminate distractions and enter flow state',
      type: 'focus',
      difficulty: 2,
      objectives: [
        {
          id: 'obj_1',
          description: 'Put phone on silent mode',
          type: 'action',
          quantity: 1,
          completed: false,
        },
        {
          id: 'obj_2',
          description: 'Work without breaks for 30min',
          type: 'action',
          quantity: 1,
          completed: false,
        },
      ],
      rewards: [
        { type: 'xp', value: 150 },
        { type: 'vTokens', value: 50 },
      ],
      timeLimit: 30,
      environmentRequirements: scan,
      generatedFrom: 'camera',
    });

    return quests;
  };

  const handleScan = async () => {
    if (!hasCameraAccess) {
      const status = await requestPermission();
      if (!status?.granted) {
        setError('No camera access. Please enable permissions and try again.');
        return;
      }
    }

    setIsScanning(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const result = simulateObjectDetection();
      setScanResult(result);

      const quests = generateQuestsFromEnvironment(result);
      setGeneratedQuests(quests);
    } catch (err) {
      setError('Scan failed. Please try again.');
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const acceptQuest = (quest: Quest) => {
    onQuestGenerated(quest);
    setGeneratedQuests((prev) => prev.filter((q) => q.id !== quest.id));
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <CameraIcon size={32} color={colors.verseCyan} style={styles.inlineIcon} />
          <View>
            <Text style={styles.headerTitle}>FLWX Lens Core</Text>
            <Text style={styles.headerSubtitle}>AI-Powered Environment Scanner</Text>
          </View>
        </View>

        <View style={[styles.gridRow, isLargeScreen && styles.gridRowWide]}>
          <View style={[styles.leftColumn, isLargeScreen && styles.leftColumnWide]}>
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Environment Scanner</Text>

              <View style={styles.cameraWrapper}>
                {hasCameraAccess ? (
                  <CameraView style={styles.cameraPreview} facing="back" />
                ) : (
                  <View style={styles.cameraPlaceholder}>
                    <AlertCircle size={32} color={colors.verseOrange} style={styles.inlineIcon} />
                    <Text style={styles.placeholderText}>Camera access required</Text>
                    <Pressable style={styles.permissionButton} onPress={() => requestPermission()}>
                      <Text style={styles.permissionButtonText}>Grant Permission</Text>
                    </Pressable>
                  </View>
                )}

                {isScanning && (
                  <View style={styles.cameraOverlay}>
                    <ActivityIndicator size="large" color={colors.verseCyan} />
                    <Text style={styles.overlayText}>Analyzing Environment...</Text>
                  </View>
                )}
              </View>

              <Pressable
                onPress={handleScan}
                disabled={isScanning}
                style={[styles.scanButton, isScanning && styles.scanButtonDisabled]}
              >
                <Scan size={20} color={colors.verseBlack} style={styles.inlineIcon} />
                <Text style={styles.scanButtonText}>{isScanning ? 'Scanning...' : 'Scan Environment'}</Text>
              </Pressable>

              {error && (
                <View style={styles.errorBanner}>
                  <AlertCircle size={20} color={withOpacity('#ff4d67', 0.9)} style={styles.inlineIcon} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
            </View>

            {scanResult && (
              <View style={styles.analysisPanel}>
                <Text style={styles.analysisTitle}>Environment Analysis</Text>

                <View style={styles.analysisGrid}>
                  <View style={styles.analysisColumn}>
                    <View style={styles.analysisItem}>
                      <Text style={styles.analysisLabel}>Activity</Text>
                      <Text style={styles.analysisValue}>{scanResult.activity}</Text>
                    </View>
                    <View style={styles.analysisItem}>
                      <Text style={styles.analysisLabel}>Mood</Text>
                      <Text style={styles.analysisValue}>{scanResult.mood}</Text>
                    </View>
                    <View style={styles.analysisItem}>
                      <Text style={styles.analysisLabel}>Focus Level</Text>
                      <Text style={styles.analysisValue}>{(scanResult.userState.focusLevel * 100).toFixed(0)}%</Text>
                    </View>
                  </View>
                  <View style={[styles.analysisColumn, styles.analysisColumnRight]}>
                    <View style={styles.analysisItem}>
                      <Text style={styles.analysisLabel}>Location</Text>
                      <Text style={styles.analysisValue}>{scanResult.location}</Text>
                    </View>
                    <View style={styles.analysisItem}>
                      <Text style={styles.analysisLabel}>People</Text>
                      <Text style={styles.analysisValue}>{scanResult.people}</Text>
                    </View>
                    <View style={styles.analysisItem}>
                      <Text style={styles.analysisLabel}>Energy</Text>
                      <Text style={styles.analysisValue}>{(scanResult.userState.energyEstimate * 100).toFixed(0)}%</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.objectTagsSection}>
                  <Text style={styles.objectTagsTitle}>Detected Objects</Text>
                  <View style={styles.objectTagRow}>
                    {scanResult.objects.map((obj, index) => (
                      <View key={index} style={styles.objectTag}>
                        <Text style={styles.objectTagText}>
                          {obj.label} ({(obj.confidence * 100).toFixed(0)}%)
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </View>

          <View style={styles.rightColumn}>
            <View style={styles.generatedHeader}>
              <Zap size={24} color={colors.verseOrange} style={styles.inlineIcon} />
              <Text style={styles.generatedTitle}>Generated Quests</Text>
            </View>

            {generatedQuests.length === 0 ? (
              <View style={styles.emptyState}>
                <Zap size={48} color={withOpacity(colors.verseOrange, 0.5)} />
                <Text style={styles.emptyStateTitle}>No Quests Yet</Text>
                <Text style={styles.emptyStateSubtitle}>Scan your environment to generate personalized quests!</Text>
                <Text style={styles.emptyStateHint}>The AI will analyze what it sees and create perfect challenges.</Text>
              </View>
            ) : (
              generatedQuests.map((quest) => (
                <View key={quest.id} style={styles.questCard}>
                  <View style={styles.questHeader}>
                    <View style={styles.questInfo}>
                      <Text style={styles.questTitle}>{quest.title}</Text>
                      <Text style={styles.questDescription}>{quest.description}</Text>
                    </View>
                    <View style={styles.questMeta}>
                      {quest.timeLimit && <Text style={styles.questTime}>{quest.timeLimit}min</Text>}
                      <Text style={styles.questReward}>+{quest.rewards.find((r) => r.type === 'xp')?.value} XP</Text>
                    </View>
                  </View>

                  <View style={styles.objectiveList}>
                    {quest.objectives.map((objective) => (
                      <View key={objective.id} style={styles.objectiveRow}>
                        <View
                          style={[
                            styles.objectiveIndicator,
                            objective.completed && styles.objectiveIndicatorCompleted,
                          ]}
                        >
                          {objective.completed && <Text style={styles.objectiveCheck}>✓</Text>}
                        </View>
                        <Text
                          style={[
                            styles.objectiveText,
                            objective.completed && styles.objectiveTextComplete,
                          ]}
                        >
                          {objective.description}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.questFooter}>
                    <View style={styles.rewardChips}>
                      {quest.rewards.map((reward, index) => (
                        <View key={index} style={styles.rewardChip}>
                          <Text style={styles.rewardChipText}>
                            {reward.type === 'xp' && '⚡'}
                            {reward.type === 'vTokens' && '🪙'}
                            {reward.value} {reward.type}
                          </Text>
                        </View>
                      ))}
                    </View>
                    <Pressable style={styles.acceptButton} onPress={() => acceptQuest(quest)}>
                      <Text style={styles.acceptButtonText}>Accept Quest</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 16,
  },
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  inlineIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.verseCyan,
  },
  headerSubtitle: {
    color: withOpacity(colors.verseCyan, 0.7),
    fontSize: 14,
  },
  gridRow: {
    flexDirection: 'column',
  },
  gridRowWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  leftColumn: {
    flex: 1,
    marginBottom: 24,
  },
  leftColumnWide: {
    marginRight: 24,
    marginBottom: 0,
  },
  rightColumn: {
    flex: 1,
  },
  panel: {
    backgroundColor: withOpacity('#0d1529', 0.9),
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: withOpacity(colors.verseCyan, 0.18),
    marginBottom: 24,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.verseCyan,
    marginBottom: 16,
  },
  cameraWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: withOpacity(colors.verseCyan, 0.3),
    backgroundColor: '#000',
    marginBottom: 16,
    minHeight: 200,
  },
  cameraPreview: {
    width: '100%',
    height: 220,
  },
  cameraPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: withOpacity(colors.gray900, 0.6),
  },
  placeholderText: {
    color: colors.verseOrange,
    fontWeight: '600',
    marginBottom: 12,
  },
  permissionButton: {
    backgroundColor: colors.verseOrange,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  permissionButtonText: {
    color: colors.verseBlack,
    fontWeight: '700',
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: withOpacity('#000', 0.5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayText: {
    color: colors.verseCyan,
    fontWeight: '700',
    marginTop: 12,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.verseCyan,
    borderRadius: 12,
    paddingVertical: 12,
  },
  scanButtonDisabled: {
    opacity: 0.6,
  },
  scanButtonText: {
    color: colors.verseBlack,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: withOpacity('#ff4d67', 0.12),
    borderWidth: 1,
    borderColor: withOpacity('#ff4d67', 0.3),
  },
  errorText: {
    color: withOpacity('#ff4d67', 0.9),
    fontSize: 13,
  },
  analysisPanel: {
    backgroundColor: withOpacity('#111a33', 0.85),
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: withOpacity(colors.versePurple, 0.2),
    marginTop: 24,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.versePurple,
    marginBottom: 16,
  },
  analysisGrid: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  analysisColumn: {
    flex: 1,
  },
  analysisColumnRight: {
    marginLeft: 16,
  },
  analysisItem: {
    marginBottom: 12,
  },
  analysisLabel: {
    color: withOpacity(colors.gray400, 0.9),
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  analysisValue: {
    color: colors.verseCyan,
    fontWeight: '600',
    marginTop: 4,
  },
  objectTagsSection: {
    marginTop: 12,
  },
  objectTagsTitle: {
    color: colors.verseGreen,
    fontWeight: '700',
    marginBottom: 8,
  },
  objectTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  objectTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: withOpacity(colors.verseGreen, 0.12),
    borderWidth: 1,
    borderColor: withOpacity(colors.verseGreen, 0.2),
    marginRight: 8,
    marginBottom: 8,
  },
  objectTagText: {
    color: colors.verseGreen,
    fontSize: 12,
  },
  generatedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  generatedTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.verseOrange,
  },
  emptyState: {
    backgroundColor: withOpacity('#1a1424', 0.9),
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: withOpacity(colors.verseOrange, 0.2),
  },
  emptyStateTitle: {
    color: withOpacity(colors.verseOrange, 0.7),
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  emptyStateSubtitle: {
    color: withOpacity(colors.gray300, 0.9),
    textAlign: 'center',
    marginTop: 8,
  },
  emptyStateHint: {
    color: withOpacity(colors.gray400, 0.9),
    textAlign: 'center',
    marginTop: 6,
    fontSize: 12,
  },
  questCard: {
    backgroundColor: withOpacity('#0f172a', 0.88),
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: withOpacity(colors.verseOrange, 0.25),
    marginBottom: 16,
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  questInfo: {
    flex: 1,
    paddingRight: 12,
  },
  questTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.verseOrange,
  },
  questDescription: {
    color: withOpacity(colors.gray300, 0.9),
    marginTop: 6,
    fontSize: 13,
  },
  questMeta: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  questTime: {
    color: colors.verseCyan,
    fontWeight: '700',
    fontSize: 16,
  },
  questReward: {
    color: colors.verseGreen,
    fontWeight: '600',
    marginTop: 4,
  },
  objectiveList: {
    marginTop: 16,
  },
  objectiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  objectiveIndicator: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: withOpacity(colors.verseCyan, 0.4),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  objectiveIndicatorCompleted: {
    backgroundColor: colors.verseGreen,
    borderColor: colors.verseGreen,
  },
  objectiveCheck: {
    color: colors.verseBlack,
    fontWeight: '700',
    fontSize: 12,
  },
  objectiveText: {
    color: withOpacity('#ffffff', 0.85),
    flex: 1,
  },
  objectiveTextComplete: {
    color: withOpacity(colors.gray400, 0.9),
    textDecorationLine: 'line-through',
  },
  questFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: withOpacity(colors.gray700, 0.6),
    paddingTop: 16,
  },
  rewardChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  rewardChip: {
    backgroundColor: withOpacity(colors.verseCyan, 0.12),
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  rewardChipText: {
    color: colors.verseCyan,
    fontSize: 12,
  },
  acceptButton: {
    backgroundColor: colors.verseOrange,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  acceptButtonText: {
    color: colors.verseBlack,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
