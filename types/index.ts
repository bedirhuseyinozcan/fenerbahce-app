export interface MatchData {
  id: string;
  branch: string;
  competition: string;
  round?: string;
  homeTeam: string;
  homeLogo?: string;
  homeScore?: string | null;
  awayTeam: string;
  awayLogo?: string;
  awayScore?: string | null;
  date: string;
  time: string;
  stadium: string;
  rawDate?: string;
}

export interface NewsData {
  id: string;
  title: string;
  link: string;
  image: string;
  date: string;
  category: string;
}

export interface TeamStanding {
  rank: number;
  teamId: string;
  teamName: string;
  badge: string;
  played: number;
  win: number;
  draw: number;
  loss: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export type EventType =
  | "goal"
  | "yellow-card"
  | "red-card"
  | "substitution"
  | "var"
  | "basket-3pt"
  | "basket-2pt"
  | "timeout"
  | "ace"
  | "block"
  | "spike";

export interface MatchEvent {
  id: string;
  minute: number;
  extraMinute?: number;
  type: EventType;
  team: "home" | "away";
  player: string;
  detail?: string;
  quarterOrSet?: string;
}

export interface Player {
  id: string;
  number: number;
  name: string;
  position: string;
  gridPosition: { x: number; y: number };
  goals?: number;
  assists?: number;
  yellowCards?: number;
  redCards?: number;
}

export interface LineupSubstitute {
  id: string;
  number: number;
  name: string;
  position: string;
  goals?: number;
  assists?: number;
  yellowCards?: number;
  redCards?: number;
}

export interface Lineup {
  formation: string;
  coach: string;
  startingXI: Player[];
  substitutes: LineupSubstitute[];
}

export interface MatchStat {
  label: string;
  homeValue: number | string;
  awayValue: number | string;
  homePercentage: number;
}

export interface MatchDetailData extends MatchData {
  status: "upcoming" | "live" | "finished";
  referee?: string;
  quarterScores?: string[];
  events: MatchEvent[];
  homeLineup: Lineup;
  awayLineup: Lineup;
  stats: MatchStat[];
}

export interface Athlete {
  id: string;
  name: string;
  number: number;
  position: string;
  category: "Kaleci" | "Defans" | "Orta Saha" | "Forvet" | "Gard" | "Forvet/Pivot" | "Smaçör" | "Pasör" | "Orta Oyuncu" | "Libero";
  country?: string;
  branch: "Futbol" | "Basketbol" | "Voleybol";
  image?: string;
}

