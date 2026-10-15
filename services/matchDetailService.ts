import { fetchFixtures } from "@/services/fixtureService";
import { Lineup, MatchDetailData, MatchEvent, MatchStat } from "@/types";

// Fenerbahçe'nin standart güncel A Takım 4-2-3-1 formasyon dizilişi (Saha koordinatları ile)
export const fenerbahceDefaultLineup: Lineup = {
  formation: "4-2-3-1",
  coach: "José Mourinho",
  startingXI: [
    {
      id: "p1",
      number: 40,
      name: "Dominik Livaković",
      position: "GK",
      gridPosition: { x: 50, y: 88 },
    },

    {
      id: "p2",
      number: 16,
      name: "Mert Müldür",
      position: "DF",
      gridPosition: { x: 86, y: 68 },
    },
    {
      id: "p3",
      number: 2,
      name: "Alexander Djiku",
      position: "DF",
      gridPosition: { x: 62, y: 72 },
    },
    {
      id: "p4",
      number: 6,
      name: "Alexander Becão",
      position: "DF",
      gridPosition: { x: 38, y: 72 },
    },
    {
      id: "p5",
      number: 24,
      name: "Jayden Oosterwolde",
      position: "DF",
      gridPosition: { x: 14, y: 68 },
    },
    {
      id: "p6",
      number: 34,
      name: "Sofyan Amrabat",
      position: "MF",
      gridPosition: { x: 35, y: 50 },
    },
    {
      id: "p7",
      number: 13,
      name: "Fred",
      position: "MF",
      gridPosition: { x: 65, y: 50 },
    },
    {
      id: "p8",
      number: 17,
      name: "İrfan Can Kahveci",
      position: "MF",
      gridPosition: { x: 84, y: 32 },
    },
    {
      id: "p9",
      number: 53,
      name: "Sebastian Szymański",
      position: "MF",
      gridPosition: { x: 50, y: 32 },
    },
    {
      id: "p10",
      number: 10,
      name: "Dušan Tadić",
      position: "MF",
      gridPosition: { x: 16, y: 32 },
    },
    {
      id: "p11",
      number: 9,
      name: "Edin Džeko",
      position: "FW",
      gridPosition: { x: 50, y: 14 },
    },
  ],
  substitutes: [
    { id: "s1", number: 1, name: "İrfan Can Eğribayat", position: "GK" },
    { id: "s2", number: 4, name: "Çağlar Söyüncü", position: "DF" },
    { id: "s3", number: 5, name: "İsmail Yüksek", position: "MF" },
    { id: "s4", number: 8, name: "Mert Hakan Yandaş", position: "MF" },
    { id: "s5", number: 19, name: "Youssef En-Nesyri", position: "FW" },
    { id: "s6", number: 97, name: "Allan Saint-Maximin", position: "FW" },
    { id: "s7", number: 23, name: "Cenk Tosun", position: "FW" },
  ],
};
export const opponentDefaultLineup: Lineup = {
  formation: "4-3-3",
  coach: "Teknik Direktör",
  startingXI: [
    {
      id: "op1",
      number: 1,
      name: "Kaleci",
      position: "GK",
      gridPosition: { x: 50, y: 88 },
    },
    {
      id: "op2",
      number: 2,
      name: "Sağ Bek",
      position: "DF",
      gridPosition: { x: 85, y: 68 },
    },
    {
      id: "op3",
      number: 4,
      name: "Stoper Sol",
      position: "DF",
      gridPosition: { x: 62, y: 72 },
    },
    {
      id: "op4",
      number: 5,
      name: "Stoper Sağ",
      position: "DF",
      gridPosition: { x: 38, y: 72 },
    },
    {
      id: "op5",
      number: 3,
      name: "Sol Bek",
      position: "DF",
      gridPosition: { x: 15, y: 68 },
    },
    {
      id: "op6",
      number: 6,
      name: "Ön Libero",
      position: "MF",
      gridPosition: { x: 50, y: 52 },
    },
    {
      id: "op7",
      number: 8,
      name: "Merkez Orta",
      position: "MF",
      gridPosition: { x: 70, y: 40 },
    },
    {
      id: "op8",
      number: 10,
      name: "Ofansif Orta",
      position: "MF",
      gridPosition: { x: 30, y: 40 },
    },
    {
      id: "op9",
      number: 7,
      name: "Sağ Kanat",
      position: "FW",
      gridPosition: { x: 82, y: 20 },
    },
    {
      id: "op10",
      number: 11,
      name: "Sol Kanat",
      position: "FW",
      gridPosition: { x: 18, y: 20 },
    },
    {
      id: "op11",
      number: 9,
      name: "Santrafor",
      position: "FW",
      gridPosition: { x: 50, y: 14 },
    },
  ],
  substitutes: [
    { id: "os1", number: 12, name: "Yedek Kaleci", position: "GK" },
    { id: "os2", number: 15, name: "Yedek Defans", position: "DF" },
    { id: "os3", number: 18, name: "Yedek Orta Saha", position: "MF" },
    { id: "os4", number: 20, name: "Yedek Kanat", position: "FW" },
    { id: "os5", number: 99, name: "Yedek Forvet", position: "FW" },
  ],
};

const defaultStats: MatchStat[] = [
  {
    label: "Topla Oynama",
    homeValue: "%58",
    awayValue: "%42",
    homePercentage: 58,
  },
  { label: "Toplam Şut", homeValue: 16, awayValue: 7, homePercentage: 70 },
  { label: "İsabetli Şut", homeValue: 7, awayValue: 2, homePercentage: 78 },
  {
    label: "Pas İsabeti",
    homeValue: "%85",
    awayValue: "%74",
    homePercentage: 53,
  },
  { label: "Korner", homeValue: 8, awayValue: 3, homePercentage: 72 },
  { label: "Faul", homeValue: 10, awayValue: 16, homePercentage: 38 },
  { label: "Sarı Kart", homeValue: 2, awayValue: 3, homePercentage: 40 },
  { label: "Ofsayt", homeValue: 1, awayValue: 2, homePercentage: 33 },
];

const defaultEvents: MatchEvent[] = [
  {
    id: "e1",
    minute: 18,
    type: "yellow-card",
    team: "away",
    player: "Rakip Stoper",
    detail: "Taktik Faul",
  },
  {
    id: "e2",
    minute: 29,
    type: "goal",
    team: "home",
    player: "Edin Džeko",
    detail: "Asist: Dušan Tadić",
  },
  {
    id: "e3",
    minute: 42,
    type: "yellow-card",
    team: "home",
    player: "Sofyan Amrabat",
    detail: "Sert Müdahale",
  },
  {
    id: "e4",
    minute: 58,
    type: "goal",
    team: "home",
    player: "Sebastian Szymański",
    detail: "Ceza sahası dışından",
  },
  {
    id: "e5",
    minute: 67,
    type: "substitution",
    team: "home",
    player: "Youssef En-Nesyri",
    detail: "Çıkan: Edin Džeko",
  },
  {
    id: "e6",
    minute: 76,
    type: "goal",
    team: "away",
    player: "Rakip Forvet",
    detail: "Kafa vuruşu",
  },
  {
    id: "e7",
    minute: 84,
    type: "substitution",
    team: "home",
    player: "İsmail Yüksek",
    detail: "Çıkan: Fred",
  },
  {
    id: "e8",
    minute: 89,
    type: "yellow-card",
    team: "home",
    player: "Alexander Djiku",
    detail: "İtiraz",
  },
];

export const getMatchDetail = async (
  matchId: string,
): Promise<MatchDetailData> => {
  try {
    const fixtures = await fetchFixtures();
    const match = fixtures.find((m) => m.id === matchId);

    const isFbHome = match ? match.homeTeam.includes("Fenerbah") : true;
    const isFinished = match
      ? match.homeScore !== null && match.awayScore !== null
      : true;

    return {
      id: matchId,
      branch: match?.branch || "Futbol",
      competition: match?.competition || "Trendyol Süper Lig",
      round: match?.round || "26. Hafta",
      homeTeam: match?.homeTeam || "Fenerbahçe",
      homeLogo: match?.homeLogo || "fener.png",
      homeScore: match?.homeScore ?? (isFinished ? "2" : null),
      awayTeam: match?.awayTeam || "Rakip Takım",
      awayLogo: match?.awayLogo || "logos/superlig",
      awayScore: match?.awayScore ?? (isFinished ? "1" : null),
      date: match?.date || "18 Ekim 2026, Pazar",
      time: match?.time || "20:00",
      stadium:
        match?.stadium || "Ülker Stadyumu FB Şükrü Saracoğlu Spor Kompleksi",
      status: isFinished ? "finished" : "upcoming",
      referee: "Halil Umut Meler",
      events: isFinished ? defaultEvents : [],
      homeLineup: isFbHome ? fenerbahceDefaultLineup : opponentDefaultLineup,
      awayLineup: isFbHome ? opponentDefaultLineup : fenerbahceDefaultLineup,
      stats: defaultStats,
    };
  } catch (error) {
    console.error("Match detail fetch error:", error);

    return {
      id: matchId,
      branch: "Futbol",
      competition: "Trendyol Süper Lig",
      round: "26. Hafta",
      homeTeam: "Fenerbahçe",
      homeLogo: "fener.png",
      homeScore: "2",
      awayTeam: "Rakip Takım",
      awayLogo: "logos/superlig",
      awayScore: "1",
      date: "18 Ekim 2026, Pazar",
      time: "20:00",
      stadium: "Ülker Stadyumu Şükrü Saracoğlu Spor Kompleksi",
      status: "finished",
      referee: "Halil Umut Meler",
      events: defaultEvents,
      homeLineup: fenerbahceDefaultLineup,
      awayLineup: opponentDefaultLineup,
      stats: defaultStats,
    };
  }
};
