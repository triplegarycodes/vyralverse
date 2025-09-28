// Step 10: Repository for Lyfe lessons and progress tracking
import { z } from 'zod';
import { executeSql } from '../db';

const lessonSchema = z.object({
  id: z.number().optional(),
  topic: z.string(),
  outline: z.string(),
  created_at: z.number()
});

const progressSchema = z.object({
  id: z.number().optional(),
  lesson_id: z.number(),
  status: z.enum(['pending', 'in-progress', 'complete']),
  xp: z.number(),
  completed_at: z.number().nullable()
});

export type LyfeLesson = z.infer<typeof lessonSchema>;
export type LyfeProgress = z.infer<typeof progressSchema>;

const mapRows = <T>(schema: z.ZodType<T>, rows: any[]): T[] => rows.map(row => schema.parse(row));

export const LyfeLessonsRepo = {
  async list(): Promise<LyfeLesson[]> {
    const result = await executeSql('SELECT * FROM lyfe_lessons ORDER BY created_at DESC');
    const rows = Array.from({ length: result.rows.length }, (_, i) => result.rows.item(i));
    return mapRows(lessonSchema, rows);
  },
  async add(lesson: Omit<LyfeLesson, 'id'>): Promise<LyfeLesson> {
    const validated = lessonSchema.omit({ id: true }).parse(lesson);
    const result = await executeSql(
      'INSERT INTO lyfe_lessons (topic, outline, created_at) VALUES (?, ?, ?)',
      [validated.topic, validated.outline, validated.created_at]
    );
    return { ...validated, id: result.insertId ?? undefined };
  },
  async upsertProgress(progress: Omit<LyfeProgress, 'id'>): Promise<void> {
    const validated = progressSchema.omit({ id: true }).parse(progress);
    await executeSql(
      `INSERT INTO lyfe_progress (lesson_id, status, xp, completed_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(lesson_id) DO UPDATE SET status = excluded.status, xp = excluded.xp, completed_at = excluded.completed_at`,
      [
        validated.lesson_id,
        validated.status,
        validated.xp,
        validated.completed_at ?? null
      ]
    );
  },
  async listProgress(): Promise<LyfeProgress[]> {
    const result = await executeSql('SELECT * FROM lyfe_progress ORDER BY lesson_id ASC');
    const rows = Array.from({ length: result.rows.length }, (_, i) => result.rows.item(i));
    return mapRows(progressSchema, rows);
  }
};
