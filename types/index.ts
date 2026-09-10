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
