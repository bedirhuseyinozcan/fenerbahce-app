import { MatchData } from "@/types";

export const fallbackCuratedFixtures: MatchData[] = [
  {
    id: "fb-live-next-1",
    branch: "Futbol",
    competition: "Trendyol Süper Lig",
    round: "9. Hafta",
    homeTeam: "Fenerbahçe",
    homeLogo: "fener.png",
    homeScore: null,
    awayTeam: "Corendon Alanyaspor",
    awayLogo:
      "https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/18151.png",
    awayScore: null,
    date: "17 Ekim 2026, Cumartesi",
    time: "19:00",
    stadium: "Ülker Stadyumu Şükrü Saracoğlu Spor Kompleksi",
    rawDate: "2026-10-17T16:00:00Z",
  },
  {
    id: "fb-live-next-2",
    branch: "Futbol",
    competition: "UEFA Şampiyonlar Ligi",
    round: "Lig Aşaması",
    homeTeam: "Fenerbahçe",
    homeLogo: "fener.png",
    homeScore: null,
    awayTeam: "Slavia Prague",
    awayLogo:
      "https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/455.png",
    awayScore: null,
    date: "20 Ekim 2026, Salı",
    time: "19:45",
    stadium: "Ülker Stadyumu Şükrü Saracoğlu Spor Kompleksi",
    rawDate: "2026-10-20T16:45:00Z",
  },
  {
    id: "fb-live-next-3",
    branch: "Futbol",
    competition: "Trendyol Süper Lig",
    round: "10. Hafta (Derbi)",
    homeTeam: "Galatasaray",
    homeLogo:
      "https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/437.png",
    homeScore: null,
    awayTeam: "Fenerbahçe",
    awayLogo: "fener.png",
    awayScore: null,
    date: "26 Ekim 2026, Pazartesi",
    time: "20:00",
    stadium: "RAMS Park",
    rawDate: "2026-10-26T17:00:00Z",
  },
  {
    id: "el-live-1",
    branch: "Basketbol",
    competition: "EuroLeague",
    round: "Round 2",
    homeTeam: "Fenerbahçe Beko",
    homeLogo: "fener.png",
    homeScore: null,
    awayTeam: "Panathinaikos AKTOR",
    awayLogo:
      "https://media-cdn.incrowdsports.com/f04778be-c6e3-4613-81b8-6b45a64b971a.png",
    awayScore: null,
    date: "18 Ekim 2026, Pazar",
    time: "20:45",
    stadium: "Ülker Spor ve Etkinlik Salonu",
    rawDate: "2026-10-18T17:45:00Z",
  },
  {
    id: "vb-live-1",
    branch: "Voleybol",
    competition: "Vodafone Sultanlar Ligi",
    round: "2. Hafta",
    homeTeam: "Fenerbahçe Medicana",
    homeLogo: "fener.png",
    homeScore: null,
    awayTeam: "Ziraat Bankası",
    awayLogo:
      "https://r2.thesportsdb.com/images/media/team/badge/zrw7gq1601633519.png",
    awayScore: null,
    date: "17 Ekim 2026, Cumartesi",
    time: "16:00",
    stadium: "Burhan Felek Vestel Voleybol Salonu",
    rawDate: "2026-10-17T13:00:00Z",
  },
  {
    id: "fb-live-past-1",
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
    rawDate: "2026-10-10T16:00:00Z",
  },
  {
    id: "fb-live-past-2",
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
    rawDate: "2026-09-20T14:00:00Z",
  },
];

export const fetchFixtures = async (): Promise<MatchData[]> => {
  try {
    const matchMap = new Map<string, MatchData>();

    try {
      const [superLigPastRes, superLigFutureRes, uefaPastRes, uefaFutureRes] =
        await Promise.all([
          fetch(
            "https://site.api.espn.com/apis/site/v2/sports/soccer/tur.1/teams/436/schedule",
          ),
          fetch(
            "https://site.api.espn.com/apis/site/v2/sports/soccer/tur.1/teams/436/schedule?fixture=true",
          ),
          fetch(
            "https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/teams/436/schedule",
          ),
          fetch(
            "https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/teams/436/schedule?fixture=true",
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

          const isCompleted = comp.status?.type?.completed === true;

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
              ? "Trendyol Süper Lig"
              : "UEFA Şampiyonlar Ligi");

          const roundStr =
            comp.round?.displayName ||
            (comp.notes?.[0]?.headline ? "" : "Lig Maçı");

          const matchId = String(event.id);
          matchMap.set(matchId, {
            id: matchId,
            branch: "Futbol",
            competition: compName,
            round: roundStr,
            homeTeam: isFBHome ? "Fenerbahçe" : homeName,
            homeLogo: isFBHome
              ? "fener.png"
              : homeComp.team?.logo || homeComp.team?.logos?.[0]?.href,
            homeScore: isCompleted
              ? (homeComp.score?.displayValue ?? "0")
              : null,
            awayTeam: isFBAway ? "Fenerbahçe" : awayName,
            awayLogo: isFBAway
              ? "fener.png"
              : awayComp.team?.logo || awayComp.team?.logos?.[0]?.href,
            awayScore: isCompleted
              ? (awayComp.score?.displayValue ?? "0")
              : null,
            date: dateStr,
            time: timeStr !== "Invalid Date" ? timeStr : "20:00",
            stadium:
              comp.venue?.fullName ||
              (isFBHome
                ? "Ülker Stadyumu Şükrü Saracoğlu Spor Kompleksi"
                : "Deplasman"),
            rawDate: comp.date,
          });
        });
      };

      await Promise.all([
        parseEspnEvents(superLigPastRes, "Süper Lig"),
        parseEspnEvents(superLigFutureRes, "Süper Lig"),
        parseEspnEvents(uefaPastRes, "UEFA Şampiyonlar Ligi"),
        parseEspnEvents(uefaFutureRes, "UEFA Şampiyonlar Ligi"),
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

            const matchId = `el-${g.gameCode}`;
            matchMap.set(matchId, {
              id: matchId,
              branch: "Basketbol",
              competition: "Turkish Airlines EuroLeague",
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
              rawDate: g.date,
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
          const matchId = `tsdb-${item.idEvent}`;

          const rawDateStr = item.dateEvent
            ? `${item.dateEvent}T${item.strTime || "16:00:00"}Z`
            : undefined;

          matchMap.set(matchId, {
            id: matchId,
            branch: "Voleybol",
            competition: item.strLeague || "Vodafone Sultanlar Ligi",
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
            rawDate: rawDateStr,
          });
        });
      };

      await Promise.all([parseTsdbVolley(vLastRes), parseTsdbVolley(vNextRes)]);
    } catch (err) {
      console.warn("TheSportsDB voleybol çekilemedi:", err);
    }

    const allMatches = Array.from(matchMap.values());

    if (allMatches.length === 0) {
      return fallbackCuratedFixtures;
    }

    if (!allMatches.some((m) => m.branch === "Voleybol")) {
      const vFallback = fallbackCuratedFixtures.filter(
        (m) => m.branch === "Voleybol",
      );
      allMatches.push(...vFallback);
    }

    const now = Date.now();
    const upcoming = allMatches
      .filter((m) => m.homeScore === null && m.awayScore === null)
      .sort((a, b) => {
        const timeA = a.rawDate
          ? new Date(a.rawDate).getTime()
          : now + 999999999;
        const timeB = b.rawDate
          ? new Date(b.rawDate).getTime()
          : now + 999999999;
        return timeA - timeB;
      });

    const past = allMatches
      .filter((m) => m.homeScore !== null && m.awayScore !== null)
      .sort((a, b) => {
        const timeA = a.rawDate ? new Date(a.rawDate).getTime() : 0;
        const timeB = b.rawDate ? new Date(b.rawDate).getTime() : 0;
        return timeB - timeA;
      });

    return [...upcoming, ...past];
  } catch (error) {
    console.error("fetchFixtures genel hata:", error);
    return fallbackCuratedFixtures;
  }
};
