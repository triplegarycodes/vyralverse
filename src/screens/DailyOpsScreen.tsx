import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NeonButton } from '../components/NeonButton';
import { useVerseTheme } from '../theme';
import { useVerseStore } from '../hooks/useVerseStore';
import { RootStackParamList } from '../navigation/types';
import {
  createMorningRoutineManager,
  type MorningActivationPlan,
} from '../services/morningRoutine';
import {
  createSchoolIntegrationEngine,
  type ClassDetectionResult,
} from '../services/classIntegration';
import { adaptiveQuestEngine } from '../services/questEngine';
import {
  createEveningReviewManager,
  type EveningReviewSummary,
} from '../services/eveningReview';
import {
  createCrossPlatformDataSyncService,
  type SyncPayload,
} from '../services/dataSync';
import {
  createCounselingAutomationEngine,
  type CounselingIntervention,
} from '../services/counselingAutomation';
import { lensCoreEnvironmentAnalyzer, type LensCoreContext } from '../services/environmentAnalysis';
import type { QuestGenerationResult } from '../services/questEngine';

export type DailyOpsScreenProps = NativeStackScreenProps<RootStackParamList, 'DailyOps'>;

const supabaseUrl =
  Constants.expoConfig?.extra?.supabaseUrl ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://demo.supabase.co';
const supabaseAnonKey =
  Constants.expoConfig?.extra?.supabaseAnonKey ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo';
const websocketUrl =
  Constants.expoConfig?.extra?.websocketUrl ?? process.env.EXPO_PUBLIC_WEBSOCKET_URL ?? 'wss://ws.vyralverse.dev';
const openAiKey = Constants.expoConfig?.extra?.openAiKey ?? process.env.EXPO_PUBLIC_OPENAI_KEY;

const morningContext: LensCoreContext = {
  location: 'bedroom',
  timeOfDay: 'morning',
  scheduleFocus: 'Algebra II',
  ambientNoiseDb: 32,
  heartRate: 68,
};

const algebraClassContext: LensCoreContext = {
  location: 'Room 204 - Algebra II',
  timeOfDay: 'morning',
  scheduleFocus: 'Algebra II',
  ambientNoiseDb: 58,
  heartRate: 82,
};

const afterSchoolContext: LensCoreContext = {
  location: 'Home Study Nook',
  timeOfDay: 'afternoon',
  scheduleFocus: 'Algebra mastery',
  ambientNoiseDb: 28,
  heartRate: 74,
};

const scenarioTimelines = [
  {
    title: 'The Struggling Math Student',
    items: [
      '6:45 AM · Morning energy scan shows low motivation → Suggests 5-minute math puzzle to build confidence',
      '2:15 PM · Detects math class frustration through camera → Schedules after-school tutoring automatically',
      "3:30 PM · Homework scan shows repeated errors → Generates 'Algebra Foundation Builder' quest series",
      "7:00 PM · Progress review shows 80% improvement → Unlocks 'Math Persistence' skill badge",
    ],
  },
  {
    title: 'The College-Bound Senior',
    items: [
      '7:00 AM · Detects high stress levels → Suggests mindfulness quest before school',
      '10:30 AM · AP Physics class → Auto-generates concept reinforcement quests',
      '4:00 PM · College essay writing → AI co-pilot suggests structure improvements',
      '8:00 PM · Portfolio review → Identifies missing extracurricular experiences',
    ],
  },
  {
    title: 'The Undecided Career Explorer',
    items: [
      '8:30 AM · Career interest quiz results → Suggests relevant CTE pathways',
      '1:00 PM · Project work detection → Matches skills to potential careers',
      "5:00 PM · Generates 'Career Explorer' quest series with local business connections",
      "9:00 PM · Skill tree shows aptitude for design → Suggests graphic design mentorship",
    ],
  },
];

export const DailyOpsScreen: React.FC<DailyOpsScreenProps> = ({ navigation }) => {
  const store = useVerseStore();
  const { palette } = useVerseTheme(store.user?.settings?.themeSeed ?? store.user?.name ?? 'vyral');
  const userId = store.user?.name ?? 'demo-student-01';

  const services = useMemo(() => {
    return {
      morning: createMorningRoutineManager({ supabaseUrl, supabaseAnonKey, openAiKey }),
      school: createSchoolIntegrationEngine({ supabaseUrl, supabaseAnonKey }),
      evening: createEveningReviewManager({ supabaseUrl, supabaseAnonKey }),
      dataSync: createCrossPlatformDataSyncService({ supabaseUrl, supabaseAnonKey, websocketUrl }),
      counseling: createCounselingAutomationEngine({ supabaseUrl, supabaseAnonKey }),
    };
  }, []);

  const [morningPlan, setMorningPlan] = useState<MorningActivationPlan | null>(null);
  const [classIntegration, setClassIntegration] = useState<ClassDetectionResult | null>(null);
  const [afterSchoolQuest, setAfterSchoolQuest] = useState<QuestGenerationResult | null>(null);
  const [eveningSummary, setEveningSummary] = useState<EveningReviewSummary | null>(null);
  const [syncPayload, setSyncPayload] = useState<SyncPayload | null>(null);
  const [intervention, setIntervention] = useState<CounselingIntervention | null>(null);

  useEffect(() => {
    let isMounted = true;
    let disposeSync: (() => void) | undefined;

    const run = async () => {
      try {
        await lensCoreEnvironmentAnalyzer.ready();

        const plan = await services.morning.planMorning({
          userId,
          wakeTime: '06:45',
          biometricEnergy: 0.58,
          selfReportedEnergy: 0.52,
          commuteMinutes: 25,
          scheduleFocus: 'Algebra Test Prep',
          upcomingAssessments: ['Algebra II Quiz (Friday)', 'Physics Lab (Tuesday)'],
          lensContext: morningContext,
        });
        if (!isMounted) {
          return;
        }
        setMorningPlan(plan);

        const classResult = await services.school.detectClass({
          userId,
          scheduleBlockId: 'block-algebra-2',
          gpsCourseCode: 'ALGII-204',
          lensContext: algebraClassContext,
        });
        if (!isMounted) {
          return;
        }
        setClassIntegration(classResult);

        const afterSynthetic = lensCoreEnvironmentAnalyzer.createSyntheticTensor(afterSchoolContext);
        const afterScan = await lensCoreEnvironmentAnalyzer.analyzeCameraTensor(afterSynthetic, afterSchoolContext);
        afterSynthetic.dispose();
        if (!isMounted) {
          return;
        }
        const quest = adaptiveQuestEngine.generateQuest({
          userId,
          subject: 'Algebra II',
          environment: afterScan.scan,
          focus: 'Homework mastery and error correction',
          availableMinutes: 90,
          energyLevel: 0.63,
          learningStyle: 'visual',
          recentPerformance: { completionRate: 0.62, accuracy: 0.55 },
          academicCalendar: { nextAssessment: 'Algebra II Quiz (Friday)', dueToday: ['Problem Set 7B'] },
          preferences: { collaborators: ['Study Buddy Ava'], challengeBias: 'balanced' },
        });
        setAfterSchoolQuest(quest);

        const evening = await services.evening.generateSummary({ userId, date: new Date().toISOString().slice(0, 10) });
        if (!isMounted) {
          return;
        }
        setEveningSummary(evening);

        const riskSignal = await services.counseling.evaluateRisk(userId);
        if (!isMounted) {
          return;
        }
        const scheduled = await services.counseling.scheduleIntervention(riskSignal);
        setIntervention(scheduled);

        disposeSync = services.dataSync.onSync((payload) => {
          setSyncPayload(payload);
        });
        await services.dataSync.connect(userId);
        await services.dataSync.requestSync(userId);
      } catch (error) {
        console.warn('DailyOpsScreen bootstrap error', error);
      }
    };

    run();

    return () => {
      isMounted = false;
      disposeSync?.();
    };
  }, [services, userId]);

  const paletteStyles = useMemo(
    () => ({
      card: [styles.card, { backgroundColor: palette.card, borderColor: palette.outline }],
      header: [styles.header, { color: palette.primary }],
      subheader: [styles.subheader, { color: palette.text }],
      body: [styles.body, { color: palette.text }],
      accent: [styles.accent, { color: palette.primary }],
    }),
    [palette],
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: palette.background }]}
      contentContainerStyle={styles.content}
      accessibilityLabel="Daily Ops Screen">
      <Text style={paletteStyles.header}>Vyral Daily Ops · High School Flow</Text>

      <View style={paletteStyles.card}>
        <Text style={paletteStyles.subheader}>Morning Activation (6:30 AM - 8:00 AM)</Text>
        {morningPlan ? (
          <View>
            <Text style={paletteStyles.body}>Energy Score: {Math.round(morningPlan.energyScore * 100)}%</Text>
            <Text style={paletteStyles.body}>{morningPlan.aiMessage}</Text>
            <Text style={paletteStyles.accent}>Quest Preview</Text>
            {morningPlan.questPreview.map((quest) => (
              <View key={quest.id} style={styles.questItem}>
                <Text style={paletteStyles.body}>{quest.title}</Text>
                <Text style={paletteStyles.body}>Difficulty: {Math.round(quest.difficulty * 100)}%</Text>
              </View>
            ))}
            <Text style={paletteStyles.accent}>Commute Boost</Text>
            {morningPlan.commuteContent.map((item) => (
              <Text key={item.title} style={paletteStyles.body}>
                {item.title} · {item.duration} min
              </Text>
            ))}
          </View>
        ) : (
          <Text style={paletteStyles.body}>Calibrating wake-up intelligence…</Text>
        )}
      </View>

      <View style={paletteStyles.card}>
        <Text style={paletteStyles.subheader}>School Integration (8:00 AM - 3:00 PM)</Text>
        {classIntegration ? (
          <View>
            <Text style={paletteStyles.body}>
              Class Detected: {classIntegration.courseName} ({Math.round(classIntegration.confidence * 100)}%)
            </Text>
            <Text style={paletteStyles.body}>Assignments Synced: {classIntegration.assignmentsDue.join(', ') || 'None'}</Text>
            <Text style={paletteStyles.body}>Focus Level: {Math.round(classIntegration.focusScore * 100)}%</Text>
            {classIntegration.breakSuggestion ? (
              <Text style={paletteStyles.body}>Next Break: {classIntegration.breakSuggestion}</Text>
            ) : null}
            {classIntegration.activeQuest ? (
              <View style={styles.questItem}>
                <Text style={paletteStyles.body}>{classIntegration.activeQuest.title}</Text>
                <Text style={paletteStyles.body}>{classIntegration.activeQuest.description}</Text>
              </View>
            ) : null}
            <Text style={paletteStyles.accent}>Collaboration Radar</Text>
            <Text style={paletteStyles.body}>
              {classIntegration.collaborationMatches.join(', ') || 'No peer matches required today.'}
            </Text>
          </View>
        ) : (
          <Text style={paletteStyles.body}>Mapping schedule to smart class awareness…</Text>
        )}
      </View>

      <View style={paletteStyles.card}>
        <Text style={paletteStyles.subheader}>After-School Deep Work (3:00 PM - 6:00 PM)</Text>
        {afterSchoolQuest ? (
          <View>
            <Text style={paletteStyles.body}>{afterSchoolQuest.quest.title}</Text>
            <Text style={paletteStyles.body}>{afterSchoolQuest.quest.description}</Text>
            <Text style={paletteStyles.body}>
              Focus Sessions: 3 × 25-min Pomodoro | Rewards: {afterSchoolQuest.quest.rewards.map((reward) => reward.label ?? reward.type).join(', ')}
            </Text>
            <Text style={paletteStyles.body}>Adaptation Strategy: {afterSchoolQuest.adaptationStrategy}</Text>
          </View>
        ) : (
          <Text style={paletteStyles.body}>Converting homework into dynamic quests…</Text>
        )}
      </View>

      <View style={paletteStyles.card}>
        <Text style={paletteStyles.subheader}>Evening Wind-Down (6:00 PM - 10:00 PM)</Text>
        {eveningSummary ? (
          <View>
            <Text style={paletteStyles.accent}>Achievements</Text>
            {eveningSummary.achievements.map((item) => (
              <Text key={item.label} style={paletteStyles.body}>
                {item.label}: {item.value} {item.delta ? `(${item.delta})` : ''}
              </Text>
            ))}
            <Text style={paletteStyles.accent}>Tomorrow Preview</Text>
            {eveningSummary.tomorrowPreview.map((item) => (
              <Text key={item.block} style={paletteStyles.body}>
                {item.block} → {item.focus}
              </Text>
            ))}
            <Text style={paletteStyles.body}>
              Wellness: {eveningSummary.wellnessSignals.mood} · Stress {Math.round(eveningSummary.wellnessSignals.stress * 100)}%
            </Text>
            <Text style={paletteStyles.body}>Sync @ {eveningSummary.syncTimestamp}</Text>
          </View>
        ) : (
          <Text style={paletteStyles.body}>Celebrating the day’s momentum…</Text>
        )}
      </View>

      <View style={paletteStyles.card}>
        <Text style={paletteStyles.subheader}>Cross-Platform Sync & Predictive Insights</Text>
        {syncPayload ? (
          <View>
            <Text style={paletteStyles.body}>
              Academic Items: {Array.isArray((syncPayload.academic as any).items) ? (syncPayload.academic as any).items.length : 0}
            </Text>
            <Text style={paletteStyles.body}>
              Social Matches: {Array.isArray((syncPayload.social as any).matches) ? (syncPayload.social as any).matches.length : 0}
            </Text>
            <Text style={paletteStyles.body}>
              Wellness Entries: {Array.isArray((syncPayload.personal as any).entries) ? (syncPayload.personal as any).entries.length : 0}
            </Text>
          </View>
        ) : (
          <Text style={paletteStyles.body}>Linking Supabase + WebSockets for real-time state…</Text>
        )}
        {intervention ? (
          <View style={styles.interventionBox}>
            <Text style={paletteStyles.accent}>Counseling Automation</Text>
            <Text style={paletteStyles.body}>Priority: {intervention.priority.toUpperCase()}</Text>
            <Text style={paletteStyles.body}>Scheduled: {new Date(intervention.scheduledAt).toLocaleString()}</Text>
            <Text style={paletteStyles.body}>Resource: {intervention.resourceId}</Text>
            <Text style={paletteStyles.body}>{intervention.notes}</Text>
          </View>
        ) : null}
      </View>

      <View style={paletteStyles.card}>
        <Text style={paletteStyles.subheader}>Scenario Spotlights</Text>
        {scenarioTimelines.map((scenario) => (
          <View key={scenario.title} style={styles.scenarioBlock}>
            <Text style={paletteStyles.accent}>{scenario.title}</Text>
            {scenario.items.map((item) => (
              <Text key={item} style={paletteStyles.body}>
                {item}
              </Text>
            ))}
          </View>
        ))}
      </View>

      <NeonButton
        title="Return to Core"
        palette={palette}
        intensity="medium"
        onPress={() => {
          navigation.navigate('Core');
        }}
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
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  header: {
    fontFamily: 'OpenSans_600SemiBold',
    fontSize: 22,
    letterSpacing: 1.2,
  },
  subheader: {
    fontFamily: 'OpenSans_600SemiBold',
    fontSize: 18,
    letterSpacing: 1.1,
  },
  body: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  accent: {
    fontFamily: 'OpenSans_600SemiBold',
    fontSize: 15,
    marginTop: 8,
  },
  questItem: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    marginTop: 8,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  interventionBox: {
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 136, 0.4)',
  },
  scenarioBlock: {
    marginTop: 12,
    gap: 6,
  },
});
