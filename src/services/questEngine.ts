import type { EnvironmentScan, Quest, QuestObjective, QuestReward } from '../core/types';

type QuestCategory = 'foundation' | 'acceleration' | 'wellness' | 'social' | 'portfolio';

export interface QuestGenerationContext {
  userId: string;
  subject: string;
  environment: EnvironmentScan;
  focus: string;
  availableMinutes: number;
  energyLevel: number;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  recentPerformance: {
    completionRate: number;
    accuracy: number;
  };
  academicCalendar: {
    nextAssessment?: string;
    dueToday: string[];
  };
  preferences?: {
    collaborators?: string[];
    challengeBias?: 'easier' | 'balanced' | 'harder';
  };
}

export interface QuestGenerationResult {
  quest: Quest;
  category: QuestCategory;
  adaptationStrategy: string;
}

const QUEST_DIFFICULTY_LOOKUP: Record<QuestCategory, number> = {
  foundation: 0.4,
  acceleration: 0.7,
  wellness: 0.3,
  social: 0.5,
  portfolio: 0.6,
};

const DEFAULT_REWARDS: QuestReward[] = [
  { type: 'xp', value: 75, label: 'Core XP' },
  { type: 'vTokens', value: 15, label: 'Verse Tokens' },
];

const randomId = () => `${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;

export class AdaptiveQuestEngine {
  computeCategory(context: QuestGenerationContext): QuestCategory {
    if (context.subject.toLowerCase().includes('essay') || context.focus.includes('portfolio')) {
      return 'portfolio';
    }
    if (context.environment.mood === 'stressed') {
      return 'wellness';
    }
    if (context.recentPerformance.accuracy < 0.65) {
      return 'foundation';
    }
    if (context.recentPerformance.completionRate > 0.85 && context.availableMinutes >= 45) {
      return 'acceleration';
    }
    if (context.preferences?.collaborators?.length) {
      return 'social';
    }
    return 'foundation';
  }

  generateQuest(context: QuestGenerationContext): QuestGenerationResult {
    const category = this.computeCategory(context);
    const difficulty = this.adaptDifficulty(category, context);
    const objectives = this.createObjectives(category, context, difficulty);
    const quest: Quest = {
      id: randomId(),
      title: this.buildQuestTitle(category, context),
      description: this.buildQuestDescription(category, context),
      type: this.resolveQuestType(category),
      difficulty,
      objectives,
      rewards: this.buildRewards(category),
      timeLimit: this.estimateTimeLimit(category, context),
      generatedFrom: `${context.subject}-${context.focus}`,
    };

    return {
      quest,
      category,
      adaptationStrategy: this.describeAdaptation(category, context, difficulty),
    };
  }

  adaptQuestToPerformance(quest: Quest, performance: { success: boolean; accuracy: number }) {
    const updated = { ...quest };
    if (!performance.success) {
      updated.difficulty = Math.max(0.2, quest.difficulty - 0.1);
      updated.objectives = quest.objectives.map((objective) => ({
        ...objective,
        quantity: Math.max(1, Math.round(objective.quantity * 0.75)),
      }));
    } else if (performance.accuracy > 0.9) {
      updated.difficulty = Math.min(1, quest.difficulty + 0.1);
      updated.objectives = quest.objectives.map((objective) => ({
        ...objective,
        quantity: Math.round(objective.quantity * 1.2),
      }));
    }
    return updated;
  }

  private adaptDifficulty(category: QuestCategory, context: QuestGenerationContext) {
    const base = QUEST_DIFFICULTY_LOOKUP[category];
    const energyModifier = context.energyLevel > 0.7 ? 0.1 : context.energyLevel < 0.4 ? -0.1 : 0;
    const preferenceModifier =
      context.preferences?.challengeBias === 'harder'
        ? 0.1
        : context.preferences?.challengeBias === 'easier'
        ? -0.1
        : 0;
    const accuracyModifier = context.recentPerformance.accuracy < 0.6 ? -0.15 : 0;
    return Number(Math.max(0.2, Math.min(1, base + energyModifier + preferenceModifier + accuracyModifier)).toFixed(2));
  }

  private createObjectives(category: QuestCategory, context: QuestGenerationContext, difficulty: number): QuestObjective[] {
    const baseQuantity = Math.max(2, Math.round((context.availableMinutes / 15) * (difficulty + 0.5)));
    switch (category) {
      case 'foundation':
        return [
          {
            id: randomId(),
            description: `Work through ${baseQuantity} practice problems focusing on ${context.focus}.`,
            type: 'action',
            quantity: baseQuantity,
            completed: false,
          },
          {
            id: randomId(),
            description: 'Reflect on two problem-solving strategies that felt effective.',
            type: 'reflect',
            quantity: 2,
            completed: false,
          },
        ];
      case 'acceleration':
        return [
          {
            id: randomId(),
            description: `Create a challenge set of ${baseQuantity} advanced items to teach a peer.`,
            type: 'create',
            quantity: baseQuantity,
            completed: false,
          },
          {
            id: randomId(),
            description: 'Record a 90-second walkthrough explaining your reasoning.',
            type: 'create',
            quantity: 1,
            completed: false,
          },
        ];
      case 'wellness':
        return [
          {
            id: randomId(),
            description: 'Complete a guided breathing exercise with 5 deep cycles.',
            type: 'action',
            quantity: 5,
            completed: false,
          },
          {
            id: randomId(),
            description: 'Journal one sentence about what went well today.',
            type: 'reflect',
            quantity: 1,
            completed: false,
          },
        ];
      case 'social':
        return [
          {
            id: randomId(),
            description: `Coordinate a 20-minute co-working sprint with ${context.preferences?.collaborators?.join(', ') ?? 'a peer'}.`,
            type: 'action',
            quantity: 1,
            completed: false,
          },
          {
            id: randomId(),
            description: 'Exchange feedback highlights with your teammate.',
            type: 'collect',
            quantity: 2,
            completed: false,
          },
        ];
      case 'portfolio':
      default:
        return [
          {
            id: randomId(),
            description: `Draft ${baseQuantity} impactful sentences for your portfolio artifact.`,
            type: 'create',
            quantity: baseQuantity,
            completed: false,
          },
          {
            id: randomId(),
            description: 'Gather two multimedia references to elevate the piece.',
            type: 'collect',
            quantity: 2,
            completed: false,
          },
        ];
    }
  }

  private buildRewards(category: QuestCategory): QuestReward[] {
    if (category === 'wellness') {
      return [
        { type: 'xp', value: 40, label: 'Calm XP' },
        { type: 'vTokens', value: 10, label: 'Focus Tokens' },
      ];
    }
    return DEFAULT_REWARDS;
  }

  private estimateTimeLimit(category: QuestCategory, context: QuestGenerationContext) {
    if (category === 'wellness') {
      return 10;
    }
    return Math.min(90, Math.max(20, context.availableMinutes));
  }

  private buildQuestTitle(category: QuestCategory, context: QuestGenerationContext) {
    switch (category) {
      case 'foundation':
        return `${context.subject} Foundation Builder`;
      case 'acceleration':
        return `${context.subject} Vanguard Sprint`;
      case 'social':
        return `${context.subject} Collaboration Charge`;
      case 'wellness':
        return 'Reset & Refocus Ritual';
      case 'portfolio':
      default:
        return `${context.subject} Portfolio Forge`;
    }
  }

  private buildQuestDescription(category: QuestCategory, context: QuestGenerationContext) {
    const dueToday = context.academicCalendar.dueToday.length
      ? `Due today: ${context.academicCalendar.dueToday.join(', ')}.`
      : 'No urgent deadlines.';
    return `${dueToday} Focus: ${context.focus}. ${
      category === 'wellness'
        ? 'Re-center so you can push again tonight.'
        : 'Push mastery with intentional reps.'
    }`;
  }

  private resolveQuestType(category: QuestCategory): Quest['type'] {
    switch (category) {
      case 'wellness':
        return 'wellness';
      case 'social':
        return 'social';
      case 'acceleration':
      case 'foundation':
        return 'learning';
      case 'portfolio':
      default:
        return 'focus';
    }
  }

  private describeAdaptation(category: QuestCategory, context: QuestGenerationContext, difficulty: number) {
    const signals = [
      `Difficulty calibrated to ${Math.round(difficulty * 100)}% intensity`,
      `Energy level ${Math.round(context.energyLevel * 100)}%`,
      `Recent accuracy ${Math.round(context.recentPerformance.accuracy * 100)}%`,
    ];
    if (context.preferences?.collaborators?.length) {
      signals.push(`Collaboration with ${context.preferences.collaborators.join(', ')}`);
    }
    if (context.academicCalendar.nextAssessment) {
      signals.push(`Next assessment: ${context.academicCalendar.nextAssessment}`);
    }
    return `${category} quest tuned via ${signals.join(' | ')}`;
  }
}

export const adaptiveQuestEngine = new AdaptiveQuestEngine();
