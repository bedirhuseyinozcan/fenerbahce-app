import { MatchData } from "@/types";
export const fallbackCuratedFixtures: MatchData[] = [
  {
    id: "fb-live-1",
    branch: "Futbol",
    competition: "UEFA Şampiyonlar Ligi",
    round: "Lig Aşaması",
    homeTeam: "Fenerbahçe",
    homeLogo: "fener.png",
    homeScore: "1",
    awayTeam: "AS Roma",
    awayLogo:
      "https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/104.png",
    awayScore: "1",
    date: "10 Eylül 2026, Perşembe",
    time: "19:45",
    stadium: "Ülker Stadyumu Şükrü Saracoğlu Spor Kompleksi",
  },
  {
    id: "fb-live-2",
    branch: "Futbol",
    competition: "Süper Lig",
    round: "8. Hafta",
    homeTeam: "Çaykur Rizespor",
    homeLogo:
      "https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/7656.png",
    homeScore: "0",
    awayTeam: "Fenerbahçe",
    awayLogo: "fener.png",
    awayScore: "3",
    date: "10 Ekim 2026, Cumartesi",
    time: "19:00",
    stadium: "Çaykur Didi Stadyumu",
  },
  {
    id: "fb-live-3",
    branch: "Futbol",
    competition: "Süper Lig",
    round: "7. Hafta",
    homeTeam: "Fenerbahçe",
    homeLogo: "fener.png",
    homeScore: "8",
    awayTeam: "Eyüpspor",
    awayLogo:
      "https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/19827.png",
    awayScore: "0",
    date: "20 Eylül 2026, Pazar",
    time: "17:00",
    stadium: "Ülker Stadyumu Şükrü Saracoğlu Spor Kompleksi",
  },
  {
    id: "el-live-1",
    branch: "Basketbol",
    competition: "EuroLeague",
    round: "Round 1",
    homeTeam: "Fenerbahçe Beko",
    homeLogo: "fener.png",
    homeScore: "82",
    awayTeam: "Olympiacos Piraeus",
    awayLogo:
      "https://media-cdn.incrowdsports.com/2681304e-77dd-4331-88b1-683078c0fb49.png",
    awayScore: "71",
    date: "4 Ekim 2026, Cuma",
    time: "20:30",
    stadium: "Ülker Spor ve Etkinlik Salonu",
  },
  {
    id: "vb-live-1",
    branch: "Voleybol",
    competition: "Sultanlar Ligi",
    round: "1. Hafta",
    homeTeam: "Fenerbahçe Medicana",
    homeLogo: "fener.png",
    homeScore: "3",
    awayTeam: "Eczacıbaşı Dynavit",
    awayLogo:
      "https://r2.thesportsdb.com/images/media/team/badge/zrw7gq1601633519.png",
    awayScore: "1",
    date: "5 Ekim 2026, Cumartesi",
    time: "19:00",
    stadium: "Burhan Felek Vestel Voleybol Salonu",
  },
];
export const fetchFixtures = async (): Promise<MatchData[]> => {
  try {
    const allMatches: MatchData[] = [];

    try {
      const [superLigRes, uefaRes] = await Promise.all([
        fetch(
          "https://site.api.espn.com/apis/site/v2/sports/soccer/tur.1/teams/436/schedule",
        ),
        fetch(
          "https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/teams/436/schedule",
        ),
      ]);

      const parseEspnEvents = async (res: Response, compFallback: string) => {
        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data.events)) return;

        data.events.forEach((event: any) => {
          const comp = event.competitions?.[0];
          if (!comp) return;

          const homeComp = comp.competitors?.find(
            (c: any) => c.homeAway === "home",
          );
          const awayComp = comp.competitors?.find(
            (c: any) => c.homeAway === "away",
          );
          if (!homeComp || !awayComp) return;

          const homeName = homeComp.team?.displayName || "Ev Sahibi";
          const awayName = awayComp.team?.displayName || "Deplasman";
          const isFBHome = homeName.toLowerCase().includes("fenerbah");
          const isFBAway = awayName.toLowerCase().includes("fenerbah");

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

          const compName =
            comp.notes?.[0]?.headline ||
            (compFallback === "Süper Lig"
              ? "Süper Lig"
              : "UEFA Şampiyonlar Ligi");

          const roundStr =
            comp.round?.displayName ||
            (comp.notes?.[0]?.headline ? "" : "Lig Aşaması");

          allMatches.push({
            id: String(event.id),
            branch: "Futbol",
            competition: compName,
            round: roundStr,
            homeTeam: isFBHome ? "Fenerbahçe" : homeName,
            homeLogo: isFBHome
              ? "fener.png"
              : homeComp.team?.logo || homeComp.team?.logos?.[0]?.href,
            homeScore: homeComp.score?.displayValue ?? null,
            awayTeam: isFBAway ? "Fenerbahçe" : awayName,
            awayLogo: isFBAway
              ? "fener.png"
              : awayComp.team?.logo || awayComp.team?.logos?.[0]?.href,
            awayScore: awayComp.score?.displayValue ?? null,
            date: dateStr,
            time: timeStr !== "Invalid Date" ? timeStr : "20:00",
            stadium:
              comp.venue?.fullName ||
              (isFBHome
                ? "Ülker Stadyumu Şükrü Saracoğlu Spor Kompleksi"
                : "Deplasman"),
          });
        });
      };

      await Promise.all([
        parseEspnEvents(superLigRes, "Süper Lig"),
        parseEspnEvents(uefaRes, "UEFA Şampiyonlar Ligi"),
      ]);
    } catch (err) {
      console.warn("ESPN futbol maç takvimi çekilemedi:", err);
    }
    try {
      const euroRes = await fetch(
        "https://api-live.euroleague.net/v2/competitions/E/seasons/E2026/games",
      );
      if (euroRes.ok) {
        const euroData = await euroRes.json();
        if (Array.isArray(euroData.data)) {
          const fbGames = euroData.data.filter(
            (g: any) =>
              g.local?.club?.code === "ULK" || g.road?.club?.code === "ULK",
          );

          fbGames.forEach((g: any) => {
            const isFBLocal = g.local?.club?.code === "ULK";
            const isFBRoad = g.road?.club?.code === "ULK";
            const dateObj = new Date(g.date);

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

            allMatches.push({
              id: `el-${g.gameCode}`,
              branch: "Basketbol",
              competition: "EuroLeague",
              round: g.roundName || `Round ${g.round}`,
              homeTeam: isFBLocal
                ? "Fenerbahçe Beko"
                : g.local?.club?.name || "Ev Sahibi",
              homeLogo: isFBLocal ? "fener.png" : g.local?.club?.images?.crest,
              homeScore: g.played ? String(g.local?.score) : null,
              awayTeam: isFBRoad
                ? "Fenerbahçe Beko"
                : g.road?.club?.name || "Deplasman",
              awayLogo: isFBRoad ? "fener.png" : g.road?.club?.images?.crest,
              awayScore: g.played ? String(g.road?.score) : null,
              date: dateStr,
              time: timeStr !== "Invalid Date" ? timeStr : "20:45",
              stadium:
                g.venue?.name ||
                (isFBLocal ? "Ülker Spor ve Etkinlik Salonu" : "Deplasman"),
            });
          });
        }
      }
    } catch (err) {
      console.warn("EuroLeague maç takvimi çekilemedi:", err);
    }

    try {
      const [vLastRes, vNextRes] = await Promise.all([
        fetch(
          "https://www.thesportsdb.com/api/v1/json/3/eventslast.php?id=136619",
        ),
        fetch(
          "https://www.thesportsdb.com/api/v1/json/3/eventsnext.php?id=136619",
        ),
      ]);

      const parseTsdbVolley = async (res: Response) => {
        if (!res.ok) return;
        const data = await res.json();
        const events = [...(data.results || []), ...(data.events || [])];

        events.forEach((item: any) => {
          const dateObj = new Date(item.dateEvent);
          const isFBHome = item.strHomeTeam?.includes("Fenerbah");
          const isFBAway = item.strAwayTeam?.includes("Fenerbah");

          allMatches.push({
            id: `tsdb-${item.idEvent}`,
            branch: "Voleybol",
            competition: item.strLeague || "Sultanlar Ligi",
            round: item.intRound ? `${item.intRound}. Hafta` : "Lig Maçı",
            homeTeam: isFBHome ? "Fenerbahçe Medicana" : item.strHomeTeam,
            homeLogo: isFBHome ? "fener.png" : item.strHomeTeamBadge,
            homeScore: item.intHomeScore ?? null,
            awayTeam: isFBAway ? "Fenerbahçe Medicana" : item.strAwayTeam,
            awayLogo: isFBAway ? "fener.png" : item.strAwayTeamBadge,
            awayScore: item.intAwayScore ?? null,
            date: dateObj.toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              weekday: "long",
            }),
            time: item.strTimeLocal
              ? item.strTimeLocal.substring(0, 5)
              : "19:00",
            stadium: item.strVenue || "Burhan Felek Vestel Voleybol Salonu",
          });
        });
      };

      await Promise.all([parseTsdbVolley(vLastRes), parseTsdbVolley(vNextRes)]);
    } catch (err) {
      console.warn("TheSportsDB voleybol çekilemedi:", err);
    }

    if (allMatches.length === 0) {
      return fallbackCuratedFixtures;
    }

    if (!allMatches.some((m) => m.branch === "Voleybol")) {
      const vFallback = fallbackCuratedFixtures.filter(
        (m) => m.branch === "Voleybol",
      );
      allMatches.push(...vFallback);
    }

    return allMatches;
  } catch (error) {
    console.error("fetchFixtures genel hata:", error);
    return fallbackCuratedFixtures;
  }
};
