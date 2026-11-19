import type { MatchWatcher } from "./MatchWatcher";

export interface Env {
  DB: D1Database;
  MATCH_WATCHER: DurableObjectNamespace<MatchWatcher>;
  DEFAULT_NTFY_TOPIC?: string;
}

export interface StoredPrefs {
  enabled: boolean;
  remind60Min: boolean;
  remind15Min: boolean;
  branches: {
    Futbol: boolean;
    Basketbol: boolean;
    Voleybol: boolean;
  };
  events: {
    goals: boolean;
    cards: boolean;
    kickoffAndFullTime: boolean;
    lineups: boolean;
    quarterAndSetEnds: boolean;
  };
}

export interface DeviceRecord {
  device_id: string;
  expo_push_token: string | null;
  ntfy_topic: string | null;
  prefs_json: string;
  updated_at: string;
}

export interface FootballSnapshot {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  state: "pre" | "in" | "post";
  homeScore: number;
  awayScore: number;
  clock?: string;
  shortDetail?: string;
  redCardIds?: string[];
  latestGoalScorer?: string;
}

export interface EuroLeagueSnapshot {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  state: "pre" | "in" | "post";
  homeScore: number;
  awayScore: number;
  completedQuarters: number;
  lastQuarterScore?: string;
}

export type WorkerDiffEventType =
  | "kickoff"
  | "halftime"
  | "goal"
  | "var-disallowed"
  | "red-card"
  | "quarter-end"
  | "fulltime";

export interface DiffNotificationEvent {
  eventKey: string;
  type: WorkerDiffEventType;
  matchId: string;
  branch: "Futbol" | "Basketbol";
  title: string;
  message: string;
  tags: string;
}

export interface WatchTargetMeta {
  matchId: string;
  branch: "Futbol" | "Basketbol";
  leagueSlug?: string;
  seasonCode?: string;
}

export interface PredictionRecord {
  id?: number;
  room_code: string;
  device_id: string;
  nickname: string;
  match_id: string;
  home_score: number;
  away_score: number;
  created_at: string;
}

export interface FinishedMatchScore {
  matchId: string;
  homeScore: number;
  awayScore: number;
}

export interface WorkerLeaderboardEntry {
  deviceId: string;
  nickname: string;
  totalPoints: number;
  exactHits: number;
  correctOutcomes: number;
  totalPredictions: number;
  scoredPredictions: number;
}
