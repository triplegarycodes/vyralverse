// Step 10: Repository layer with Zod validation for Core module
import { z } from 'zod';
import { executeSql } from '../db';

const coreMessageSchema = z.object({
  id: z.number().optional(),
  channel: z.string(),
  author: z.string(),
  content: z.string(),
  avatar: z.string().nullable().optional(),
  created_at: z.number()
});

export type CoreMessage = z.infer<typeof coreMessageSchema>;

const mapRows = (rows: any[]): CoreMessage[] => rows.map(row => coreMessageSchema.parse(row));

export const CoreMessagesRepo = {
  async list(channel: string): Promise<CoreMessage[]> {
    const result = await executeSql(
      'SELECT * FROM core_messages WHERE channel = ? ORDER BY created_at ASC',
      [channel]
    );
    const rows = Array.from({ length: result.rows.length }, (_, i) => result.rows.item(i));
    return mapRows(rows);
  },
  async add(message: Omit<CoreMessage, 'id'>): Promise<CoreMessage> {
    const validated = coreMessageSchema.omit({ id: true }).parse(message);
    const result = await executeSql(
      'INSERT INTO core_messages (channel, author, content, avatar, created_at) VALUES (?, ?, ?, ?, ?)',
      [
        validated.channel,
        validated.author,
        validated.content,
        validated.avatar ?? null,
        validated.created_at
      ]
    );
    return { ...validated, id: result.insertId ?? undefined };
  }
};
