import 'react-native-gesture-handler';
import React, { useMemo, useState } from 'react';
import { Sparkles, Target, Zap, Radio, Compass } from 'lucide-react-native';
import './styles/neon.css';
import { VyraSkillTree } from './components/VyraSkillTree';
import { LensCoreInterface } from './components/LensCoreInterface';
import { useVerseStore } from './src/hooks/useVerseStore';
import type { Quest } from '@core/types';

const XP_PER_LEVEL = 500;

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
  // Add to your state
  const [activeModule, setActiveModule] = useState<'dashboard' | 'lens' | 'skills'>('dashboard');
  const [activeQuests, setActiveQuests] = useState<Quest[]>([]);

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
        quest.id === questId && quest.status !== 'completed'
          ? { ...quest, status: 'completed' }
          : quest
      )
    );
  };

  return (
    <div className="app-shell fx-overlay">
      <div className="app-surface">
        <header className="app-header">
          <div className="brand-mark">
            <div className="logo-glow" aria-hidden="true">
              <span>VX</span>
            </div>
            <div className="brand-copy">
              <span className="title">
                VYRAL<span>VERSE</span>
              </span>
              <span className="tagline">Neon Flow Intelligence</span>
            </div>
          </div>

          <nav className="module-nav" role="tablist" aria-label="Primary modules">
            <button
              type="button"
              onClick={() => setActiveModule('dashboard')}
              className={`module-tab ${activeModule === 'dashboard' ? 'is-active' : ''}`}
              aria-selected={activeModule === 'dashboard'}
            >
              <span>LyfeBoard</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveModule('lens')}
              className={`module-tab module-tab--amber ${activeModule === 'lens' ? 'is-active' : ''}`}
              aria-selected={activeModule === 'lens'}
            >
              <span>FLWX Lens</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveModule('skills')}
              className={`module-tab module-tab--violet ${activeModule === 'skills' ? 'is-active' : ''}`}
              aria-selected={activeModule === 'skills'}
            >
              <span>Vyra-Skills</span>
            </button>
          </nav>

          <div className="status-chip">
            <div className="avatar" aria-hidden="true">
              <Sparkles size={20} />
            </div>
            <div className="details">
              <span className="name">{user.name}</span>
              <span className="level">Level {level} • {xpToNext} XP to ascend</span>
            </div>
          </div>
        </header>

        <main className="main-grid">
          {activeModule === 'dashboard' && (
            <div className="dashboard-grid module-transition">
              <div className="dashboard-column">
                <section className="dashboard-hero">
                  <span className="badge">
                    <Sparkles size={16} /> Live Pulse
                  </span>
                  <h1>Welcome back, {user.name.split(' ')[0]}.</h1>
                  <p>Keep the neon momentum high—your orbit is synced across Verse modules.</p>
                  <div className="hero-metrics">
                    <div className="metric-card">
                      <span className="label">Level Status</span>
                      <span className="value">Lv {level}</span>
                      <span className="subtext">{xpToNext} XP until next surge</span>
                      <div className="neon-progress">
                        <span style={{ width: `${progressPercent}%` }} />
                      </div>
                    </div>
                    <div className="metric-card">
                      <span className="label">Quest Heat</span>
                      <span className="value">{inProgressQuests.length}</span>
                      <span className="subtext">Active flows awaiting completion</span>
                    </div>
                    <div className="metric-card">
                      <span className="label">Knowledge Sparks</span>
                      <span className="value">{store.lessons.length}</span>
                      <span className="subtext">Lessons logged this cycle</span>
                    </div>
                    <div className="metric-card">
                      <span className="label">Creative Seeds</span>
                      <span className="value">{store.seeds.length}</span>
                      <span className="subtext">Ideas planted in the grove</span>
                    </div>
                  </div>
                </section>

                <section className="panel">
                  <div className="panel-header">
                    <div className="panel-title">
                      <Zap size={18} />
                      <h2>Active Quest Stream</h2>
                    </div>
                    <span>Synced from FLWX Lens</span>
                  </div>
                  {inProgressQuests.length === 0 ? (
                    <div className="highlight-card">
                      <h3>No quests in motion</h3>
                      <p>Scan your environment with the FLWX Lens to generate new, adaptive quests.</p>
                    </div>
                  ) : (
                    <ul className="list-stack">
                      {inProgressQuests.map((quest) => (
                        <li key={quest.id} className="list-card quest-card">
                          <div className="quest-body">
                            <strong>{quest.title}</strong>
                            <p>{quest.description}</p>
                          </div>
                          <div className="info-grid">
                            <div className="info-block">
                              <span className="info-label info-label--cyan">Objectives</span>
                              <ul className="objective-list">
                                {quest.objectives.map((objective) => (
                                  <li key={objective.id} className={`objective-item ${objective.completed ? 'is-complete' : ''}`}>
                                    <span className="objective-check" aria-hidden="true">
                                      {objective.completed ? '✓' : ''}
                                    </span>
                                    <span className="objective-text">{objective.description}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="info-block">
                              <span className="info-label info-label--amber">Rewards</span>
                              <ul className="reward-list">
                                {quest.rewards.map((reward, index) => (
                                  <li key={index} className="reward-item">
                                    <span aria-hidden="true">{reward.type === 'xp' ? '⚡' : '🪙'}</span>
                                    <span>
                                      {reward.value} {reward.type}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          <div className="quest-footer">
                            <span className="quest-chip">
                              <Target size={16} /> {quest.difficulty} star intensity
                            </span>
                            <button type="button" onClick={() => completeQuest(quest.id)} className="neo-button neo-button--amber">
                              Complete Quest
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>

              <div className="dashboard-column">
                <section className="panel">
                  <div className="panel-header">
                    <div className="panel-title">
                      <Radio size={18} />
                      <h2>Signal Highlights</h2>
                    </div>
                    <span>Latest Verse echoes</span>
                  </div>
                  <div className="stat-grid">
                    <div className="stat-tile">
                      <strong>{completedQuests.length}</strong>
                      <span>Completed Quests</span>
                    </div>
                    <div className="stat-tile">
                      <strong>{store.projects.length}</strong>
                      <span>Creative Projects</span>
                    </div>
                    <div className="stat-tile">
                      <strong>{store.goals.length}</strong>
                      <span>Goals Forged</span>
                    </div>
                    <div className="stat-tile">
                      <strong>{store.zoneMessages.length}</strong>
                      <span>Zone Transmissions</span>
                    </div>
                  </div>
                </section>

                <section className="panel">
                  <div className="panel-header">
                    <div className="panel-title">
                      <Compass size={18} />
                      <h2>Creative Timeline</h2>
                    </div>
                    <span>Newest artifacts</span>
                  </div>
                  <ul className="list-stack">
                    {recentProjects.map((project) => (
                      <li key={project.id} className="list-card">
                        <strong>{project.title}</strong>
                        <p>{project.description || 'No mission brief yet—spark it soon.'}</p>
                        <span className="meta meta--cyan">{formatTimeAgo(project.createdAt)}</span>
                      </li>
                    ))}
                    {recentSeeds.map((seed) => (
                      <li key={seed.id} className="list-card">
                        <strong>Seed • {seed.label}</strong>
                        <span className="meta meta--violet">Idea planted {formatTimeAgo(seed.createdAt)}</span>
                      </li>
                    ))}
                    {recentLessons.map((lesson) => (
                      <li key={lesson.id} className="list-card">
                        <strong>Lesson • {lesson.title}</strong>
                        <span className="meta meta--green">+{lesson.xp} XP — {formatTimeAgo(lesson.completedAt)}</span>
                      </li>
                    ))}
                    {recentProjects.length === 0 && recentSeeds.length === 0 && recentLessons.length === 0 && (
                      <li className="highlight-card">
                        <h3>No activity logged yet</h3>
                        <p>Launch a quest, plant a seed, or complete a lesson to populate your timeline.</p>
                      </li>
                    )}
                  </ul>
                </section>
              </div>
            </div>
          )}

          {activeModule === 'lens' && (
            <div className="module-transition">
              <LensCoreInterface onQuestGenerated={handleQuestGenerated} />
            </div>
          )}

          {activeModule === 'skills' && (
            <div className="module-transition">
              <VyraSkillTree
                userXp={user.xp}
                onSkillUnlock={(skillId) => {
                  // Handle skill unlocking
                  console.log('Unlocked skill:', skillId);
                }}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
