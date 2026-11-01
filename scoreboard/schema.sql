-- Birdy's Zoomies shared high scores: initials, score and balls only. No names, emails or IP addresses.
CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  initials TEXT NOT NULL CHECK (length(initials) = 3),
  score INTEGER NOT NULL CHECK (score > 0),
  balls INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS scores_rank ON scores (score DESC, id ASC);
