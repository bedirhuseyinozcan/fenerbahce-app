import { mockStandings } from "@/data/mockStandings";
import { TeamStanding } from "@/types";
export const fetchSuperLigStandings = async (): Promise<TeamStanding[]> => {
  try {
    const res = await fetch(
      "https://site.api.espn.com/apis/v2/sports/soccer/tur.1/standings",
    );
    if (res.ok) {
      const data = await res.json();
      const entries = data.children?.[0]?.standings?.entries;

      if (Array.isArray(entries) && entries.length > 0) {
        return entries.map((e: any, idx: number) => {
          const statsMap: { [key: string]: number } = {};
          if (Array.isArray(e.stats)) {
            e.stats.forEach((st: any) => {
              statsMap[st.name] = st.value;
            });
          }

          let teamName = e.team?.displayName || "Takım";
          if (teamName.toLowerCase().includes("fenerbah"))
            teamName = "Fenerbahçe";
          else if (teamName === "Besiktas") teamName = "Beşiktaş";
          else if (teamName.includes("Basaksehir")) teamName = "Başakşehir FK";
          else if (teamName.includes("Rizespor")) teamName = "Çaykur Rizespor";
          else if (teamName.includes("Eyup")) teamName = "Eyüpspor";
          else if (teamName.includes("Goztepe")) teamName = "Göztepe";
          else if (teamName.includes("Genclerbirligi"))
            teamName = "Gençlerbirliği";
          else if (teamName.includes("Kasimpasa")) teamName = "Kasımpaşa";

          const isFenerbahce = teamName === "Fenerbahçe";
          const logoUrl = isFenerbahce
            ? "fener.png"
            : e.team?.logos?.[0]?.href || "";

          return {
            rank: statsMap.rank || idx + 1,
            teamId: String(e.team?.id || idx),
            teamName,
            badge: logoUrl,
            played: statsMap.gamesPlayed ?? 0,
            win: statsMap.wins ?? 0,
            draw: statsMap.ties ?? 0,
            loss: statsMap.losses ?? 0,
            goalsFor: statsMap.pointsFor ?? 0,
            goalsAgainst: statsMap.pointsAgainst ?? 0,
            goalDifference: statsMap.pointDifferential ?? 0,
            points: statsMap.points ?? 0,
          };
        });
      }
    }

    return mockStandings;
  } catch (error) {
    console.error("ESPN Puan durumu çekilirken hata:", error);
    return mockStandings;
  }
};
