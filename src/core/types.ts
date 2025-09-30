export type EnvironmentObjectContext =
  | 'study_tool'
  | 'distraction'
  | 'focus_anchor'
  | 'wellness_support'
  | string;

export type EnvironmentObject = {
  label: string;
  confidence: number;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  context: EnvironmentObjectContext;
};

export interface EnvironmentScan {
  objects: EnvironmentObject[];
  people: number;
  activity: string;
  mood: string;
  location: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  userState: {
    likelyIntent: string;
    focusLevel: number;
    energyEstimate: number;
    stressIndicators: number;
  };
}

export type QuestObjectiveType = 'action' | 'create' | 'collect' | 'reflect' | string;

export interface QuestObjective {
  id: string;
  description: string;
  type: QuestObjectiveType;
  quantity: number;
  completed: boolean;
}

export type QuestRewardType = 'xp' | 'vTokens' | 'item' | string;

export interface QuestReward {
  type: QuestRewardType;
  value: number;
  label?: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'learning' | 'focus' | 'social' | 'wellness' | string;
  difficulty: number;
  objectives: QuestObjective[];
  rewards: QuestReward[];
  timeLimit?: number;
  environmentRequirements?: EnvironmentScan;
  generatedFrom?: string;
  status?: 'active' | 'completed';
}
