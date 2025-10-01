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

export interface MorningFlow {
  wakeUp: 'Gentle notification based on sleep cycle';
  energyAssessment: 'Biometric + self-reported energy levels';
  dailyFocus: 'AI-suggested priorities based on schedule';
  questPreview: 'Preview of daily challenges and opportunities';
  commuteOptimization: 'Learning content for travel time';
}

export interface SchoolIntegration {
  classDetection: 'Auto-recognize which class student is in';
  assignmentSync: 'Real-time integration with Google Classroom/Canvas';
  focusTracking: 'Attention monitoring during lessons';
  breakOptimization: 'Smart break suggestions between classes';
  socialConnections: 'Peer collaboration opportunities';
}

export interface AfterSchoolFlow {
  environmentScan: 'LensCore analyzes study setup';
  homeworkQuests: 'Assignment conversion to engaging challenges';
  focusSessions: 'Pomodoro-style timed work blocks';
  progressTracking: 'Real-time skill development updates';
  mentorAccess: 'On-demand tutoring and guidance';
}

export interface EveningFlow {
  achievementReview: 'Daily progress celebration';
  skillUnlocks: 'New abilities based on daily performance';
  tomorrowPreview: 'AI-predicted optimal next day schedule';
  wellnessCheck: 'Mental health and stress assessment';
  dataSync: 'Cross-device progress synchronization';
}

export interface AIAnalysis {
  objectDetection: 'Books, devices, people, materials';
  activityClassification: 'Studying, socializing, creating, resting';
  moodAssessment: 'Focus, frustration, engagement, stress';
  intentPrediction: 'What student is trying to accomplish';
  interventionTriggers: 'When and how to offer help';
}

export interface QuestGeneration {
  input: 'Environment scan + user history + academic calendar';
  processing: 'Difficulty scaling × engagement potential × learning value';
  output: 'Personalized quest with optimal challenge level';
  adaptation: 'Real-time difficulty adjustment based on performance';
}

export interface SkillProgression {
  baseline: 'Current skill levels and knowledge gaps';
  targets: 'Curriculum requirements + personal goals';
  pathway: 'Optimal skill acquisition sequence';
  validation: 'Mastery verification through multiple measures';
}

export interface DataSync {
  academic: 'Assignment deadlines, test schedules, grades';
  personal: 'Energy levels, stress indicators, interests';
  social: 'Group projects, study groups, mentor connections';
  progress: 'Skill development, quest completion, achievements';
}

export interface PredictiveFeatures {
  strugglePrediction: 'Identify at-risk students 2 weeks early';
  optimalScheduling: 'Suggest best times for different types of work';
  resourceMatching: 'Auto-connect students with perfect learning materials';
  interventionTiming: 'Know exactly when help will be most effective';
}

export interface EngagementTracking {
  dailyActiveUsage: 'Target: 60+ minutes';
  questCompletionRate: 'Target: 75%+';
  skillProgression: 'Target: 2+ skills leveled up weekly';
  streakMaintenance: 'Target: 80%+ weekly consistency';
}

export interface OutcomeMetrics {
  gradeImprovement: 'Measure subject-specific progress';
  assignmentCompletion: 'Track on-time submission rates';
  skillMastery: 'Verify competency development';
  collegeReadiness: 'Track portfolio and preparation metrics';
}
