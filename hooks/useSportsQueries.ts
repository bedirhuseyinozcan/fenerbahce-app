import {
  fetchAthletes,
  getFallbackAthletesByBranch,
} from "@/services/athleteService";
import {
  fetchFixtures,
  getCachedFixturesSync,
  resolveMatchStatus,
} from "@/services/fixtureService";
import {
  getInstantMatchPreview,
  getMatchDetail,
} from "@/services/matchDetailService";
import { fetchNews } from "@/services/newsService";
import {
  fetchStandingsByLeague,
  getCachedStandingsSync,
  StandingsLeagueKey,
} from "@/services/standingsService";
import { fetchKadikoyWeather } from "@/services/weatherService";
import { AthleteBranch, MatchDetailData } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useIsFocused } from "expo-router";

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

export function useFixturesQuery() {
  const isFocused = useIsFocused();

  return useQuery({
    queryKey: ["fixtures"],
    queryFn: () => fetchFixtures(true),
    initialData: () => getCachedFixturesSync() ?? undefined,
    initialDataUpdatedAt: 0,
    refetchInterval: (query) => {
      if (!isFocused) return false;
      const list = query.state.data;
      const hasLive =
        Array.isArray(list) && list.some((m) => m.status === "live");
      return hasLive ? 20_000 : false;
    },
  });
}

export function useMatchDetailQuery(matchId: string) {
  const isFocused = useIsFocused();

  return useQuery({
    queryKey: ["matchDetail", matchId],
    queryFn: () => getMatchDetail(matchId, true),
    placeholderData: () => getInstantMatchPreview(matchId) ?? undefined,
    refetchInterval: (query) => {
      if (!isFocused) return false;
      const data = query.state.data as MatchDetailData | undefined;
      if (!data) return false;
      const status = resolveMatchStatus(data);
      if (status === "live") return 15_000;
      if (status === "upcoming" && data.rawDate) {
        const diff = new Date(data.rawDate).getTime() - Date.now();
        if (!isNaN(diff) && diff > -TWO_HOURS_MS && diff < TWO_HOURS_MS) {
          return 60_000;
        }
      }
      return false;
    },
  });
}

export function useStandingsQuery(league: StandingsLeagueKey) {
  return useQuery({
    queryKey: ["standings", league],
    queryFn: () => fetchStandingsByLeague(league, true),
    initialData: () => getCachedStandingsSync(league) ?? undefined,
    initialDataUpdatedAt: 0,
    staleTime: 60_000,
  });
}

export function useNewsQuery() {
  return useQuery({
    queryKey: ["news"],
    queryFn: () => fetchNews(true),
    staleTime: 2 * 60_000,
  });
}

export function useAthletesQuery(branch: AthleteBranch | "Tümü") {
  return useQuery({
    queryKey: ["athletes", branch],
    queryFn: () => fetchAthletes(branch),
    placeholderData: () => getFallbackAthletesByBranch(branch),
    staleTime: 10 * 60_000,
  });
}

export function useKadikoyWeatherQuery(enabled: boolean) {
  return useQuery({
    queryKey: ["weather", "kadikoy"],
    queryFn: fetchKadikoyWeather,
    enabled,
    staleTime: 15 * 60_000,
  });
}
