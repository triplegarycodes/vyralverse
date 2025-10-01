import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { EnvironmentScan, Quest } from '../core/types';
import { adaptiveQuestEngine, type QuestGenerationContext } from './questEngine';
import { lensCoreEnvironmentAnalyzer, type LensCoreContext } from './environmentAnalysis';

export interface ClassIntegrationConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export interface ClassDetectionContext {
  userId: string;
  gpsCourseCode?: string;
  beaconIdentifier?: string;
  scheduleBlockId: string;
  lensContext: LensCoreContext;
  environmentSnapshot?: EnvironmentScan;
}

export interface ClassDetectionResult {
  courseId: string;
  courseName: string;
  confidence: number;
  instructor?: string;
  assignmentsDue: string[];
  activeQuest?: Quest;
  focusScore: number;
  breakSuggestion?: string;
  collaborationMatches: string[];
}

type ClassDetectedListener = (result: ClassDetectionResult) => void;

export class SchoolIntegrationEngine {
  private supabase: SupabaseClient;
  private listeners = new Set<ClassDetectedListener>();

  constructor(private config: ClassIntegrationConfig) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
  }

  async detectClass(context: ClassDetectionContext): Promise<ClassDetectionResult> {
    const schedule = await this.fetchScheduleBlock(context.userId, context.scheduleBlockId);
    const [course, environment] = await Promise.all([
      this.resolveCourseFromSignals(context, schedule),
      this.resolveEnvironment(context),
    ]);

    const assignmentsDue = await this.lookupAssignments(course.course_id, context.userId);
    const focusScore = environment.userState.focusLevel;
    const breakSuggestion = this.computeBreakSuggestion(environment);
    const collaborationMatches = await this.fetchCollaborationMatches(course.course_id, context.userId);

    let activeQuest: Quest | undefined;
    if (assignmentsDue.length) {
      const questContext: QuestGenerationContext = {
        userId: context.userId,
        subject: course.course_name,
        environment,
        focus: `In-class mastery for ${course.course_name}`,
        availableMinutes: 20,
        energyLevel: environment.userState.energyEstimate,
        learningStyle: 'visual',
        recentPerformance: {
          completionRate: schedule?.completion_rate ?? 0.7,
          accuracy: schedule?.accuracy ?? 0.7,
        },
        academicCalendar: {
          nextAssessment: schedule?.next_assessment ?? undefined,
          dueToday: assignmentsDue,
        },
      };
      activeQuest = adaptiveQuestEngine.generateQuest(questContext).quest;
    }

    const result: ClassDetectionResult = {
      courseId: course.course_id,
      courseName: course.course_name,
      instructor: course.instructor,
      confidence: course.confidence,
      assignmentsDue,
      activeQuest,
      focusScore,
      breakSuggestion,
      collaborationMatches,
    };

    this.listeners.forEach((listener) => listener(result));
    return result;
  }

  onClassDetected(listener: ClassDetectedListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private async fetchScheduleBlock(userId: string, blockId: string) {
    const { data } = await this.supabase
      .from('schedule_blocks')
      .select('course_id, completion_rate, accuracy, next_assessment')
      .eq('user_id', userId)
      .eq('id', blockId)
      .maybeSingle();
    return data ?? null;
  }

  private async resolveCourseFromSignals(context: ClassDetectionContext, schedule: any) {
    if (schedule) {
      const { data } = await this.supabase
        .from('courses')
        .select('id, name, instructor')
        .eq('id', schedule.course_id)
        .maybeSingle();
      if (data) {
        return {
          course_id: data.id,
          course_name: data.name,
          instructor: data.instructor,
          confidence: 0.82,
        };
      }
    }
    const { data } = await this.supabase
      .rpc('resolve_course_from_context', {
        p_user_id: context.userId,
        p_schedule_block: context.scheduleBlockId,
        p_beacon: context.beaconIdentifier,
        p_gps_code: context.gpsCourseCode,
      })
      .single();
    return {
      course_id: data?.course_id ?? 'unknown',
      course_name: data?.course_name ?? 'Advisory',
      instructor: data?.instructor ?? undefined,
      confidence: data?.confidence ?? 0.55,
    };
  }

  private async resolveEnvironment(context: ClassDetectionContext) {
    if (context.environmentSnapshot) {
      return context.environmentSnapshot;
    }
    const synthetic = lensCoreEnvironmentAnalyzer.createSyntheticTensor(context.lensContext);
    try {
      const result = await lensCoreEnvironmentAnalyzer.analyzeCameraTensor(synthetic, context.lensContext);
      return result.scan;
    } finally {
      synthetic.dispose();
    }
  }

  private async lookupAssignments(courseId: string, userId: string) {
    const { data } = await this.supabase
      .from('assignments')
      .select('title')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .gte('due_date', new Date().toISOString().slice(0, 10));
    return data?.map((assignment) => assignment.title) ?? [];
  }

  private computeBreakSuggestion(environment: EnvironmentScan) {
    if (environment.userState.focusLevel < 0.45) {
      return 'Trigger a 3-minute reset walk after this block.';
    }
    if (environment.userState.stressIndicators > 0.65) {
      return 'Schedule a guided breathing quest before next class.';
    }
    return undefined;
  }

  private async fetchCollaborationMatches(courseId: string, userId: string) {
    const { data } = await this.supabase
      .from('collaboration_matches')
      .select('peer_name')
      .eq('course_id', courseId)
      .eq('user_id', userId)
      .limit(3);
    return data?.map((match) => match.peer_name) ?? [];
  }
}

export const createSchoolIntegrationEngine = (config: ClassIntegrationConfig) => new SchoolIntegrationEngine(config);
