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
}
