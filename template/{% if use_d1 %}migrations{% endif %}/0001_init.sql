-- Initial schema. Replace the example table with your own; make further
-- changes as new numbered files (0002_*.sql, ...) — never by editing an
-- applied migration. Applied in order by `wrangler d1 migrations apply` and,
-- for tests, by test/apply-migrations.ts.
CREATE TABLE IF NOT EXISTS example (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
