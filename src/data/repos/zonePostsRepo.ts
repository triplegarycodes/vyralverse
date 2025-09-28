// Step 10: Repository for Zone community posts
import { z } from 'zod';
import { executeSql } from '../db';

const postSchema = z.object({
  id: z.number().optional(),
  author: z.string(),
  body: z.string(),
  pinned: z.number(),
  reactions: z.number(),
  created_at: z.number()
});

export type ZonePost = z.infer<typeof postSchema>;

export const ZonePostsRepo = {
  async list(): Promise<ZonePost[]> {
    const result = await executeSql('SELECT * FROM zone_posts ORDER BY pinned DESC, created_at DESC');
    const rows = Array.from({ length: result.rows.length }, (_, i) => result.rows.item(i));
    return rows.map(row => postSchema.parse(row));
  },
  async add(post: Omit<ZonePost, 'id'>): Promise<ZonePost> {
    const validated = postSchema.omit({ id: true }).parse(post);
    const result = await executeSql(
      'INSERT INTO zone_posts (author, body, pinned, reactions, created_at) VALUES (?, ?, ?, ?, ?)',
      [validated.author, validated.body, validated.pinned, validated.reactions, validated.created_at]
    );
    return { ...validated, id: result.insertId ?? undefined };
  },
  async updatePinned(id: number, pinned: boolean): Promise<void> {
    await executeSql('UPDATE zone_posts SET pinned = ? WHERE id = ?', [pinned ? 1 : 0, id]);
  },
  async delete(id: number): Promise<void> {
    await executeSql('DELETE FROM zone_posts WHERE id = ?', [id]);
  }
};
