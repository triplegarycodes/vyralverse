import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';
import type { EnvironmentScan, MorningFlow, Quest } from '../core/types';
import { lensCoreEnvironmentAnalyzer, type LensCoreContext } from './environmentAnalysis';
import { adaptiveQuestEngine, type QuestGenerationContext } from './questEngine';

export interface MorningActivationConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  openAiKey?: string;
}

export interface MorningActivationInput {
  userId: string;
  wakeTime: string;
  biometricEnergy: number;
  selfReportedEnergy: number;
  commuteMinutes: number;
  scheduleFocus: string;
  upcomingAssessments: string[];
  lensContext: LensCoreContext;
  environmentSnapshot?: EnvironmentScan;
}

export interface MorningActivationPlan {
  flow: MorningFlow;
  energyScore: number;
  dailyFocusSummary: string;
  questPreview: Quest[];
  commuteContent: { title: string; duration: number; url: string }[];
  aiMessage: string;
}

const MORNING_FLOW: MorningFlow = {
  wakeUp: 'Gentle notification based on sleep cycle',
  energyAssessment: 'Biometric + self-reported energy levels',
  dailyFocus: 'AI-suggested priorities based on schedule',
  questPreview: 'Preview of daily challenges and opportunities',
  commuteOptimization: 'Learning content for travel time',
};

export class MorningRoutineManager {
  private supabase: SupabaseClient;
  private openai?: OpenAI;

  constructor(private config: MorningActivationConfig) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
    if (config.openAiKey) {
      this.openai = new OpenAI({ apiKey: config.openAiKey, dangerouslyAllowBrowser: true });
    }
  }

  async planMorning(input: MorningActivationInput): Promise<MorningActivationPlan> {
    const energyScore = this.calculateEnergyScore(input);
    const progress = await this.fetchSkillSignals(input.userId);
    const commuteContent = this.curateCommuteLearning(input);
    let environment = input.environmentSnapshot;
    if (!environment) {
      const synthetic = lensCoreEnvironmentAnalyzer.createSyntheticTensor(input.lensContext);
      try {
        environment = (
          await lensCoreEnvironmentAnalyzer.analyzeCameraTensor(synthetic, input.lensContext)
        ).scan;
      } finally {
        synthetic.dispose();
      }
    }

    const questContext: QuestGenerationContext = {
      userId: input.userId,
      subject: input.scheduleFocus,
      environment: environment!,
      focus: input.scheduleFocus,
      availableMinutes: Math.max(20, input.commuteMinutes + 30),
      energyLevel: energyScore,
      learningStyle: progress.learningStyle,
      recentPerformance: progress.performance,
      academicCalendar: {
        nextAssessment: input.upcomingAssessments[0],
        dueToday: progress.dueToday,
      },
      preferences: progress.preferences,
    };
    const quest = adaptiveQuestEngine.generateQuest(questContext);

    const aiMessage = await this.generateCoachingMessage({
      energyScore,
      focus: input.scheduleFocus,
      commute: input.commuteMinutes,
      nextQuest: quest.quest.title,
      upcomingAssessments: input.upcomingAssessments,
    });

    return {
      flow: MORNING_FLOW,
      energyScore,
      dailyFocusSummary: `Priority: ${input.scheduleFocus}. Upcoming: ${input.upcomingAssessments.join(', ') || 'clear runway.'}`,
      questPreview: [quest.quest],
      commuteContent,
      aiMessage,
    };
  }

  private calculateEnergyScore(input: MorningActivationInput) {
    const weighted = input.biometricEnergy * 0.6 + input.selfReportedEnergy * 0.4;
    return Number(Math.max(0, Math.min(1, weighted)).toFixed(2));
  }

  private async fetchSkillSignals(userId: string) {
    const [{ data: performance }, { data: preferences }, { data: assignments }] = await Promise.all([
      this.supabase.from('skill_performance_view').select('completion_rate, accuracy').eq('user_id', userId).single(),
      this.supabase.from('learning_preferences').select('learning_style, collaborators, challenge_bias').eq('user_id', userId).single(),
      this.supabase
        .from('assignments')
        .select('title')
        .eq('user_id', userId)
        .eq('due_date', new Date().toISOString().slice(0, 10)),
    ]);

    return {
      performance: {
        completionRate: performance?.completion_rate ?? 0.7,
        accuracy: performance?.accuracy ?? 0.7,
      },
      learningStyle: (preferences?.learning_style ?? 'visual') as 'visual' | 'auditory' | 'kinesthetic' | 'reading',
      dueToday: assignments?.map((assignment) => assignment.title) ?? [],
      preferences: {
        collaborators: preferences?.collaborators ?? [],
        challengeBias: preferences?.challenge_bias ?? 'balanced',
      },
    };
  }

  private curateCommuteLearning(input: MorningActivationInput) {
    const playlist = [
      {
        title: `${input.scheduleFocus} Primer`,
        duration: Math.min(10, input.commuteMinutes),
        url: 'https://cdn.vyralverse.com/audio/focus-primer.mp3',
      },
      {
        title: 'Confidence Pulse',
        duration: Math.max(5, input.commuteMinutes - 10),
        url: 'https://cdn.vyralverse.com/audio/confidence-pulse.mp3',
      },
    ];
    return playlist.filter((item) => item.duration > 0);
  }

  private async generateCoachingMessage(payload: {
    energyScore: number;
    focus: string;
    commute: number;
    nextQuest: string;
    upcomingAssessments: string[];
  }) {
    if (!this.openai) {
      return `Energy at ${Math.round(payload.energyScore * 100)}%. Launch ${payload.nextQuest} before ${
        payload.upcomingAssessments[0] ?? 'classes'
      } and use your ${payload.commute}-minute commute to pre-load confidence.`;
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are Vyral, a motivational learning coach. Be concise, energizing, and specific to the student’s day.',
          },
          {
            role: 'user',
            content: `Energy score: ${payload.energyScore}. Focus: ${payload.focus}. Commute: ${payload.commute} minutes. Next quest: ${payload.nextQuest}. Upcoming assessments: ${payload.upcomingAssessments.join(', ') || 'none'}.`,
          },
        ],
        temperature: 0.6,
        max_tokens: 120,
      });
      return response.choices[0]?.message?.content ?? 'Let’s own the morning!';
    } catch (error) {
      console.warn('MorningRoutineManager: OpenAI message fallback', error);
      return `Energy at ${Math.round(payload.energyScore * 100)}%. Launch ${payload.nextQuest} before ${
        payload.upcomingAssessments[0] ?? 'classes'
      }.`;
    }
  }
}

export const createMorningRoutineManager = (config: MorningActivationConfig) => new MorningRoutineManager(config);
