import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "./schema";

const DATABASE_NAME = "netto.db";

const expo = SQLite.openDatabaseSync(DATABASE_NAME);
export const db = drizzle(expo, { schema });

export async function initDatabase() {
  await expo.execAsync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount INTEGER NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('win', 'loss')),
      category TEXT NOT NULL CHECK (category IN ('slot', 'scommesse', 'poker', 'gratta_e_vinci')),
      note TEXT,
      created_at INTEGER NOT NULL
    );
  `);
}
