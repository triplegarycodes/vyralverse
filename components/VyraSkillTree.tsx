import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ChevronRight, Lock, Star, Zap } from 'lucide-react-native';
import { colors, withOpacity } from '../styles/neon';

interface SkillNode {
  id: string;
  name: string;
  description: string;
  category: 'academic' | 'creative' | 'social' | 'wellness';
  xpRequired: number;
  dependencies: string[];
  unlocked: boolean;
  level: number;
  currentXp: number;
}

interface VyraSkillTreeProps {
  userXp: number;
  onSkillUnlock: (skillId: string) => void;
}

const categoryColors: Record<SkillNode['category'], string> = {
  academic: colors.verseCyan,
  creative: colors.versePurple,
  social: colors.verseOrange,
  wellness: colors.verseGreen,
};

export const VyraSkillTree: React.FC<VyraSkillTreeProps> = ({ userXp, onSkillUnlock }) => {
  const [selectedCategory, setSelectedCategory] = useState<SkillNode['category']>('academic');

  const skills: SkillNode[] = useMemo(
    () => [
      {
        id: 'focus_mastery',
        name: 'Focus Mastery',
        description: 'Deep concentration and attention control',
        category: 'academic',
        xpRequired: 100,
        dependencies: [],
        unlocked: true,
        level: 1,
        currentXp: 75,
      },
      {
        id: 'quick_learner',
        name: 'Quick Learner',
        description: 'Rapid knowledge acquisition and retention',
        category: 'academic',
        xpRequired: 200,
        dependencies: ['focus_mastery'],
        unlocked: false,
        level: 0,
        currentXp: 0,
      },
      {
        id: 'research_pro',
        name: 'Research Pro',
        description: 'Advanced information gathering and analysis',
        category: 'academic',
        xpRequired: 350,
        dependencies: ['quick_learner'],
        unlocked: false,
        level: 0,
        currentXp: 0,
      },
      {
        id: 'creative_spark',
        name: 'Creative Spark',
        description: 'Idea generation and innovative thinking',
        category: 'creative',
        xpRequired: 150,
        dependencies: [],
        unlocked: true,
        level: 1,
        currentXp: 40,
      },
      {
        id: 'design_eye',
        name: 'Design Eye',
        description: 'Visual design and aesthetic sense',
        category: 'creative',
        xpRequired: 250,
        dependencies: ['creative_spark'],
        unlocked: false,
        level: 0,
        currentXp: 0,
      },
      {
        id: 'communication',
        name: 'Clear Communication',
        description: 'Effective verbal and written expression',
        category: 'social',
        xpRequired: 120,
        dependencies: [],
        unlocked: true,
        level: 1,
        currentXp: 60,
      },
      {
        id: 'team_collab',
        name: 'Team Collaboration',
        description: 'Working effectively in groups',
        category: 'social',
        xpRequired: 220,
        dependencies: ['communication'],
        unlocked: false,
        level: 0,
        currentXp: 0,
      },
      {
        id: 'mindfulness',
        name: 'Mindfulness',
        description: 'Present moment awareness and stress management',
        category: 'wellness',
        xpRequired: 80,
        dependencies: [],
        unlocked: true,
        level: 1,
        currentXp: 30,
      },
      {
        id: 'energy_management',
        name: 'Energy Management',
        description: 'Optimizing physical and mental energy',
        category: 'wellness',
        xpRequired: 180,
        dependencies: ['mindfulness'],
        unlocked: false,
        level: 0,
        currentXp: 0,
      },
    ],
    []
  );

  const categorySkills = skills.filter((skill) => skill.category === selectedCategory);

  const canUnlock = (skill: SkillNode) =>
    skill.dependencies.every((depId) => skills.find((s) => s.id === depId)?.unlocked) && userXp >= skill.xpRequired;

  const unlockSkill = (skill: SkillNode) => {
    if (canUnlock(skill) && !skill.unlocked) {
      onSkillUnlock(skill.id);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Vyra- Skill Tree</Text>
        <View style={styles.headerStatus}>
          <Zap size={20} color={colors.verseCyan} style={styles.inlineIcon} />
          <Text style={styles.headerStatusText}>{userXp} XP Available</Text>
        </View>
      </View>

      <View style={styles.categoryRow}>
        {(['academic', 'creative', 'social', 'wellness'] as const).map((category) => {
          const tint = categoryColors[category];
          const isActive = selectedCategory === category;
          return (
            <Pressable
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.categoryButton,
                isActive
                  ? { backgroundColor: tint }
                  : { backgroundColor: withOpacity(tint, 0.12), borderColor: withOpacity(tint, 0.25) },
              ]}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  isActive ? styles.categoryButtonTextActive : { color: tint },
                ]}
              >
                {category}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View>
        {categorySkills.map((skill) => {
          const tint = categoryColors[skill.category];
          const unlockReady = canUnlock(skill);
          const progress = skill.unlocked ? 100 : (skill.currentXp / skill.xpRequired) * 100;

          const cardStyles = [styles.skillCard];
          if (skill.unlocked) {
            cardStyles.push({ backgroundColor: withOpacity(tint, 0.15), borderColor: tint });
          } else if (unlockReady) {
            cardStyles.push({
              backgroundColor: withOpacity(tint, 0.08),
              borderColor: withOpacity(tint, 0.5),
            });
          } else {
            cardStyles.push(styles.skillCardLocked);
          }

          return (
            <Pressable
              key={skill.id}
              onPress={() => unlockSkill(skill)}
              style={[...cardStyles, styles.skillCardSpacing]}
            >
              <View style={styles.skillRow}>
                <View style={styles.skillInfo}>
                  <View style={styles.skillTitleRow}>
                    <Text
                      style={[
                        styles.skillTitle,
                        skill.unlocked ? { color: tint } : undefined,
                      ]}
                    >
                      {skill.name}
                    </Text>
                    {skill.unlocked && <Star size={16} color={tint} style={styles.inlineIcon} />}
                  </View>
                  <Text style={styles.skillDescription}>{skill.description}</Text>
                </View>
                <View style={styles.skillMeta}>
                  {!skill.unlocked && (
                    <View style={styles.skillCostRow}>
                      <Zap size={14} color={colors.verseCyan} style={styles.inlineIcon} />
                      <Text style={styles.skillCostText}>{skill.xpRequired} XP</Text>
                    </View>
                  )}
                  {skill.unlocked && <Text style={[styles.skillLevel, { color: tint }]}>Level {skill.level}</Text>}
                </View>
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: tint }]} />
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.progressText}>
                  {skill.unlocked ? 'Mastered' : `${skill.currentXp}/${skill.xpRequired} XP`}
                </Text>

                {!skill.unlocked && (
                  <View style={styles.unlockRow}>
                    {unlockReady ? (
                      <>
                        <Text style={styles.unlockReady}>Ready to unlock!</Text>
                        <ChevronRight size={14} color={colors.verseGreen} />
                      </>
                    ) : (
                      <View style={styles.lockRow}>
                        <Lock size={12} color={withOpacity(colors.gray400, 0.9)} style={styles.inlineIcon} />
                        <Text style={styles.lockText}>Requirements needed</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>

              {skill.dependencies.length > 0 && (
                <View style={styles.dependenciesSection}>
                  <Text style={styles.dependenciesText}>
                    Requires:{' '}
                    {skill.dependencies
                      .map((depId) => {
                        const depSkill = skills.find((s) => s.id === depId);
                        return depSkill?.name;
                      })
                      .filter((name): name is string => Boolean(name))
                      .join(', ')}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: withOpacity('#0b1222', 0.85),
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: withOpacity(colors.verseCyan, 0.2),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.verseCyan,
  },
  headerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerStatusText: {
    color: colors.verseCyan,
    fontWeight: '700',
  },
  inlineIcon: {
    marginRight: 6,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginRight: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryButtonText: {
    fontWeight: '600',
    textTransform: 'capitalize',
    letterSpacing: 0.5,
  },
  categoryButtonTextActive: {
    color: colors.verseBlack,
  },
  skillCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: withOpacity(colors.gray600, 0.5),
    backgroundColor: withOpacity(colors.gray900, 0.6),
  },
  skillCardLocked: {
    backgroundColor: withOpacity(colors.gray800, 0.5),
    borderColor: withOpacity(colors.gray600, 0.4),
    opacity: 0.65,
  },
  skillCardSpacing: {
    marginBottom: 16,
  },
  skillRow: {
    flexDirection: 'row',
  },
  skillInfo: {
    flex: 1,
    paddingRight: 12,
  },
  skillTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  skillDescription: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginTop: 6,
  },
  skillMeta: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  skillCostRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillCostText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
  },
  skillLevel: {
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: withOpacity(colors.gray700, 0.6),
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  progressText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  unlockRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unlockReady: {
    color: colors.verseGreen,
    fontSize: 12,
    fontWeight: '600',
    marginRight: 6,
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  dependenciesSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: withOpacity(colors.gray700, 0.6),
    paddingTop: 12,
  },
  dependenciesText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
});
