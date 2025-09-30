import 'react-native-gesture-handler';
import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Target, Zap, Radio, Compass } from 'lucide-react-native';
import { VyraSkillTree } from './components/VyraSkillTree';
import { LensCoreInterface } from './components/LensCoreInterface';
import { useVerseStore } from './src/hooks/useVerseStore';
import type { Quest } from '@core/types';
import { colors, withOpacity } from './styles/neon';

const XP_PER_LEVEL = 500;

type ModuleKey = 'dashboard' | 'lens' | 'skills';

const formatTimeAgo = (timestamp: number) => {
  const diff = Date.now() - timestamp;
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
};

export default function App() {
  const store = useVerseStore();
  const [activeModule, setActiveModule] = useState<ModuleKey>('dashboard');
  const [activeQuests, setActiveQuests] = useState<Quest[]>([]);
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 1024;

  const totalLessonXp = useMemo(
    () => store.lessons.reduce((sum, lesson) => sum + lesson.xp, 0),
    [store.lessons]
  );

  const questXp = useMemo(
    () =>
      activeQuests
        .filter((quest) => quest.status === 'completed')
        .reduce((sum, quest) => sum + (quest.rewards.find((r) => r.type === 'xp')?.value ?? 0), 0),
    [activeQuests]
  );

  const userXp = totalLessonXp + questXp + store.projects.length * 45 + store.goals.length * 25 + 420;
  const userName = store.user?.name ?? 'Vyra Voyager';
  const user = useMemo(() => ({ name: userName, xp: userXp }), [userName, userXp]);
  const level = Math.max(1, Math.floor(userXp / XP_PER_LEVEL) + 1);
  const levelProgress = userXp % XP_PER_LEVEL;
  const progressPercent = Math.min(100, (levelProgress / XP_PER_LEVEL) * 100);
  const xpToNext = XP_PER_LEVEL - levelProgress;

  const inProgressQuests = activeQuests.filter((quest) => quest.status !== 'completed');
  const completedQuests = activeQuests.filter((quest) => quest.status === 'completed');

  const recentProjects = store.projects.slice(0, 3);
  const recentSeeds = store.seeds.slice(0, 4);
  const recentLessons = store.lessons.slice(0, 3);

  const handleQuestGenerated = (quest: Quest) => {
    setActiveQuests((prev) => [...prev, { ...quest, status: 'active' }]);
    setActiveModule('dashboard');
  };

  const completeQuest = (questId: string) => {
    setActiveQuests((prev) =>
      prev.map((quest) =>
        quest.id === questId && quest.status !== 'completed' ? { ...quest, status: 'completed' } : quest
      )
    );
  };

  const moduleColors: Record<ModuleKey, string> = {
    dashboard: colors.verseCyan,
    lens: colors.verseOrange,
    skills: colors.versePurple,
  };

  const renderNavButton = (key: ModuleKey, label: string) => {
    const tint = moduleColors[key];
    const isActive = activeModule === key;
    return (
      <Pressable
        key={key}
        onPress={() => setActiveModule(key)}
        style={[
          styles.navButton,
          isLargeScreen ? styles.navButtonHorizontal : styles.navButtonVertical,
          isActive ? { backgroundColor: tint } : { backgroundColor: withOpacity(tint, 0.12) },
        ]}
      >
        <Text
          style={[
            styles.navButtonText,
            isActive ? styles.navButtonTextActive : { color: tint },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.appShell}>
          <LinearGradient
            colors={[withOpacity(colors.verseCyan, 0.16), withOpacity(colors.versePurple, 0.14), 'rgba(9,5,20,0.92)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.appSurface}
          >
            <View style={styles.surfaceInner}>
              <View style={[styles.appHeader, isLargeScreen && styles.appHeaderWide]}>
                <View style={[styles.brandMark, !isLargeScreen && styles.stackSpacing]}>
                  <Text style={styles.brandTitle}>
                    VYRAL
                    <Text style={styles.brandTitleAccent}>VERSE</Text>
                  </Text>
                  <Text style={styles.brandTagline}>Neon Flow Intelligence</Text>
                </View>

                <View
                  style={[
                    styles.moduleNav,
                    isLargeScreen ? styles.moduleNavWide : styles.stackSpacing,
                  ]}
                >
                  {renderNavButton('dashboard', 'Dashboard')}
                  {renderNavButton('lens', 'FLWX Lens')}
                  {renderNavButton('skills', 'Vyra- Skills')}
                </View>

                <View style={[styles.statusChip, !isLargeScreen && styles.stackSpacing]}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>⚡</Text>
                  </View>
                  <View>
                    <Text style={styles.statusName}>{user.name}</Text>
                    <Text style={styles.statusLevel}>Level {level} // {xpToNext} XP to ascend</Text>
                  </View>
                </View>
              </View>

              <View style={styles.mainGrid}>
                {activeModule === 'dashboard' && (
                  <View style={[styles.dashboardGrid, isLargeScreen && styles.dashboardGridWide]}>
                    <View
                      style={[styles.dashboardColumn, isLargeScreen && styles.dashboardColumnWide]}
                    >
                      <View style={[styles.dashboardHero, styles.sectionSpacing]}>
                        <View style={styles.badge}>
                          <Sparkles size={16} color={colors.verseCyan} style={styles.inlineIcon} />
                          <Text style={styles.badgeText}>Live Pulse</Text>
                        </View>
                        <Text style={styles.heroHeading}>Welcome back, {user.name.split(' ')[0]}.</Text>
                        <Text style={styles.heroSubtitle}>
                          Keep the neon momentum high—your orbit is synced across Verse modules.
                        </Text>
                        <View style={styles.heroMetrics}>
                          <View style={styles.metricCard}>
                            <Text style={styles.metricLabel}>Level Status</Text>
                            <Text style={styles.metricValue}>Lv {level}</Text>
                            <Text style={styles.metricSubtext}>{xpToNext} XP until next surge</Text>
                            <View style={styles.progressTrack}>
                              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                            </View>
                          </View>
                          <View style={styles.metricCard}>
                            <Text style={styles.metricLabel}>Quest Heat</Text>
                            <Text style={styles.metricValue}>{inProgressQuests.length}</Text>
                            <Text style={styles.metricSubtext}>Active flows awaiting completion</Text>
                          </View>
                          <View style={styles.metricCard}>
                            <Text style={styles.metricLabel}>Knowledge Sparks</Text>
                            <Text style={styles.metricValue}>{store.lessons.length}</Text>
                            <Text style={styles.metricSubtext}>Lessons logged this cycle</Text>
                          </View>
                          <View style={styles.metricCard}>
                            <Text style={styles.metricLabel}>Creative Seeds</Text>
                            <Text style={styles.metricValue}>{store.seeds.length}</Text>
                            <Text style={styles.metricSubtext}>Ideas planted in the grove</Text>
                          </View>
                        </View>
                      </View>

                      <View style={[styles.panel, styles.sectionSpacing]}>
                          <View style={styles.panelHeader}>
                            <View style={styles.panelTitleRow}>
                              <Zap size={18} color={colors.verseCyan} style={styles.panelIcon} />
                              <Text style={styles.panelTitle}>Active Quest Stream</Text>
                            </View>
                          <Text style={styles.panelSubtitle}>Synced from FLWX Lens</Text>
                        </View>

                        {inProgressQuests.length === 0 ? (
                          <View style={styles.highlightCard}>
                            <Text style={styles.highlightHeading}>No quests in motion</Text>
                            <Text style={styles.highlightText}>
                              Scan your environment with the FLWX Lens to generate new, adaptive quests.
                            </Text>
                          </View>
                        ) : (
                          <View>
                            {inProgressQuests.map((quest) => (
                              <View key={quest.id} style={[styles.listCard, styles.cardSpacing]}>
                                <Text style={styles.listCardTitle}>{quest.title}</Text>
                                <Text style={styles.listCardDescription}>{quest.description}</Text>
                                <View style={styles.infoGrid}>
                                  <View style={styles.infoColumn}>
                                    <Text style={styles.infoHeading}>Objectives</Text>
                                    <View>
                                      {quest.objectives.map((objective) => (
                                        <View key={objective.id} style={[styles.objectiveRow, styles.rowSpacing]}>
                                          <View
                                            style={[
                                              styles.objectiveIndicator,
                                              objective.completed && styles.objectiveIndicatorCompleted,
                                            ]}
                                          >
                                            {objective.completed && <Text style={styles.objectiveCheck}>✓</Text>}
                                          </View>
                                          <Text style={styles.objectiveText}>{objective.description}</Text>
                                        </View>
                                      ))}
                                    </View>
                                  </View>
                                  <View style={[styles.infoColumn, styles.infoColumnSpacing]}>
                                    <Text style={styles.rewardHeading}>Rewards</Text>
                                    <View>
                                      {quest.rewards.map((reward, index) => (
                                        <Text key={index} style={[styles.rewardText, styles.rowSpacing]}>
                                          {reward.type === 'xp' && '⚡ '}
                                          {reward.type === 'vTokens' && '🪙 '}
                                          {reward.value} {reward.type}
                                        </Text>
                                      ))}
                                    </View>
                                  </View>
                                </View>
                                <View style={styles.questFooter}>
                                  <View style={styles.questChip}>
                                    <Target size={16} color={colors.verseOrange} style={styles.inlineIcon} />
                                    <Text style={styles.questChipText}>{quest.difficulty} star intensity</Text>
                                  </View>
                                  <Pressable
                                    onPress={() => completeQuest(quest.id)}
                                    style={styles.questActionButton}
                                  >
                                    <Text style={styles.questActionText}>Complete Quest</Text>
                                  </Pressable>
                                </View>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    </View>

                    <View style={[styles.dashboardColumn, isLargeScreen && styles.dashboardColumnSecondary]}>
                      <View style={[styles.panel, styles.sectionSpacing]}>
                        <View style={styles.panelHeader}>
                          <View style={styles.panelTitleRow}>
                            <Radio size={18} color={colors.versePurple} style={styles.panelIcon} />
                            <Text style={styles.panelTitle}>Signal Highlights</Text>
                          </View>
                          <Text style={styles.panelSubtitle}>Latest Verse echoes</Text>
                        </View>
                        <View style={styles.statGrid}>
                          <View style={styles.statTile}>
                            <Text style={styles.statValue}>{completedQuests.length}</Text>
                            <Text style={styles.statLabel}>Completed Quests</Text>
                          </View>
                          <View style={styles.statTile}>
                            <Text style={styles.statValue}>{store.projects.length}</Text>
                            <Text style={styles.statLabel}>Creative Projects</Text>
                          </View>
                          <View style={styles.statTile}>
                            <Text style={styles.statValue}>{store.goals.length}</Text>
                            <Text style={styles.statLabel}>Goals Forged</Text>
                          </View>
                          <View style={styles.statTile}>
                            <Text style={styles.statValue}>{store.zoneMessages.length}</Text>
                            <Text style={styles.statLabel}>Zone Transmissions</Text>
                          </View>
                        </View>
                      </View>

                      <View style={[styles.panel, styles.sectionSpacing]}>
                        <View style={styles.panelHeader}>
                          <View style={styles.panelTitleRow}>
                            <Compass size={18} color={colors.verseGreen} style={styles.panelIcon} />
                            <Text style={styles.panelTitle}>Creative Timeline</Text>
                          </View>
                          <Text style={styles.panelSubtitle}>Newest artifacts</Text>
                        </View>
                        <View style={styles.listStack}>
                          {recentProjects.map((project) => (
                              <View key={project.id} style={[styles.listCard, styles.cardSpacing]}>
                                <Text style={styles.listCardTitle}>{project.title}</Text>
                                <Text style={styles.listCardDescription}>
                                  {project.description || 'No mission brief yet—spark it soon.'}
                                </Text>
                                <Text style={styles.listCardMeta}>{formatTimeAgo(project.createdAt)}</Text>
                              </View>
                          ))}
                          {recentSeeds.map((seed) => (
                            <View key={seed.id} style={[styles.listCard, styles.cardSpacing]}>
                              <Text style={styles.listCardTitle}>Seed • {seed.label}</Text>
                              <Text style={styles.seedMeta}>Idea planted {formatTimeAgo(seed.createdAt)}</Text>
                            </View>
                          ))}
                          {recentLessons.map((lesson) => (
                            <View key={lesson.id} style={[styles.listCard, styles.cardSpacing]}>
                              <Text style={styles.listCardTitle}>Lesson • {lesson.title}</Text>
                              <Text style={styles.lessonMeta}>
                                +{lesson.xp} XP — {formatTimeAgo(lesson.completedAt)}
                              </Text>
                            </View>
                          ))}
                          {recentProjects.length === 0 &&
                            recentSeeds.length === 0 &&
                            recentLessons.length === 0 && (
                              <View style={[styles.highlightCard, styles.cardSpacing]}>
                                <Text style={styles.highlightHeading}>No activity logged yet</Text>
                                <Text style={styles.highlightText}>
                                  Launch a quest, plant a seed, or complete a lesson to populate your timeline.
                                </Text>
                              </View>
                            )}
                        </View>
                      </View>
                    </View>
                  </View>
                )}

                {activeModule === 'lens' && (
                  <View style={[styles.moduleContainer, styles.sectionSpacing]}>
                    <LensCoreInterface onQuestGenerated={handleQuestGenerated} />
                  </View>
                )}

                {activeModule === 'skills' && (
                  <View style={[styles.moduleContainer, styles.sectionSpacing]}>
                    <VyraSkillTree
                      userXp={user.xp}
                      onSkillUnlock={(skillId) => {
                        console.log('Unlocked skill:', skillId);
                      }}
                    />
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.verseBlack,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 64,
    flexGrow: 1,
  },
  appShell: {
    flex: 1,
  },
  appSurface: {
    borderRadius: 32,
    borderWidth: 1,
    borderColor: withOpacity(colors.verseCyan, 0.18),
    padding: 1,
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  surfaceInner: {
    borderRadius: 32,
    padding: 32,
    backgroundColor: withOpacity('#090514', 0.92),
    borderWidth: 1,
    borderColor: withOpacity(colors.versePurple, 0.1),
    width: '100%',
  },
  appHeader: {
    flexDirection: 'column',
    marginBottom: 32,
  },
  appHeaderWide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandMark: {
    flexDirection: 'column',
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#ffffff',
  },
  brandTitleAccent: {
    color: colors.verseCyan,
  },
  brandTagline: {
    fontSize: 14,
    letterSpacing: 3,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
  },
  moduleNav: {
    flexDirection: 'column',
  },
  moduleNavWide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  navButtonVertical: {
    marginBottom: 12,
  },
  navButtonHorizontal: {
    marginRight: 12,
  },
  stackSpacing: {
    marginBottom: 24,
  },
  navButtonText: {
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  navButtonTextActive: {
    color: colors.verseBlack,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withOpacity(colors.versePurple, 0.18),
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: withOpacity(colors.versePurple, 0.35),
  },
  avatar: {
    height: 48,
    width: 48,
    borderRadius: 16,
    backgroundColor: withOpacity(colors.verseCyan, 0.3),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: withOpacity(colors.verseCyan, 0.35),
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
  },
  statusName: {
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
  statusLevel: {
    fontSize: 12,
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
  },
  mainGrid: {
    marginTop: 8,
  },
  dashboardGrid: {
    flexDirection: 'column',
  },
  dashboardGridWide: {
    flexDirection: 'row',
  },
  dashboardColumn: {
    flex: 1,
  },
  dashboardColumnWide: {
    marginRight: 24,
  },
  dashboardColumnSecondary: {
    flex: 1,
  },
  dashboardHero: {
    backgroundColor: withOpacity('#040a1a', 0.9),
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: withOpacity(colors.verseCyan, 0.25),
  },
  sectionSpacing: {
    marginBottom: 24,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: withOpacity(colors.verseCyan, 0.15),
    marginBottom: 16,
  },
  badgeText: {
    color: colors.verseCyan,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  inlineIcon: {
    marginRight: 6,
  },
  heroHeading: {
    fontSize: 30,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 15,
    marginBottom: 24,
  },
  heroMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  metricCard: {
    backgroundColor: withOpacity('#080c1d', 0.9),
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: withOpacity(colors.verseCyan, 0.2),
    margin: 8,
    flexBasis: '45%',
    flexGrow: 1,
  },
  metricLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 8,
  },
  metricSubtext: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 4,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: withOpacity(colors.gray700, 0.6),
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.verseCyan,
    borderRadius: 999,
  },
  panel: {
    backgroundColor: withOpacity('#0b0f1e', 0.85),
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: withOpacity(colors.verseCyan, 0.18),
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  panelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  panelIcon: {
    marginRight: 8,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  panelSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
  highlightCard: {
    backgroundColor: withOpacity(colors.verseCyan, 0.1),
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: withOpacity(colors.verseCyan, 0.25),
  },
  highlightHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  highlightText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  listStack: {
    marginTop: 16,
  },
  listCard: {
    backgroundColor: withOpacity('#0f1423', 0.9),
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: withOpacity(colors.versePurple, 0.12),
  },
  cardSpacing: {
    marginBottom: 16,
  },
  listCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  listCardDescription: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  listCardMeta: {
    color: colors.verseCyan,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  seedMeta: {
    color: colors.versePurple,
    fontSize: 13,
  },
  lessonMeta: {
    color: colors.verseGreen,
    fontSize: 13,
  },
  infoGrid: {
    flexDirection: 'row',
    marginTop: 12,
  },
  infoColumn: {
    flex: 1,
  },
  infoColumnSpacing: {
    marginLeft: 16,
  },
  infoHeading: {
    color: colors.verseCyan,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  rewardHeading: {
    color: colors.verseOrange,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  objectiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 12,
    fontWeight: '700',
  },
  objectiveText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    flex: 1,
    flexWrap: 'wrap',
  },
  rewardText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  rowSpacing: {
    marginBottom: 8,
  },
  questFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  questChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withOpacity(colors.verseOrange, 0.12),
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  questChipText: {
    color: colors.verseOrange,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginLeft: 8,
  },
  questActionButton: {
    backgroundColor: colors.verseOrange,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  questActionText: {
    color: colors.verseBlack,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  statTile: {
    backgroundColor: withOpacity('#0f1628', 0.9),
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: withOpacity(colors.versePurple, 0.2),
    margin: 8,
    flexBasis: '45%',
    flexGrow: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  moduleContainer: {
    borderRadius: 24,
    backgroundColor: withOpacity('#060915', 0.92),
    borderWidth: 1,
    borderColor: withOpacity(colors.verseCyan, 0.18),
    padding: 16,
  },
});
