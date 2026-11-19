import { getEuroLeagueSeasonCode } from "@/services/fixtureService";
import { TeamStanding } from "@/types";
import { safeFetch } from "@/utils/safeFetch";
import { getJson, setJson } from "@/utils/storage";

export type StandingsLeagueKey = "superlig" | "champions" | "euroleague";

const standingsCache = new Map<
  StandingsLeagueKey,
  { data: TeamStanding[]; ts: number }
>();
const CACHE_TTL_MS = 60 * 1000;

function loadPersistedStandings(
  league: StandingsLeagueKey,
): TeamStanding[] | null {
  const parsed = getJson<TeamStanding[]>(`fb_standings_v6_${league}`);
  return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
}

function savePersistedStandings(
  league: StandingsLeagueKey,
  data: TeamStanding[],
): void {
  if (!Array.isArray(data) || data.length === 0) return;
  setJson(`fb_standings_v6_${league}`, data);
}

export function getCachedStandingsSync(
  league: StandingsLeagueKey = "superlig",
): TeamStanding[] | null {
  const cached = standingsCache.get(league);
  if (cached) return cached.data;
  const persisted = loadPersistedStandings(league);
  if (persisted) {
    standingsCache.set(league, { data: persisted, ts: 0 });
    return persisted;
  }
  return null;
}

function normalizeTurkishTeamName(rawName: string): string {
  let teamName = rawName || "Takım";
  if (teamName.toLowerCase().includes("fenerbah")) return "Fenerbahçe";
  if (teamName === "Besiktas") return "Beşiktaş";
  if (teamName.includes("Basaksehir")) return "Başakşehir FK";
  if (teamName.includes("Rizespor")) return "Çaykur Rizespor";
  if (teamName.includes("Eyup")) return "Eyüpspor";
  if (teamName.includes("Goztepe")) return "Göztepe";
  if (teamName.includes("Genclerbirligi")) return "Gençlerbirliği";
  if (teamName.includes("Kasimpasa")) return "Kasımpaşa";
  return teamName;
}

function extractStandingsEntries(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data.children)) {
    for (const child of data.children) {
      if (
        Array.isArray(child?.standings?.entries) &&
        child.standings.entries.length > 0
      ) {
        return child.standings.entries;
      }
      if (Array.isArray(child?.children)) {
        for (const sub of child.children) {
          if (
            Array.isArray(sub?.standings?.entries) &&
            sub.standings.entries.length > 0
          ) {
            return sub.standings.entries;
          }
        }
      }
    }
  }
  if (
    Array.isArray(data.standings?.entries) &&
    data.standings.entries.length > 0
  ) {
    return data.standings.entries;
  }
  return [];
}

async function fetchRawStandingsJson(slug: string): Promise<any | null> {
  const res = await safeFetch(
    `https://site.api.espn.com/apis/v2/sports/soccer/${slug}/standings`,
  );
  if (!res || !res.ok) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchEspnStandingsBySlug(
  slug: string,
): Promise<TeamStanding[] | null> {
  const data = await fetchRawStandingsJson(slug);
  const entries = extractStandingsEntries(data);

  if (!Array.isArray(entries) || entries.length === 0) return null;

  const list: TeamStanding[] = entries.map((e: any, idx: number) => {
    const statsMap: { [key: string]: number } = {};
    if (Array.isArray(e.stats)) {
      e.stats.forEach((st: any) => {
        const val =
          typeof st.value === "number"
            ? st.value
            : typeof st.displayValue === "string"
              ? parseFloat(st.displayValue)
              : NaN;
        if (!isNaN(val)) {
          statsMap[st.name] = val;
        }
      });
    }

    const teamName = normalizeTurkishTeamName(e.team?.displayName || "Takım");
    const isFenerbahce = teamName.includes("Fenerbahçe");
    const logoUrl = isFenerbahce ? "fener.png" : e.team?.logos?.[0]?.href || "";

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

  return list.sort((a, b) => a.rank - b.rank);
}

async function fetchEuroLeagueStandingsFromGames(): Promise<TeamStanding[]> {
  try {
    const seasonCode = getEuroLeagueSeasonCode();
    const res = await safeFetch(
      `https://api-live.euroleague.net/v2/competitions/E/seasons/${seasonCode}/games`,
    );
    if (!res || !res.ok) return [];
    const json = await res.json();
    const games = Array.isArray(json.data) ? json.data : [];

    const map = new Map<
      string,
      {
        teamId: string;
        teamName: string;
        badge: string;
        played: number;
        win: number;
        loss: number;
        pf: number;
        pa: number;
      }
    >();

    const ensureClub = (club: any) => {
      const code = club?.code || club?.name;
      if (!code) return null;
      if (!map.has(code)) {
        const isFB =
          code === "ULK" ||
          String(club?.name || "")
            .toLowerCase()
            .includes("fenerbah");
        map.set(code, {
          teamId: String(code),
          teamName: isFB ? "Fenerbahçe Beko" : club?.name || code,
          badge: isFB ? "fener.png" : club?.images?.crest || "",
          played: 0,
          win: 0,
          loss: 0,
          pf: 0,
          pa: 0,
        });
      }
      return map.get(code)!;
    };

    games.forEach((g: any) => {
      const home = ensureClub(g.local?.club);
      const away = ensureClub(g.road?.club);
      if (!home || !away) return;

      if (g.played && g.local?.score != null && g.road?.score != null) {
        const hs = Number(g.local.score) || 0;
        const as = Number(g.road.score) || 0;
        if (hs === 0 && as === 0) return;
        home.played += 1;
        away.played += 1;
        home.pf += hs;
        home.pa += as;
        away.pf += as;
        away.pa += hs;
        if (hs > as) {
          home.win += 1;
          away.loss += 1;
        } else if (as > hs) {
          away.win += 1;
          home.loss += 1;
        }
      }
    });

    const sorted = Array.from(map.values()).sort((a, b) => {
      if (b.win !== a.win) return b.win - a.win;
      const diffA = a.pf - a.pa;
      const diffB = b.pf - b.pa;
      return diffB - diffA;
    });

    return sorted.map((t, idx) => ({
      rank: idx + 1,
      teamId: t.teamId,
      teamName: t.teamName,
      badge: t.badge,
      played: t.played,
      win: t.win,
      draw: 0,
      loss: t.loss,
      goalsFor: t.pf,
      goalsAgainst: t.pa,
      goalDifference: t.pf - t.pa,
      points: t.win * 2 + t.loss,
    }));
  } catch (err) {
    console.warn("EuroLeague puan durumu hesaplanamadı:", err);
    return [];
  }
}

export const fetchStandingsByLeague = async (
  league: StandingsLeagueKey = "superlig",
  forceRefresh: boolean = false,
): Promise<TeamStanding[]> => {
  const cached = standingsCache.get(league);
  if (!forceRefresh && cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    let result: TeamStanding[] | null = null;
    if (league === "superlig") {
      result = await fetchEspnStandingsBySlug("tur.1");
    } else if (league === "champions") {
      result = await fetchEspnStandingsBySlug("uefa.champions");
    } else if (league === "euroleague") {
      result = await fetchEuroLeagueStandingsFromGames();
    }

    if (result && result.length > 0) {
      standingsCache.set(league, { data: result, ts: Date.now() });
      savePersistedStandings(league, result);
      return result;
    }

    const lastKnown = cached?.data || loadPersistedStandings(league);
    return lastKnown && lastKnown.length > 0 ? lastKnown : [];
  } catch {
    return cached?.data || loadPersistedStandings(league) || [];
  }
};

export const fetchSuperLigStandings = async (
  forceRefresh: boolean = false,
): Promise<TeamStanding[]> => {
  return fetchStandingsByLeague("superlig", forceRefresh);
};
