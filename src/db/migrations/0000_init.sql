CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('win', 'loss')),
  category TEXT NOT NULL CHECK (category IN ('slot', 'scommesse', 'poker', 'gratta_e_vinci')),
  note TEXT,
  created_at INTEGER NOT NULL
);
