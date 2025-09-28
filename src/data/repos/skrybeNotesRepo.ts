// Step 10: Repository for Skrybe creative notes
import { z } from 'zod';
import { executeSql } from '../db';

const noteSchema = z.object({
  id: z.number().optional(),
  title: z.string(),
  body: z.string(),
  word_count: z.number(),
  updated_at: z.number()
});

export type SkrybeNote = z.infer<typeof noteSchema>;

export const SkrybeNotesRepo = {
  async list(): Promise<SkrybeNote[]> {
    const result = await executeSql('SELECT * FROM skrybe_notes ORDER BY updated_at DESC');
    const rows = Array.from({ length: result.rows.length }, (_, i) => result.rows.item(i));
    return rows.map(row => noteSchema.parse(row));
  },
  async add(note: Omit<SkrybeNote, 'id'>): Promise<SkrybeNote> {
    const validated = noteSchema.omit({ id: true }).parse(note);
    const result = await executeSql(
      'INSERT INTO skrybe_notes (title, body, word_count, updated_at) VALUES (?, ?, ?, ?)',
      [validated.title, validated.body, validated.word_count, validated.updated_at]
    );
    return { ...validated, id: result.insertId ?? undefined };
  },
  async remove(id: number): Promise<void> {
    await executeSql('DELETE FROM skrybe_notes WHERE id = ?', [id]);
  }
};
