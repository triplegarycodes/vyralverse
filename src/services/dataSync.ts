import { createClient, type SupabaseClient, type RealtimeChannel } from '@supabase/supabase-js';
import { io, type Socket } from 'socket.io-client';
import type { DataSync } from '../core/types';

export interface DataSyncConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  websocketUrl: string;
}

export interface SyncPayload {
  academic: Record<string, unknown>;
  personal: Record<string, unknown>;
  social: Record<string, unknown>;
  progress: Record<string, unknown>;
}

export type SyncListener = (payload: SyncPayload) => void;

const SYNC_DESCRIPTOR: DataSync = {
  academic: 'Assignment deadlines, test schedules, grades',
  personal: 'Energy levels, stress indicators, interests',
  social: 'Group projects, study groups, mentor connections',
  progress: 'Skill development, quest completion, achievements',
};

export class CrossPlatformDataSyncService {
  private supabase: SupabaseClient;
  private socket?: Socket;
  private listeners = new Set<SyncListener>();
  private presenceChannel?: RealtimeChannel;

  constructor(private config: DataSyncConfig) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
  }

  async connect(userId: string) {
    if (!this.socket) {
      this.socket = io(this.config.websocketUrl, {
        transports: ['websocket'],
        query: { userId },
      });
      this.socket.on('sync-update', (payload: SyncPayload) => {
        this.listeners.forEach((listener) => listener(payload));
      });
    }
    if (!this.presenceChannel) {
      this.presenceChannel = this.supabase.channel(`presence:${userId}`);
      await this.presenceChannel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.broadcastPresence(userId);
        }
      });
    }
  }

  onSync(listener: SyncListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async requestSync(userId: string): Promise<SyncPayload> {
    const [academic, personal, social, progress] = await Promise.all([
      this.fetchAcademic(userId),
      this.fetchPersonal(userId),
      this.fetchSocial(userId),
      this.fetchProgress(userId),
    ]);
    const payload: SyncPayload = { academic, personal, social, progress };
    this.listeners.forEach((listener) => listener(payload));
    this.socket?.emit('sync-request', payload);
    return payload;
  }

  private async fetchAcademic(userId: string) {
    const { data } = await this.supabase
      .from('assignments')
      .select('title, due_date, status')
      .eq('user_id', userId)
      .order('due_date');
    return {
      descriptor: SYNC_DESCRIPTOR.academic,
      items: data ?? [],
    };
  }

  private async fetchPersonal(userId: string) {
    const { data } = await this.supabase
      .from('wellness_logs')
      .select('date, stress_level, mood')
      .eq('user_id', userId)
      .gte('date', this.weekStart());
    return {
      descriptor: SYNC_DESCRIPTOR.personal,
      entries: data ?? [],
    };
  }

  private async fetchSocial(userId: string) {
    const { data } = await this.supabase
      .from('collaboration_matches')
      .select('peer_name, project, status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    return {
      descriptor: SYNC_DESCRIPTOR.social,
      matches: data ?? [],
    };
  }

  private async fetchProgress(userId: string) {
    const { data } = await this.supabase
      .from('quest_progress_view')
      .select('quest_id, status, xp_earned, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(20);
    return {
      descriptor: SYNC_DESCRIPTOR.progress,
      quests: data ?? [],
    };
  }

  private broadcastPresence(userId: string) {
    this.socket?.emit('presence-update', {
      userId,
      timestamp: Date.now(),
    });
  }

  private weekStart() {
    const now = new Date();
    const diff = now.getDate() - now.getDay();
    const monday = new Date(now.setDate(diff + 1));
    return monday.toISOString().slice(0, 10);
  }
}

export const createCrossPlatformDataSyncService = (config: DataSyncConfig) =>
  new CrossPlatformDataSyncService(config);
