// Step 10: Repository for persisted user preferences
import { z } from 'zod';
import { executeSql } from '../db';

const prefSchema = z.object({
  id: z.number().optional(),
  key: z.string(),
  value: z.string(),
  updated_at: z.number()
});

export type UserPref = z.infer<typeof prefSchema>;

export const UserPrefsRepo = {
  async get(key: string): Promise<UserPref | undefined> {
    const result = await executeSql('SELECT * FROM user_prefs WHERE key = ? LIMIT 1', [key]);
    if (result.rows.length === 0) {
      return undefined;
    }
    return prefSchema.parse(result.rows.item(0));
  },
  async set(key: string, value: string): Promise<void> {
    const now = Date.now();
    await executeSql(
      `INSERT INTO user_prefs (key, value, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      [key, value, now]
    );
  }
};
