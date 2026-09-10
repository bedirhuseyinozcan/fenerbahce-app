import { TeamStanding } from '@/types';

export const mockStandings: TeamStanding[] = [
  { rank: 1, teamId: "1", teamName: "Galatasaray", badge: "https://res.cloudinary.com/z1hvtpqh/image/upload/v1789046288/gs.png", played: 4, win: 3, draw: 1, loss: 0, goalsFor: 12, goalsAgainst: 6, goalDifference: 6, points: 10 },
  { rank: 2, teamId: "2", teamName: "Beşiktaş", badge: "https://res.cloudinary.com/z1hvtpqh/image/upload/v1789046288/bjk.png", played: 4, win: 3, draw: 0, loss: 1, goalsFor: 9, goalsAgainst: 4, goalDifference: 5, points: 9 },
  { rank: 3, teamId: "3", teamName: "Kocaelispor", badge: "https://res.cloudinary.com/z1hvtpqh/image/upload/v1789046202/kocaeli.png", played: 4, win: 3, draw: 0, loss: 1, goalsFor: 5, goalsAgainst: 3, goalDifference: 2, points: 9 },
  { rank: 4, teamId: "4", teamName: "Trabzonspor", badge: "https://res.cloudinary.com/z1hvtpqh/image/upload/v1789046288/ts.png", played: 4, win: 2, draw: 1, loss: 1, goalsFor: 9, goalsAgainst: 4, goalDifference: 5, points: 7 },
  { rank: 5, teamId: "5", teamName: "Amed SK", badge: "https://res.cloudinary.com/z1hvtpqh/image/upload/v1789046205/amed_badge.png", played: 4, win: 2, draw: 1, loss: 1, goalsFor: 7, goalsAgainst: 5, goalDifference: 2, points: 7 },
  { rank: 6, teamId: "6", teamName: "Gaziantep FK", badge: "https://res.cloudinary.com/z1hvtpqh/image/upload/v1789046505/antep.png", played: 4, win: 2, draw: 1, loss: 1, goalsFor: 7, goalsAgainst: 5, goalDifference: 2, points: 7 },
  { rank: 7, teamId: "7", teamName: "Alanyaspor", badge: "https://res.cloudinary.com/z1hvtpqh/image/upload/v1789046505/Alanyaspor_logo.png", played: 4, win: 2, draw: 1, loss: 1, goalsFor: 4, goalsAgainst: 3, goalDifference: 1, points: 7 },
  { rank: 8, teamId: "8", teamName: "Gençlerbirliği", badge: "https://res.cloudinary.com/z1hvtpqh/image/upload/v1789046506/Genclerbirligi.png", played: 4, win: 2, draw: 1, loss: 1, goalsFor: 4, goalsAgainst: 7, goalDifference: -3, points: 7 },
  { rank: 9, teamId: "133807", teamName: "Fenerbahçe", badge: "https://res.cloudinary.com/z1hvtpqh/image/upload/v1789046288/fener.png", played: 4, win: 2, draw: 0, loss: 2, goalsFor: 8, goalsAgainst: 6, goalDifference: 2, points: 6 },
  { rank: 10, teamId: "10", teamName: "Kasımpaşa", badge: "https://res.cloudinary.com/z1hvtpqh/image/upload/v1789046406/pasa.png", played: 4, win: 1, draw: 3, loss: 0, goalsFor: 5, goalsAgainst: 4, goalDifference: 1, points: 6 },
  { rank: 11, teamId: "11", teamName: "Rizespor", badge: "https://res.cloudinary.com/z1hvtpqh/image/upload/v1789046506/rize.png", played: 4, win: 2, draw: 0, loss: 2, goalsFor: 3, goalsAgainst: 4, goalDifference: -1, points: 6 },
  { rank: 12, teamId: "12", teamName: "Başakşehir FK", badge: "https://res.cloudinary.com/z1hvtpqh/image/upload/v1789046406/%C4%B0stanbul_Ba%C5%9Fak%C5%9Fehir_FK.png", played: 4, win: 1, draw: 1, loss: 2, goalsFor: 6, goalsAgainst: 6, goalDifference: 0, points: 4 },
  { rank: 13, teamId: "13", teamName: "Samsunspor", badge: "https://res.cloudinary.com/z1hvtpqh/image/upload/v1789046406/samsun.png", played: 4, win: 1, draw: 1, loss: 2, goalsFor: 5, goalsAgainst: 6, goalDifference: -1, points: 4 },
  { rank: 14, teamId: "14", teamName: "Çorum FK", badge: "https://res.cloudinary.com/z1hvtpqh/image/upload/v1789046405/%C3%87orum_FK.png", played: 4, win: 1, draw: 1, loss: 2, goalsFor: 7, goalsAgainst: 9, goalDifference: -2, points: 4 },
  { rank: 15, teamId: "15", teamName: "Erzurumspor", badge: "https://res.cloudinary.com/z1hvtpqh/image/upload/v1789046405/erzurum.png", played: 4, win: 1, draw: 1, loss: 2, goalsFor: 2, goalsAgainst: 8, goalDifference: -6, points: 4 },
  { rank: 16, teamId: "16", teamName: "Eyüpspor", badge: "https://res.cloudinary.com/z1hvtpqh/image/upload/v1789046406/ey%C3%BCp.png", played: 4, win: 1, draw: 0, loss: 3, goalsFor: 2, goalsAgainst: 6, goalDifference: -4, points: 3 },
  { rank: 17, teamId: "17", teamName: "Göztepe", badge: "https://res.cloudinary.com/z1hvtpqh/image/upload/v1789046406/g%C3%B6ztepe.png", played: 4, win: 0, draw: 1, loss: 3, goalsFor: 7, goalsAgainst: 11, goalDifference: -4, points: 1 },
  { rank: 18, teamId: "18", teamName: "Konyaspor", badge: "https://res.cloudinary.com/z1hvtpqh/image/upload/v1789046202/konya_badge.png", played: 4, win: 0, draw: 0, loss: 4, goalsFor: 3, goalsAgainst: 8, goalDifference: -5, points: 0 }
];
