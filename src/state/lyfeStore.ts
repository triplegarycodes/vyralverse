// Step 11 & 13: Lyfe lessons store with AI generator integration
import { create } from 'zustand';
import * as Notifications from 'expo-notifications';
import { LyfeLessonsRepo, LyfeLesson, LyfeProgress } from '../data/repos/lyfeLessonsRepo';
import { buildLessonOutline } from '../ai/lessons';
import { useNeoStore } from './neoStore';

export type LyfeState = {
  lessons: LyfeLesson[];
  progress: LyfeProgress[];
  loading: boolean;
  generateLesson: (topic: string) => Promise<void>;
  markComplete: (lessonId: number) => Promise<void>;
  scheduleReminder: (lessonId: number, minutesFromNow?: number) => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useLyfeStore = create<LyfeState>((set, get) => ({
  lessons: [],
  progress: [],
  loading: false,
  hydrate: async () => {
    set({ loading: true });
    const [lessons, progress] = await Promise.all([
      LyfeLessonsRepo.list(),
      LyfeLessonsRepo.listProgress()
    ]);
    set({ lessons, progress, loading: false });
  },
  generateLesson: async (topic: string) => {
    set({ loading: true });
    const outline = await buildLessonOutline(topic);
    const record = await LyfeLessonsRepo.add({
      topic: outline.topic,
      outline: JSON.stringify(outline.bullets),
      created_at: Date.now()
    });
    await LyfeLessonsRepo.upsertProgress({
      lesson_id: record.id ?? 0,
      status: 'in-progress',
      xp: 0,
      completed_at: null
    });
    await get().scheduleReminder(record.id ?? 0, 30);
    await get().hydrate();
    useNeoStore.getState().trigger('hint', 'Fresh Lyfe lesson ignited — absorb the pulse.');
  },
  markComplete: async (lessonId: number) => {
    const progress = get().progress.find(item => item.lesson_id === lessonId);
    const currentXp = progress?.xp ?? 0;
    await LyfeLessonsRepo.upsertProgress({
      lesson_id: lessonId,
      status: 'complete',
      xp: currentXp + 100,
      completed_at: Date.now()
    });
    await get().hydrate();
    useNeoStore.getState().trigger('celebrate', 'Lesson complete — XP surge synced.');
  },
  scheduleReminder: async (lessonId: number, minutesFromNow = 30) => {
    try {
      const permission = await Notifications.requestPermissionsAsync();
      if (!permission.granted) {
        return;
      }
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Lyfe Pulse',
          body: 'Loop back to your neon lesson before the glow fades.'
        },
        trigger: { seconds: minutesFromNow * 60 }
      });
    } catch (error) {
      console.warn('Failed to schedule reminder', error);
    }
  }
}));
