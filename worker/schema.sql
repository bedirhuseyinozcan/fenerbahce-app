CREATE TABLE IF NOT EXISTS devices (
  device_id TEXT PRIMARY KEY,
  expo_push_token TEXT,
  ntfy_topic TEXT,
  prefs_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS match_events_log (
  event_key TEXT PRIMARY KEY,
  match_id TEXT NOT NULL,
  branch TEXT NOT NULL,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_match_id ON match_events_log(match_id);

CREATE TABLE IF NOT EXISTS predictions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_code TEXT NOT NULL,
  device_id TEXT NOT NULL,
  nickname TEXT NOT NULL,
  match_id TEXT NOT NULL,
  home_score INTEGER NOT NULL,
  away_score INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(room_code, device_id, match_id)
);

CREATE INDEX IF NOT EXISTS idx_predictions_room ON predictions(room_code, match_id);
