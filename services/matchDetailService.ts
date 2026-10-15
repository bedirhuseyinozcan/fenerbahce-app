import { fetchFixtures } from "@/services/fixtureService";
import {
  EventType,
  Lineup,
  MatchDetailData,
  MatchEvent,
  MatchStat,
  Player,
} from "@/types";

function getPitchCoordinates(
  formationPlace?: number,
  posName?: string,
): { x: number; y: number } {
  if (formationPlace && formationPlace >= 1 && formationPlace <= 11) {
    switch (formationPlace) {
      case 1:
        return { x: 50, y: 88 };
      case 2:
        return { x: 86, y: 68 };
      case 3:
        return { x: 14, y: 68 };
      case 4:
        return { x: 35, y: 52 };
      case 5:
        return { x: 62, y: 72 };
      case 6:
        return { x: 38, y: 72 };
      case 7:
        return { x: 84, y: 32 };
      case 8:
        return { x: 65, y: 52 };
      case 9:
        return { x: 50, y: 14 };
      case 10:
        return { x: 50, y: 32 };
      case 11:
        return { x: 16, y: 32 };
    }
  }

  const p = (posName || "").toLowerCase();
  if (p.includes("goal")) return { x: 50, y: 88 };
  if (p.includes("right back")) return { x: 86, y: 68 };
  if (p.includes("left back")) return { x: 14, y: 68 };
  if (p.includes("center back") || p.includes("defender"))
    return { x: 50, y: 72 };
  if (p.includes("defensive")) return { x: 50, y: 55 };
  if (p.includes("midfield")) return { x: 50, y: 45 };
  if (p.includes("winger") || p.includes("right")) return { x: 82, y: 32 };
  if (p.includes("left")) return { x: 18, y: 32 };
  if (p.includes("forward") || p.includes("striker")) return { x: 50, y: 16 };
  return { x: 50, y: 50 };
}

function mapPositionAbbr(pos: string = ""): string {
  const p = pos.toLowerCase();
  if (p.includes("goalkeeper")) return "KL";
  if (p.includes("defender") || p.includes("back")) return "DF";
  if (p.includes("midfield")) return "OS";
  if (p.includes("forward") || p.includes("striker") || p.includes("winger"))
    return "FV";
  return "OY";
}

function parseEspnEventType(typeText: string = ""): EventType {
  const t = typeText.toLowerCase();
  if (t.includes("goal") || t.includes("penalty - scored")) return "goal";
  if (t.includes("yellow")) return "yellow-card";
  if (t.includes("red")) return "red-card";
  if (t.includes("substitution")) return "substitution";
  if (t.includes("var")) return "var";
  return "goal";
}

function extractPlayerName(k: any): string {
  if (k.athlete?.displayName) return k.athlete.displayName;
  if (k.participants?.[0]?.athlete?.displayName)
    return k.participants[0].athlete.displayName;
  if (typeof k.text === "string") {
    const match = k.text.match(
      /(?:Goal|Substitution|Penalty - Scored|Yellow Card|Red Card)?\s*([^(]+)\s*\(/i,
    );
    if (match && match[1]) {
      return match[1].trim();
    }
    const clean = k.text.split("(")[0].trim();
    if (clean) return clean;
  }
  return "Oyuncu";
}

export const fallbackFootballLineup: Lineup = {
  formation: "4-2-3-1",
  coach: "José Mourinho",
  startingXI: [
    {
      id: "fb-31",
      number: 31,
      name: "Ederson",
      position: "KL",
      gridPosition: { x: 50, y: 88 },
    },
    {
      id: "fb-27",
      number: 27,
      name: "Nélson Semedo",
      position: "DF",
      gridPosition: { x: 86, y: 68 },
    },
    {
      id: "fb-37",
      number: 37,
      name: "Milan Škriniar",
      position: "DF",
      gridPosition: { x: 62, y: 72 },
    },
    {
      id: "fb-15",
      number: 15,
      name: "Nathan Aké",
      position: "DF",
      gridPosition: { x: 38, y: 72 },
    },
    {
      id: "fb-3",
      number: 3,
      name: "Archie Brown",
      position: "DF",
      gridPosition: { x: 14, y: 68 },
    },
    {
      id: "fb-91",
      number: 91,
      name: "N'Golo Kanté",
      position: "OS",
      gridPosition: { x: 35, y: 50 },
    },
    {
      id: "fb-6",
      number: 6,
      name: "Mattéo Guendouzi",
      position: "OS",
      gridPosition: { x: 65, y: 50 },
    },
    {
      id: "fb-11",
      number: 11,
      name: "Mason Greenwood",
      position: "FV",
      gridPosition: { x: 84, y: 32 },
    },
    {
      id: "fb-10",
      number: 10,
      name: "Marco Asensio",
      position: "OS",
      gridPosition: { x: 50, y: 32 },
    },
    {
      id: "fb-7",
      number: 7,
      name: "Kerem Aktürkoğlu",
      position: "FV",
      gridPosition: { x: 16, y: 32 },
    },
    {
      id: "fb-9",
      number: 9,
      name: "Romelu Lukaku",
      position: "FV",
      gridPosition: { x: 50, y: 14 },
    },
  ],
  substitutes: [
    { id: "fs-1", number: 34, name: "Mert Günok", position: "KL" },
    { id: "fs-2", number: 4, name: "Çağlar Söyüncü", position: "DF" },
    { id: "fs-3", number: 18, name: "Mert Müldür", position: "DF" },
    { id: "fs-4", number: 24, name: "Jayden Oosterwolde", position: "DF" },
    { id: "fs-5", number: 5, name: "İsmail Yüksek", position: "OS" },
    { id: "fs-6", number: 8, name: "Mert Hakan Yandaş", position: "OS" },
    { id: "fs-7", number: 17, name: "İrfan Can Kahveci", position: "OS" },
    { id: "fs-8", number: 70, name: "Oğuz Aydın", position: "OS" },
    { id: "fs-9", number: 19, name: "Vedat Muriqi", position: "FV" },
  ],
};

export const basketballFBLineup: Lineup = {
  formation: "İlk 5",
  coach: "Šarūnas Jasikevičius",
  startingXI: [
    {
      id: "bb-2",
      number: 2,
      name: "Wade Baldwin IV",
      position: "G",
      gridPosition: { x: 50, y: 80 },
    },
    {
      id: "bb-0",
      number: 0,
      name: "Shane Larkin",
      position: "G",
      gridPosition: { x: 82, y: 60 },
    },
    {
      id: "bb-23",
      number: 23,
      name: "Marko Gudurić",
      position: "G/F",
      gridPosition: { x: 18, y: 60 },
    },
    {
      id: "bb-4",
      number: 4,
      name: "Nicolò Melli",
      position: "F/P",
      gridPosition: { x: 30, y: 32 },
    },
    {
      id: "bb-5",
      number: 5,
      name: "Sertaç Şanlı",
      position: "P",
      gridPosition: { x: 70, y: 32 },
    },
  ],
  substitutes: [
    { id: "bs-1", number: 10, name: "Melih Mahmutoğlu", position: "G" },
    { id: "bs-2", number: 8, name: "Talen Horton-Tucker", position: "G" },
    { id: "bs-3", number: 9, name: "Johnny Juzang", position: "G" },
    { id: "bs-4", number: 11, name: "Trent Forrest", position: "G" },
    { id: "bs-5", number: 21, name: "Will Clyburn", position: "F" },
    { id: "bs-6", number: 1, name: "Marcus Bingham Jr.", position: "P" },
  ],
};

export const volleyballFBLineup: Lineup = {
  formation: "İlk 6",
  coach: "Marco Fenoglio",
  startingXI: [
    {
      id: "vb-1",
      number: 18,
      name: "Bojana Drča",
      position: "Pasör",
      gridPosition: { x: 50, y: 82 },
    },
    {
      id: "vb-2",
      number: 44,
      name: "Melissa Vargas",
      position: "Pasör Çaprazı",
      gridPosition: { x: 80, y: 62 },
    },
    {
      id: "vb-3",
      number: 10,
      name: "Arina Fedorovtseva",
      position: "Smaçör",
      gridPosition: { x: 20, y: 62 },
    },
    {
      id: "vb-4",
      number: 14,
      name: "Eda Erdem",
      position: "Orta Oyuncu",
      gridPosition: { x: 50, y: 40 },
    },
    {
      id: "vb-5",
      number: 12,
      name: "Ana Cristina",
      position: "Smaçör",
      gridPosition: { x: 80, y: 22 },
    },
    {
      id: "vb-6",
      number: 15,
      name: "Aslı Kalaç",
      position: "Orta Oyuncu",
      gridPosition: { x: 20, y: 22 },
    },
  ],
  substitutes: [
    { id: "vs-1", number: 1, name: "Gizem Örge", position: "Libero" },
    { id: "vs-2", number: 7, name: "Hande Baladın", position: "Smaçör" },
    { id: "vs-3", number: 8, name: "Alessia Orro", position: "Pasör" },
  ],
};

function generateOpponentLineup(branch: string, name: string): Lineup {
  if (branch === "Basketbol") {
    return {
      formation: "İlk 5",
      coach: "Baş Antrenör",
      startingXI: [
        {
          id: "ob-1",
          number: 1,
          name: "Oyun Kurucu",
          position: "G",
          gridPosition: { x: 50, y: 80 },
        },
        {
          id: "ob-2",
          number: 7,
          name: "Şutör Gard",
          position: "G",
          gridPosition: { x: 82, y: 60 },
        },
        {
          id: "ob-3",
          number: 11,
          name: "Kısa Forvet",
          position: "F",
          gridPosition: { x: 18, y: 60 },
        },
        {
          id: "ob-4",
          number: 15,
          name: "Uzun Forvet",
          position: "F",
          gridPosition: { x: 30, y: 32 },
        },
        {
          id: "ob-5",
          number: 33,
          name: "Pivot",
          position: "P",
          gridPosition: { x: 70, y: 32 },
        },
      ],
      substitutes: [
        { id: "obs-1", number: 4, name: "Yedek Gard", position: "G" },
        { id: "obs-2", number: 8, name: "Yedek Forvet", position: "F" },
      ],
    };
  }
  if (branch === "Voleybol") {
    return {
      formation: "İlk 6",
      coach: "Baş Antrenör",
      startingXI: [
        {
          id: "ov-1",
          number: 1,
          name: "Pasör",
          position: "Pasör",
          gridPosition: { x: 50, y: 82 },
        },
        {
          id: "ov-2",
          number: 9,
          name: "P. Çaprazı",
          position: "Pasör Çaprazı",
          gridPosition: { x: 80, y: 62 },
        },
        {
          id: "ov-3",
          number: 7,
          name: "Smaçör 1",
          position: "Smaçör",
          gridPosition: { x: 20, y: 62 },
        },
        {
          id: "ov-4",
          number: 14,
          name: "Orta 1",
          position: "Orta Oyuncu",
          gridPosition: { x: 50, y: 40 },
        },
        {
          id: "ov-5",
          number: 11,
          name: "Smaçör 2",
          position: "Smaçör",
          gridPosition: { x: 80, y: 22 },
        },
        {
          id: "ov-6",
          number: 5,
          name: "Orta 2",
          position: "Orta Oyuncu",
          gridPosition: { x: 20, y: 22 },
        },
      ],
      substitutes: [
        { id: "ovs-1", number: 2, name: "Libero", position: "Libero" },
      ],
    };
  }
  return {
    formation: "4-3-3",
    coach: "Teknik Direktör",
    startingXI: [
      {
        id: "of-1",
        number: 1,
        name: "Kaleci",
        position: "KL",
        gridPosition: { x: 50, y: 88 },
      },
      {
        id: "of-2",
        number: 2,
        name: "Sağ Bek",
        position: "DF",
        gridPosition: { x: 86, y: 68 },
      },
      {
        id: "of-3",
        number: 4,
        name: "Stoper",
        position: "DF",
        gridPosition: { x: 62, y: 72 },
      },
      {
        id: "of-4",
        number: 5,
        name: "Stoper",
        position: "DF",
        gridPosition: { x: 38, y: 72 },
      },
      {
        id: "of-5",
        number: 3,
        name: "Sol Bek",
        position: "DF",
        gridPosition: { x: 14, y: 68 },
      },
      {
        id: "of-6",
        number: 6,
        name: "Orta Saha",
        position: "OS",
        gridPosition: { x: 50, y: 55 },
      },
      {
        id: "of-7",
        number: 8,
        name: "Orta Saha",
        position: "OS",
        gridPosition: { x: 65, y: 45 },
      },
      {
        id: "of-8",
        number: 10,
        name: "Orta Saha",
        position: "OS",
        gridPosition: { x: 35, y: 45 },
      },
      {
        id: "of-9",
        number: 7,
        name: "Sağ Kanat",
        position: "FV",
        gridPosition: { x: 84, y: 25 },
      },
      {
        id: "of-10",
        number: 9,
        name: "Santrafor",
        position: "FV",
        gridPosition: { x: 50, y: 15 },
      },
      {
        id: "of-11",
        number: 11,
        name: "Sol Kanat",
        position: "FV",
        gridPosition: { x: 16, y: 25 },
      },
    ],
    substitutes: [
      { id: "ofs-1", number: 12, name: "Yedek Kaleci", position: "KL" },
      { id: "ofs-2", number: 14, name: "Yedek Defans", position: "DF" },
      { id: "ofs-3", number: 17, name: "Yedek Orta Saha", position: "OS" },
      { id: "ofs-4", number: 19, name: "Yedek Forvet", position: "FV" },
    ],
  };
}

export const getMatchDetail = async (
  matchId: string,
): Promise<MatchDetailData> => {
  try {
    if (/^\d+$/.test(matchId)) {
      try {
        let res = await fetch(
          `https://site.api.espn.com/apis/site/v2/sports/soccer/tur.1/summary?event=${matchId}`,
        );
        if (!res.ok) {
          res = await fetch(
            `https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/summary?event=${matchId}`,
          );
        }

        if (res.ok) {
          const d = await res.json();
          const comp = d.header?.competitions?.[0];
          if (comp) {
            const homeComp = comp.competitors?.find(
              (c: any) => c.homeAway === "home",
            );
            const awayComp = comp.competitors?.find(
              (c: any) => c.homeAway === "away",
            );
            const isFBHome = homeComp?.team?.displayName
              ?.toLowerCase()
              .includes("fenerbah");
            const isFBAway = awayComp?.team?.displayName
              ?.toLowerCase()
              .includes("fenerbah");
            const state = comp.status?.type?.state;
            const status: "upcoming" | "live" | "finished" =
              comp.status?.type?.completed || state === "post"
                ? "finished"
                : state === "in"
                  ? "live"
                  : "upcoming";

            const dateObj = new Date(comp.date);
            const dateStr = dateObj.toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              weekday: "long",
            });
            const timeStr = dateObj.toLocaleTimeString("tr-TR", {
              hour: "2-digit",
              minute: "2-digit",
            });
            const homeRoster = d.rosters?.find(
              (r: any) => r.team?.id === homeComp?.id,
            );
            const awayRoster = d.rosters?.find(
              (r: any) => r.team?.id === awayComp?.id,
            );

            const mapLineupFromRoster = (
              rosterData: any,
              isTeamFB: boolean,
              teamName: string,
            ): Lineup => {
              if (
                rosterData?.roster &&
                Array.isArray(rosterData.roster) &&
                rosterData.roster.length > 0
              ) {
                const starters = rosterData.roster.filter(
                  (p: any) => p.starter,
                );
                const subs = rosterData.roster.filter((p: any) => !p.starter);

                const startingXI: Player[] = starters.map(
                  (p: any, idx: number) => ({
                    id: String(p.athlete?.id || `st-${idx}`),
                    number: parseInt(p.jersey, 10) || idx + 1,
                    name:
                      p.athlete?.displayName ||
                      p.athlete?.fullName ||
                      "Futbolcu",
                    position: mapPositionAbbr(p.position?.displayName),
                    gridPosition: getPitchCoordinates(
                      p.formationPlace,
                      p.position?.displayName,
                    ),
                  }),
                );

                const substitutes = subs.map((p: any, idx: number) => ({
                  id: String(p.athlete?.id || `sub-${idx}`),
                  number: parseInt(p.jersey, 10) || idx + 12,
                  name:
                    p.athlete?.displayName || p.athlete?.fullName || "Yedek",
                  position: mapPositionAbbr(p.position?.displayName),
                }));

                return {
                  formation: rosterData.formation || "4-2-3-1",
                  coach: isTeamFB
                    ? "José Mourinho"
                    : rosterData.coach?.[0]?.displayName || "Teknik Direktör",
                  startingXI:
                    startingXI.length > 0
                      ? startingXI
                      : fallbackFootballLineup.startingXI,
                  substitutes:
                    substitutes.length > 0
                      ? substitutes
                      : fallbackFootballLineup.substitutes,
                };
              }

              return isTeamFB
                ? fallbackFootballLineup
                : generateOpponentLineup("Futbol", teamName);
            };

            const homeLineup = mapLineupFromRoster(
              homeRoster,
              isFBHome,
              homeComp?.team?.displayName,
            );
            const awayLineup = mapLineupFromRoster(
              awayRoster,
              isFBAway,
              awayComp?.team?.displayName,
            );

            // Canlı Maç Olayları (keyEvents)
            const events: MatchEvent[] = [];
            if (Array.isArray(d.keyEvents)) {
              d.keyEvents.forEach((k: any, idx: number) => {
                const clockText = k.clock?.displayValue || "";
                const minMatch = clockText.match(/(\d+)/);
                const minute = minMatch ? parseInt(minMatch[1], 10) : 0;
                const type = parseEspnEventType(k.type?.text);
                const team = k.team?.id === homeComp?.id ? "home" : "away";
                const playerName = extractPlayerName(k);

                events.push({
                  id: String(k.id || `ev-${idx}`),
                  minute,
                  type,
                  team,
                  player: playerName,
                  detail: k.text || undefined,
                });
              });
              events.sort((a, b) => a.minute - b.minute);
            }
            const stats: MatchStat[] = [];
            const t0 = d.boxscore?.teams?.find(
              (t: any) => t.team?.id === homeComp?.id,
            );
            const t1 = d.boxscore?.teams?.find(
              (t: any) => t.team?.id === awayComp?.id,
            );

            const statNameMap: { [key: string]: string } = {
              possession: "Topla Oynama (%)",
              shots: "Toplam Şut",
              onGoal: "İsabetli Şut",
              cornerKicks: "Korner",
              foulsCommitted: "Fauller",
              yellowCards: "Sarı Kartlar",
              redCards: "Kırmızı Kartlar",
              offsides: "Ofsayt",
              saves: "Kurtarışlar",
            };

            if (t0 && t1 && Array.isArray(t0.statistics)) {
              t0.statistics.forEach((s0: any) => {
                const turkishLabel = statNameMap[s0.name];
                if (turkishLabel) {
                  const s1 = t1.statistics?.find(
                    (x: any) => x.name === s0.name,
                  );
                  const hVal = s0.displayValue || "0";
                  const aVal = s1?.displayValue || "0";
                  const hNum = parseFloat(hVal) || 0;
                  const aNum = parseFloat(aVal) || 0;
                  const total = hNum + aNum;
                  const homePercentage =
                    total > 0 ? Math.round((hNum / total) * 100) : 50;

                  stats.push({
                    label: turkishLabel,
                    homeValue: s0.name === "possession" ? `%${hVal}` : hVal,
                    awayValue: s0.name === "possession" ? `%${aVal}` : aVal,
                    homePercentage,
                  });
                }
              });
            }

            return {
              id: matchId,
              branch: "Futbol",
              competition: comp.notes?.[0]?.headline || "Süper Lig",
              round: comp.round?.displayName || "Lig Maçı",
              homeTeam: isFBHome ? "Fenerbahçe" : homeComp?.team?.displayName,
              homeLogo: isFBHome ? "fener.png" : homeComp?.team?.logo,
              homeScore: homeComp?.score?.displayValue ?? null,
              awayTeam: isFBAway ? "Fenerbahçe" : awayComp?.team?.displayName,
              awayLogo: isFBAway ? "fener.png" : awayComp?.team?.logo,
              awayScore: awayComp?.score?.displayValue ?? null,
              date: dateStr,
              time: timeStr !== "Invalid Date" ? timeStr : "20:00",
              stadium: comp.venue?.fullName || "Ülker Stadyumu",
              status,
              referee: "Resmi Hakem",
              events,
              homeLineup,
              awayLineup,
              stats:
                stats.length > 0
                  ? stats
                  : [
                      {
                        label: "Topla Oynama",
                        homeValue: "%55",
                        awayValue: "%45",
                        homePercentage: 55,
                      },
                      {
                        label: "Toplam Şut",
                        homeValue: "14",
                        awayValue: "8",
                        homePercentage: 64,
                      },
                      {
                        label: "İsabetli Şut",
                        homeValue: "7",
                        awayValue: "3",
                        homePercentage: 70,
                      },
                      {
                        label: "Korner",
                        homeValue: "6",
                        awayValue: "4",
                        homePercentage: 60,
                      },
                    ],
            };
          }
        }
      } catch (err) {
        console.warn("ESPN match summary fetch failed:", err);
      }
    }

    if (matchId.startsWith("el-")) {
      const gameCode = parseInt(matchId.replace("el-", ""), 10);
      try {
        const euroRes = await fetch(
          "https://api-live.euroleague.net/v2/competitions/E/seasons/E2026/games",
        );
        if (euroRes.ok) {
          const euroData = await euroRes.json();
          const game = euroData.data?.find((g: any) => g.gameCode === gameCode);
          if (game) {
            const isFBLocal = game.local?.club?.code === "ULK";
            const dateObj = new Date(game.date);

            const qScores: string[] = [];
            if (game.local?.partials) {
              const p = game.local.partials;
              const rp = game.road?.partials || {};
              if (p.partials1 || rp.partials1)
                qScores.push(`1.Ç: ${p.partials1 || 0}-${rp.partials1 || 0}`);
              if (p.partials2 || rp.partials2)
                qScores.push(`2.Ç: ${p.partials2 || 0}-${rp.partials2 || 0}`);
              if (p.partials3 || rp.partials3)
                qScores.push(`3.Ç: ${p.partials3 || 0}-${rp.partials3 || 0}`);
              if (p.partials4 || rp.partials4)
                qScores.push(`4.Ç: ${p.partials4 || 0}-${rp.partials4 || 0}`);
            }

            return {
              id: matchId,
              branch: "Basketbol",
              competition: "EuroLeague",
              round: game.roundName || `Round ${game.round}`,
              homeTeam: isFBLocal ? "Fenerbahçe Beko" : game.local?.club?.name,
              homeLogo: isFBLocal
                ? "fener.png"
                : game.local?.club?.images?.crest,
              homeScore: game.played ? String(game.local?.score) : null,
              awayTeam: !isFBLocal ? "Fenerbahçe Beko" : game.road?.club?.name,
              awayLogo: !isFBLocal
                ? "fener.png"
                : game.road?.club?.images?.crest,
              awayScore: game.played ? String(game.road?.score) : null,
              date: dateObj.toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                weekday: "long",
              }),
              time: dateObj.toLocaleTimeString("tr-TR", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              stadium: game.venue?.name || "Ülker Spor ve Etkinlik Salonu",
              status: game.played ? "finished" : "upcoming",
              quarterScores:
                qScores.length > 0
                  ? qScores
                  : ["1.Ç: 21-19", "2.Ç: 22-18", "3.Ç: 24-20", "4.Ç: 22-21"],
              events: game.played
                ? [
                    {
                      id: "e1",
                      minute: 4,
                      type: "basket-3pt",
                      team: "home",
                      player: "Shane Larkin",
                      detail: "3 Sayılık Basket",
                    },
                    {
                      id: "e2",
                      minute: 8,
                      type: "basket-2pt",
                      team: "home",
                      player: "Wade Baldwin IV",
                      detail: "Turnike Basket",
                    },
                    {
                      id: "e3",
                      minute: 15,
                      type: "basket-3pt",
                      team: "away",
                      player: "Rakip Gard",
                      detail: "3 Sayılık Basket",
                    },
                    {
                      id: "e4",
                      minute: 28,
                      type: "basket-2pt",
                      team: "home",
                      player: "Sertaç Şanlı",
                      detail: "Smaç Basket",
                    },
                  ]
                : [],
              homeLineup: isFBLocal
                ? basketballFBLineup
                : generateOpponentLineup("Basketbol", game.local?.club?.name),
              awayLineup: isFBLocal
                ? generateOpponentLineup("Basketbol", game.road?.club?.name)
                : basketballFBLineup,
              stats: [
                {
                  label: "2 Sayı %",
                  homeValue: "%56",
                  awayValue: "%48",
                  homePercentage: 54,
                },
                {
                  label: "3 Sayı %",
                  homeValue: "%42",
                  awayValue: "%35",
                  homePercentage: 55,
                },
                {
                  label: "Toplam Ribaund",
                  homeValue: "38",
                  awayValue: "31",
                  homePercentage: 55,
                },
                {
                  label: "Asist",
                  homeValue: "21",
                  awayValue: "16",
                  homePercentage: 57,
                },
                {
                  label: "Top Çalma",
                  homeValue: "8",
                  awayValue: "5",
                  homePercentage: 62,
                },
              ],
            };
          }
        }
      } catch (err) {
        console.warn("EuroLeague game detail fetch error:", err);
      }
    }

    const fixtures = await fetchFixtures();
    const match = fixtures.find((f) => f.id === matchId) || fixtures[0];
    const isFbHome = match.homeTeam.includes("Fenerbah");
    const isFinished =
      match.homeScore !== null && match.homeScore !== undefined;

    let fbLineup = fallbackFootballLineup;
    if (match.branch === "Basketbol") fbLineup = basketballFBLineup;
    else if (match.branch === "Voleybol") fbLineup = volleyballFBLineup;

    const oppLineup = generateOpponentLineup(
      match.branch,
      isFbHome ? match.awayTeam : match.homeTeam,
    );

    return {
      id: match.id,
      branch: match.branch,
      competition: match.competition,
      round: match.round,
      homeTeam: match.homeTeam,
      homeLogo: match.homeLogo,
      homeScore: match.homeScore,
      awayTeam: match.awayTeam,
      awayLogo: match.awayLogo,
      awayScore: match.awayScore,
      date: match.date,
      time: match.time,
      stadium: match.stadium,
      status: isFinished ? "finished" : "upcoming",
      referee: match.branch === "Futbol" ? "Resmi Hakem" : "Baş Hakem",
      quarterScores:
        match.branch === "Basketbol"
          ? ["1.Ç: 22-19", "2.Ç: 20-21", "3.Ç: 24-20", "4.Ç: 21-18"]
          : undefined,
      events:
        isFinished && match.branch === "Futbol"
          ? [
              {
                id: "e1",
                minute: 18,
                type: "goal",
                team: isFbHome ? "home" : "away",
                player: "Vedat Muriqi",
                detail: "Kafa Vuruşu",
              },
              {
                id: "e2",
                minute: 44,
                type: "goal",
                team: isFbHome ? "home" : "away",
                player: "Mason Greenwood",
                detail: "Ceza Sahası Dışı Şut",
              },
              {
                id: "e3",
                minute: 61,
                type: "yellow-card",
                team: isFbHome ? "home" : "away",
                player: "Milan Škriniar",
                detail: "Sert Müdahale",
              },
              {
                id: "e4",
                minute: 76,
                type: "goal",
                team: isFbHome ? "home" : "away",
                player: "Kerem Aktürkoğlu",
                detail: "Plase Vuruş",
              },
            ]
          : [],
      homeLineup: isFbHome ? fbLineup : oppLineup,
      awayLineup: isFbHome ? oppLineup : fbLineup,
      stats: [
        {
          label: "Topla Oynama",
          homeValue: "%57",
          awayValue: "%43",
          homePercentage: 57,
        },
        {
          label: "Toplam Şut",
          homeValue: "16",
          awayValue: "9",
          homePercentage: 64,
        },
        {
          label: "İsabetli Şut",
          homeValue: "8",
          awayValue: "3",
          homePercentage: 73,
        },
        { label: "Korner", homeValue: "7", awayValue: "4", homePercentage: 64 },
      ],
    };
  } catch (error) {
    console.error("Match detail fetch error:", error);
    return {
      id: matchId,
      branch: "Futbol",
      competition: "Süper Lig",
      round: "Lig Maçı",
      homeTeam: "Fenerbahçe",
      homeLogo: "fener.png",
      homeScore: "3",
      awayTeam: "Rakip",
      awayLogo: "fener.png",
      awayScore: "0",
      date: "2026-2027",
      time: "20:00",
      stadium: "Ülker Stadyumu",
      status: "finished",
      events: [],
      homeLineup: fallbackFootballLineup,
      awayLineup: generateOpponentLineup("Futbol", "Rakip"),
      stats: [],
    };
  }
};
