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

const getCategoryAccent = (category: SkillNode['category']) => {
  switch (category) {
    case 'academic':
      return 'cyan';
    case 'creative':
      return 'violet';
    case 'social':
      return 'amber';
    case 'wellness':
      return 'mint';
    default:
      return 'cyan';
  }
};

export const VyraSkillTree: React.FC<VyraSkillTreeProps> = ({ userXp, onSkillUnlock }) => {
  const [selectedCategory, setSelectedCategory] = useState<SkillNode['category']>('academic');

  const skills: SkillNode[] = [
    {
      id: 'focus_mastery',
      name: 'Focus Mastery',
      description: 'Deep concentration and attention control.',
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
      description: 'Rapid knowledge acquisition and retention.',
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
      description: 'Advanced information gathering and analysis.',
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
      description: 'Idea generation and innovative thinking.',
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
      description: 'Visual design and aesthetic sense.',
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
      description: 'Effective verbal and written expression.',
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
      description: 'Working effectively in groups.',
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
      description: 'Present moment awareness and stress management.',
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
      description: 'Optimizing physical and mental energy.',
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

  return (
    <div className="skill-tree panel">
      <div className="panel-header">
        <div className="panel-title">
          <Zap size={18} />
          <h2>Vyra-Skill Tree</h2>
        </div>
        <div className="xp-chip">{userXp} XP available</div>
      </div>

      <div className="skill-tabs">
        {(['academic', 'creative', 'social', 'wellness'] as const).map((category) => (
          <button
            key={category}
            type="button"
            className={`skill-tab ${selectedCategory === category ? 'is-active' : ''}`}
            data-accent={getCategoryAccent(category)}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="skill-grid">
        {categorySkills.map((skill) => {
          const accent = getCategoryAccent(skill.category);
          const progress = skill.unlocked ? 100 : Math.min(100, (skill.currentXp / skill.xpRequired) * 100);
          const readyToUnlock = canUnlock(skill);

          return (
            <article
              key={skill.id}
              className={`skill-card ${skill.unlocked ? 'is-unlocked' : readyToUnlock ? 'is-ready' : 'is-locked'}`}
              data-accent={accent}
            >
              <div className="skill-head">
                <div>
                  <h3>{skill.name}</h3>
                  <p>{skill.description}</p>
                </div>
                <div className="skill-status">
                  {skill.unlocked ? (
                    <span className="status-pill status-pill--active">
                      <Star size={16} /> Level {skill.level}
                    </span>
                  ) : readyToUnlock ? (
                    <span className="status-pill status-pill--ready">
                      <Zap size={14} /> Ready
                    </span>
                  ) : (
                    <span className="status-pill status-pill--locked">
                      <Lock size={14} /> Locked
                    </span>
                  )}
                </div>
              </div>

              <div className="skill-progress">
                <div className="skill-progress-bar" style={{ width: `${progress}%` }} />
              </div>

              <div className="skill-meta">
                <span>{skill.unlocked ? 'Mastered' : `${skill.currentXp}/${skill.xpRequired} XP`}</span>
                {!skill.unlocked && (
                  <span className="unlock-hint">
                    {readyToUnlock ? (
                      <>
                        <Zap size={12} /> Charge ready
                      </>
                    ) : (
                      <>
                        <Lock size={12} /> Requirements needed
                      </>
                    )}
                  </span>
                )}
              </div>

              {skill.dependencies.length > 0 && (
                <div className="skill-deps">
                  <span>Requires:</span>
                  <span>
                    {skill.dependencies
                      .map((depId) => skills.find((s) => s.id === depId)?.name ?? 'Unknown')
                      .join(', ')}
                  </span>
                </div>
              )}

              {!skill.unlocked && (
                <button
                  type="button"
                  className={`neo-button ${readyToUnlock ? 'neo-button--cyan' : 'neo-button--ghost'}`}
                  onClick={() => unlockSkill(skill)}
                  disabled={!readyToUnlock}
                >
                  {readyToUnlock ? (
                    <>
                      Unlock Skill <ChevronRight size={16} />
                    </>
                  ) : (
                    <>
                      Locked <Lock size={14} />
                    </>
                  )}
                </button>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};
