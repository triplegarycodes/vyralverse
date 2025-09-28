// Step 10: Repository for Tree goal map
import { z } from 'zod';
import { executeSql } from '../db';

const nodeSchema = z.object({
  id: z.number().optional(),
  parent_id: z.number().nullable(),
  title: z.string(),
  hint: z.string().nullable(),
  created_at: z.number()
});

export type TreeNodeRecord = z.infer<typeof nodeSchema>;

export const TreeNodesRepo = {
  async listChildren(parentId: number | null): Promise<TreeNodeRecord[]> {
    const comparator = parentId === null ? 'IS NULL' : '= ?';
    const params = parentId === null ? [] : [parentId];
    const result = await executeSql(
      `SELECT * FROM tree_nodes WHERE parent_id ${comparator} ORDER BY created_at ASC`,
      params
    );
    const rows = Array.from({ length: result.rows.length }, (_, i) => result.rows.item(i));
    return rows.map(row => nodeSchema.parse(row));
  },
  async add(node: Omit<TreeNodeRecord, 'id'>): Promise<TreeNodeRecord> {
    const validated = nodeSchema.omit({ id: true }).parse(node);
    const result = await executeSql(
      'INSERT INTO tree_nodes (parent_id, title, hint, created_at) VALUES (?, ?, ?, ?)',
      [validated.parent_id ?? null, validated.title, validated.hint ?? null, validated.created_at]
    );
    return { ...validated, id: result.insertId ?? undefined };
  }
};
