// Step 9: SQLite database bootstrap and migrations
import * as SQLite from 'expo-sqlite';

export type SQLParams = (string | number | null)[];

const database = SQLite.openDatabase('vyralverse.db');

const MIGRATIONS: { id: string; statements: string[] }[] = [
  {
    id: '0001_init_core',
    statements: [
      `CREATE TABLE IF NOT EXISTS core_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        channel TEXT NOT NULL,
        author TEXT NOT NULL,
        content TEXT NOT NULL,
        avatar TEXT,
        created_at INTEGER NOT NULL
      )`
    ]
  },
  {
    id: '0002_init_lyfe',
    statements: [
      `CREATE TABLE IF NOT EXISTS lyfe_lessons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        topic TEXT NOT NULL,
        outline TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS lyfe_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lesson_id INTEGER NOT NULL,
        status TEXT NOT NULL,
        xp INTEGER NOT NULL DEFAULT 0,
        completed_at INTEGER,
        FOREIGN KEY(lesson_id) REFERENCES lyfe_lessons(id)
      )`
    ]
  },
  {
    id: '0003_init_stryke',
    statements: [
      `CREATE TABLE IF NOT EXISTS stryke_choices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scenario_id TEXT NOT NULL,
        option_id TEXT NOT NULL,
        effect TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )`
    ]
  },
  {
    id: '0004_init_tree',
    statements: [
      `CREATE TABLE IF NOT EXISTS tree_nodes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        parent_id INTEGER,
        title TEXT NOT NULL,
        hint TEXT,
        created_at INTEGER NOT NULL,
        FOREIGN KEY(parent_id) REFERENCES tree_nodes(id)
      )`
    ]
  },
  {
    id: '0005_init_zone',
    statements: [
      `CREATE TABLE IF NOT EXISTS zone_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        author TEXT NOT NULL,
        body TEXT NOT NULL,
        pinned INTEGER NOT NULL DEFAULT 0,
        reactions INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL
      )`
    ]
  },
  {
    id: '0006_init_skrybe',
    statements: [
      `CREATE TABLE IF NOT EXISTS skrybe_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        word_count INTEGER NOT NULL DEFAULT 0,
        updated_at INTEGER NOT NULL
      )`
    ]
  },
  {
    id: '0007_init_prefs',
    statements: [
      `CREATE TABLE IF NOT EXISTS user_prefs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      )`
    ]
  }
];

export const executeSql = (sql: string, params: SQLParams = []): Promise<SQLite.SQLResultSet> =>
  new Promise((resolve, reject) => {
    database.transaction(
      tx => {
        tx.executeSql(
          sql,
          params,
          (_, result) => {
            resolve(result);
            return false;
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      error => reject(error)
    );
  });

export const initDatabase = async (): Promise<void> => {
  await executeSql(
    `CREATE TABLE IF NOT EXISTS migrations (
      id TEXT PRIMARY KEY,
      run_at INTEGER NOT NULL
    )`
  );

  for (const migration of MIGRATIONS) {
    const existing = await executeSql('SELECT id FROM migrations WHERE id = ?', [migration.id]);
    if (existing.rows.length === 0) {
      for (const statement of migration.statements) {
        await executeSql(statement);
      }
      await executeSql('INSERT INTO migrations (id, run_at) VALUES (?, ?)', [
        migration.id,
        Date.now()
      ]);
    }
  }
};

export default database;
