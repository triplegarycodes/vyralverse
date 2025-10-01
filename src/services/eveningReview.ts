import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { EveningFlow, OutcomeMetrics, SkillProgression } from '../core/types';

export interface EveningReviewConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export interface EveningReviewInput {
  userId: string;
  date: string;
}

export interface EveningReviewSummary {
  flow: EveningFlow;
  achievements: { label: string; value: string; delta?: string }[];
  unlockedSkills: SkillProgression[];
  tomorrowPreview: { block: string; focus: string; questId?: string }[];
  wellnessSignals: { stress: number; mood: string; recommendation: string };
  syncTimestamp: string;
  outcomeMetrics: OutcomeMetrics;
}

const EVENING_FLOW: EveningFlow = {
  achievementReview: 'Daily progress celebration',
  skillUnlocks: 'New abilities based on daily performance',
  tomorrowPreview: 'AI-predicted optimal next day schedule',
  wellnessCheck: 'Mental health and stress assessment',
  dataSync: 'Cross-device progress synchronization',
};

export class EveningReviewManager {
  private supabase: SupabaseClient;

  constructor(private config: EveningReviewConfig) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
  }

  async generateSummary(input: EveningReviewInput): Promise<EveningReviewSummary> {
    const [achievementData, skillData, scheduleData, wellnessData] = await Promise.all([
      this.fetchAchievementSignals(input),
      this.fetchSkillProgress(input),
      this.fetchTomorrowSchedule(input),
      this.fetchWellnessSignals(input),
    ]);

    return {
      flow: EVENING_FLOW,
      achievements: achievementData,
      unlockedSkills: skillData.skills,
      tomorrowPreview: scheduleData.preview,
      wellnessSignals: wellnessData,
      syncTimestamp: new Date().toISOString(),
      outcomeMetrics: {
        gradeImprovement: `Δ ${skillData.gradeDelta}% this week`,
        assignmentCompletion: `${achievementData.find((item) => item.label === 'Assignments Completed')?.value ?? '0/0'}`,
        skillMastery: `${skillData.skills.length} skills at new mastery levels`,
        collegeReadiness: scheduleData.collegeReadiness,
      },
    };
  }

  private async fetchAchievementSignals(input: EveningReviewInput) {
    const { data } = await this.supabase
      .from('daily_achievements')
      .select('label, value, delta')
      .eq('user_id', input.userId)
      .eq('date', input.date);
    if (data?.length) {
      return data;
    }
    return [
      { label: 'Assignments Completed', value: '8/10', delta: '+2 vs. avg' },
      { label: 'Focus Minutes', value: '135', delta: '+25 vs. goal' },
      { label: 'Quests Cleared', value: '6', delta: '+1 streak boost' },
    ];
  }

  private async fetchSkillProgress(input: EveningReviewInput) {
    const { data } = await this.supabase
      .from('skill_progressions')
      .select('skill_name, baseline, target, validation_status, grade_delta')
      .eq('user_id', input.userId)
      .gte('date', this.weekStart(input.date));
    if (!data?.length) {
      return {
        skills: [
          {
            baseline: 'Current skill levels and knowledge gaps',
            targets: 'Curriculum requirements + personal goals',
            pathway: 'Optimal skill acquisition sequence',
            validation: 'Mastery verification through multiple measures',
          },
        ],
        gradeDelta: 2,
      };
    }
    return {
      skills: data.map((skill) => ({
        baseline: `Baseline: ${skill.baseline}`,
        targets: `Target: ${skill.target}`,
        pathway: 'Optimal skill acquisition sequence',
        validation: skill.validation_status ?? 'In progress',
      })),
      gradeDelta: data[0]?.grade_delta ?? 0,
    };
  }

  private async fetchTomorrowSchedule(input: EveningReviewInput) {
    const { data } = await this.supabase
      .from('tomorrow_plan')
      .select('block, focus, quest_id, college_readiness_signal')
      .eq('user_id', input.userId)
      .eq('date', input.date)
      .order('block');
    if (!data?.length) {
      return {
        preview: [
          { block: '6:45 AM', focus: 'Chemistry lab prep', questId: undefined },
          { block: '3:30 PM', focus: 'College essay drafting', questId: 'quest-college-essay' },
        ],
        collegeReadiness: 'Portfolio 78% ready; add leadership reflection.',
      };
    }
    return {
      preview: data.map((row) => ({ block: row.block, focus: row.focus, questId: row.quest_id ?? undefined })),
      collegeReadiness: data[0]?.college_readiness_signal ?? 'Portfolio on track.',
    };
  }

  private async fetchWellnessSignals(input: EveningReviewInput) {
    const { data } = await this.supabase
      .from('wellness_logs')
      .select('stress_level, mood, recommendation')
      .eq('user_id', input.userId)
      .eq('date', input.date)
      .maybeSingle();
    if (data) {
      return {
        stress: data.stress_level,
        mood: data.mood,
        recommendation: data.recommendation,
      };
    }
    return {
      stress: 0.42,
      mood: 'steady',
      recommendation: 'Wrap with gratitude journal and 8 hours of rest.',
    };
  }

  private weekStart(date: string) {
    const d = new Date(date);
    const diff = d.getDate() - d.getDay();
    const monday = new Date(d.setDate(diff + 1));
    return monday.toISOString().slice(0, 10);
  }
}

export const createEveningReviewManager = (config: EveningReviewConfig) => new EveningReviewManager(config);
