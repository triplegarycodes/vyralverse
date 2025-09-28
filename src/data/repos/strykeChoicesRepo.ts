// Step 10: Repository for Stryke branching decisions
import { z } from 'zod';
import { executeSql } from '../db';

const choiceSchema = z.object({
  id: z.number().optional(),
  scenario_id: z.string(),
  option_id: z.string(),
  effect: z.string(),
  created_at: z.number()
});

export type StrykeChoice = z.infer<typeof choiceSchema>;

export const StrykeChoicesRepo = {
  async listByScenario(scenarioId: string): Promise<StrykeChoice[]> {
    const result = await executeSql(
      'SELECT * FROM stryke_choices WHERE scenario_id = ? ORDER BY created_at DESC',
      [scenarioId]
    );
    const rows = Array.from({ length: result.rows.length }, (_, i) => result.rows.item(i));
    return rows.map(row => choiceSchema.parse(row));
  },
  async add(choice: Omit<StrykeChoice, 'id'>): Promise<StrykeChoice> {
    const validated = choiceSchema.omit({ id: true }).parse(choice);
    const result = await executeSql(
      'INSERT INTO stryke_choices (scenario_id, option_id, effect, created_at) VALUES (?, ?, ?, ?)',
      [validated.scenario_id, validated.option_id, validated.effect, validated.created_at]
    );
    return { ...validated, id: result.insertId ?? undefined };
  }
};
