import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { PredictiveFeatures } from '../core/types';

export interface CounselingAutomationConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export interface CounselingRiskSignal {
  userId: string;
  academicRisk: number;
  stressRisk: number;
  absenteeismRisk: number;
  trendNarrative: string;
}

export interface CounselingIntervention {
  userId: string;
  priority: 'low' | 'medium' | 'high';
  scheduledAt: string;
  resourceId: string;
  notes: string;
}

const PREDICTIVE_FEATURES: PredictiveFeatures = {
  strugglePrediction: 'Identify at-risk students 2 weeks early',
  optimalScheduling: 'Suggest best times for different types of work',
  resourceMatching: 'Auto-connect students with perfect learning materials',
  interventionTiming: 'Know exactly when help will be most effective',
};

export class CounselingAutomationEngine {
  private supabase: SupabaseClient;

  constructor(private config: CounselingAutomationConfig) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
  }

  async evaluateRisk(userId: string): Promise<CounselingRiskSignal> {
    const { data } = await this.supabase
      .rpc('compute_student_risk', { p_user_id: userId })
      .maybeSingle();

    const academicRisk = data?.academic_risk ?? 0.35;
    const stressRisk = data?.stress_risk ?? 0.25;
    const absenteeismRisk = data?.absenteeism_risk ?? 0.15;

    const trendNarrative = `Academic ${Math.round(academicRisk * 100)}%, Stress ${Math.round(
      stressRisk * 100,
    )}%, Attendance ${Math.round(absenteeismRisk * 100)}%.`;

    return {
      userId,
      academicRisk,
      stressRisk,
      absenteeismRisk,
      trendNarrative,
    };
  }

  async scheduleIntervention(signal: CounselingRiskSignal): Promise<CounselingIntervention> {
    const priority = this.resolvePriority(signal);
    const scheduledAt = this.computeScheduleWindow(priority);
    const resource = await this.matchResource(signal, priority);

    const { data } = await this.supabase
      .from('counseling_interventions')
      .insert({
        user_id: signal.userId,
        priority,
        scheduled_at: scheduledAt,
        resource_id: resource.id,
        notes: resource.notes,
      })
      .select()
      .single();

    return {
      userId: signal.userId,
      priority,
      scheduledAt,
      resourceId: data?.resource_id ?? resource.id,
      notes: data?.notes ?? resource.notes,
    };
  }

  private resolvePriority(signal: CounselingRiskSignal): CounselingIntervention['priority'] {
    if (signal.academicRisk > 0.7 || signal.stressRisk > 0.75) {
      return 'high';
    }
    if (signal.academicRisk > 0.5 || signal.stressRisk > 0.55) {
      return 'medium';
    }
    return 'low';
  }

  private computeScheduleWindow(priority: CounselingIntervention['priority']) {
    const now = new Date();
    if (priority === 'high') {
      now.setHours(now.getHours() + 2);
    } else if (priority === 'medium') {
      now.setDate(now.getDate() + 1);
      now.setHours(10, 0, 0, 0);
    } else {
      now.setDate(now.getDate() + 3);
      now.setHours(14, 0, 0, 0);
    }
    return now.toISOString();
  }

  private async matchResource(signal: CounselingRiskSignal, priority: CounselingIntervention['priority']) {
    const { data } = await this.supabase
      .from('support_resources')
      .select('id, notes')
      .lte('threshold', Math.max(signal.academicRisk, signal.stressRisk))
      .order('threshold', { ascending: false })
      .maybeSingle();
    if (data) {
      return data;
    }
    return {
      id: priority === 'high' ? 'tutor-emergency' : 'coach-checkin',
      notes: priority === 'high' ? 'Immediate tutoring with mentor-on-call.' : 'Schedule wellness coach check-in.',
    };
  }
}

export const createCounselingAutomationEngine = (config: CounselingAutomationConfig) =>
  new CounselingAutomationEngine(config);

export const counselingPredictiveFeatures = PREDICTIVE_FEATURES;
