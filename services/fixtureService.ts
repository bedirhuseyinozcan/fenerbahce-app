import { MatchData } from "@/types";

const TEAMS = [
  { id: 133807, branch: "Futbol" },
  { id: 136071, branch: "Basketbol" },
  { id: 136619, branch: "Voleybol" },
];

export const fetchFixtures = async (): Promise<MatchData[]> => {
  try {
    const fetchPromises: Promise<any>[] = [];

    TEAMS.forEach((team) => {
      const lastUrl = `https://www.thesportsdb.com/api/v1/json/3/eventslast.php?id=${team.id}`;
      const nextUrl = `https://www.thesportsdb.com/api/v1/json/3/eventsnext.php?id=${team.id}`;

      fetchPromises.push(
        fetch(lastUrl)
          .then((r) => r.json())
          .then((data) => ({ data, branch: team.branch })),
        fetch(nextUrl)
          .then((r) => r.json())
          .then((data) => ({ data, branch: team.branch })),
      );
    });

    const responses = await Promise.all(fetchPromises);
    let allEvents: any[] = [];

    responses.forEach((res) => {
      const results = res.data.results || [];
      const events = res.data.events || [];

      const combined = [...results, ...events].map((e: any) => ({
        ...e,
        branchName: res.branch,
      }));
      allEvents = [...allEvents, ...combined];
    });

    if (allEvents.length > 0) {
      allEvents = allEvents.sort(
        (a, b) =>
          new Date(a.dateEvent).getTime() - new Date(b.dateEvent).getTime(),
      );

      const footballMatches = allEvents.map((item: any) => {
        const dateObj = new Date(item.dateEvent);

        return {
          id: String(item.idEvent),
          branch: item.branchName,
          competition: item.strLeague,
          round: item.intRound ? `${item.intRound}. Hafta` : "",
          homeTeam: item.strHomeTeam,
          homeLogo: item.strHomeTeam.includes("Fenerbah")
            ? "fener.png"
            : item.strHomeTeamBadge,
          homeScore: item.intHomeScore ?? null,
          awayTeam: item.strAwayTeam,
          awayLogo: item.strAwayTeam.includes("Fenerbah")
            ? "fener.png"
            : item.strAwayTeamBadge,
          awayScore: item.intAwayScore ?? null,
          date: dateObj.toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            weekday: "long",
          }),
          // Bazen saat Local, bazen GMT gelir. Temizliyoruz:
          time: item.strTimeLocal
            ? item.strTimeLocal.substring(0, 5)
            : item.strTime
              ? item.strTime.substring(0, 5)
              : "Belirsiz",
          stadium: item.strVenue || "Stadyum Belirtilmedi",
        };
      });

      return footballMatches;
    }

    return [];
  } catch (error) {
    console.error("Fikstür API çekilirken hata:", error);
    return [];
  }
};
