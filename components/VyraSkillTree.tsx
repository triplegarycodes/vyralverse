import React, { useState } from 'react';
import { ChevronRight, Lock, Star, Zap } from 'lucide-react-native';

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

export const VyraSkillTree: React.FC<VyraSkillTreeProps> = ({ userXp, onSkillUnlock }) => {
  const [selectedCategory, setSelectedCategory] = useState<'academic' | 'creative' | 'social' | 'wellness'>('academic');

  const skills: SkillNode[] = [
    // Academic Skills
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

    // Creative Skills
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

    // Social Skills
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

    // Wellness Skills
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
  ];

  const categorySkills = skills.filter((skill) => skill.category === selectedCategory);
  const canUnlock = (skill: SkillNode) =>
    skill.dependencies.every((depId) => skills.find((s) => s.id === depId)?.unlocked) && userXp >= skill.xpRequired;

  const unlockSkill = (skill: SkillNode) => {
    if (canUnlock(skill) && !skill.unlocked) {
      onSkillUnlock(skill.id);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic':
        return 'verse-cyan';
      case 'creative':
        return 'verse-purple';
      case 'social':
        return 'verse-orange';
      case 'wellness':
        return 'verse-green';
      default:
        return 'verse-cyan';
    }
  };

  return (
    <div className="bg-gray-900/50 border border-verse-cyan/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-verse-cyan">Vyra- Skill Tree</h2>
        <div className="flex items-center space-x-2 text-verse-cyan">
          <Zap size={20} />
          <span className="font-bold">{userXp} XP Available</span>
        </div>
      </div>

      {/* Category Selector */}
      <div className="flex space-x-2 mb-6">
        {(['academic', 'creative', 'social', 'wellness'] as const).map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
              selectedCategory === category
                ? `bg-${getCategoryColor(category)} text-verse-black`
                : `bg-${getCategoryColor(category)}/10 text-${getCategoryColor(category)} hover:bg-${getCategoryColor(category)}/20`
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="grid gap-4">
        {categorySkills.map((skill) => {
          const color = getCategoryColor(skill.category);
          const canUnlockSkill = canUnlock(skill);
          const progress = skill.unlocked ? 100 : (skill.currentXp / skill.xpRequired) * 100;

          return (
            <div
              key={skill.id}
              className={`border rounded-xl p-4 transition-all ${
                skill.unlocked
                  ? `border-${color} bg-${color}/10`
                  : canUnlockSkill
                  ? `border-${color}/50 bg-${color}/5 hover:border-${color} cursor-pointer`
                  : 'border-gray-600 bg-gray-800/20 opacity-60'
              }`}
              onClick={() => unlockSkill(skill)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3
                      className={`font-bold ${
                        skill.unlocked ? `text-${color}` : 'text-gray-300'
                      }`}
                    >
                      {skill.name}
                    </h3>
                    {skill.unlocked && <Star size={16} className={`text-${color}`} />}
                  </div>
                  <p className="text-gray-400 text-sm">{skill.description}</p>
                </div>

                <div className="text-right ml-4">
                  {!skill.unlocked && (
                    <div className="flex items-center space-x-1 text-sm text-gray-400">
                      <Zap size={14} />
                      <span>{skill.xpRequired} XP</span>
                    </div>
                  )}
                  {skill.unlocked && <div className={`text-${color} font-bold`}>Level {skill.level}</div>}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full bg-${color} transition-all`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>{skill.unlocked ? 'Mastered' : `${skill.currentXp}/${skill.xpRequired} XP`}</span>

                {!skill.unlocked && (
                  <div className="flex items-center space-x-1">
                    {canUnlockSkill ? (
                      <>
                        <span className="text-verse-green">Ready to unlock!</span>
                        <ChevronRight size={14} />
                      </>
                    ) : (
                      <>
                        <Lock size={12} />
                        <span>Requirements needed</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Dependencies */}
              {skill.dependencies.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="text-xs text-gray-400">
                    Requires:{' '}
                    {skill.dependencies
                      .map((depId) => {
                        const depSkill = skills.find((s) => s.id === depId);
                        return depSkill?.name;
                      })
                      .join(', ')}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
