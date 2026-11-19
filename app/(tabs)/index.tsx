import MatchCard from "@/components/MatchCard";
import { MatchCardSkeleton } from "@/components/ui/Skeleton";
import { useAppTheme } from "@/context/ThemeContext";
import { HistoryTodayCard } from "@/features/home/components/HistoryTodayCard";
import { HomeMatchHero } from "@/features/home/components/HomeMatchHero";
import { HomeNewsSection } from "@/features/home/components/HomeNewsSection";
import { HomeStandingsPreview } from "@/features/home/components/HomeStandingsPreview";
import { LiveNowTicker } from "@/features/home/components/LiveNowTicker";
import { QuickActionsGrid } from "@/features/home/components/QuickActionsGrid";
import {
  useFixturesQuery,
  useKadikoyWeatherQuery,
  useNewsQuery,
  useStandingsQuery,
} from "@/hooks/useSportsQueries";
import {
  isHomeIstanbulMatch,
  resolveMatchStatus,
} from "@/services/fixtureService";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabOneScreen() {
  const { theme, brand } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [selectedHeroBranch, setSelectedHeroBranch] = useState<
    "Futbol" | "Basketbol" | "Voleybol"
  >("Futbol");
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: allFixtures = [],
    isLoading: fixturesLoading,
    refetch: refetchFixtures,
  } = useFixturesQuery();

  const {
    data: standingsData = [],
    isLoading: standingsLoading,
    refetch: refetchStandings,
  } = useStandingsQuery("superlig");

  const {
    data: newsData = [],
    isLoading: newsLoading,
    refetch: refetchNews,
  } = useNewsQuery();

  const news = useMemo(() => newsData.slice(0, 5), [newsData]);

  const liveMatches = useMemo(
    () => allFixtures.filter((m) => resolveMatchStatus(m) === "live"),
    [allFixtures],
  );

  const nextMatch = useMemo(() => {
    const branchLive = allFixtures.find(
      (m) => m.branch === selectedHeroBranch && m.status === "live",
    );
    if (branchLive) return branchLive;

    const branchUpcoming = allFixtures.find(
      (m) =>
        m.branch === selectedHeroBranch &&
        resolveMatchStatus(m) === "upcoming",
    );
    if (branchUpcoming) return branchUpcoming;

    const anyBranchMatch = allFixtures.find(
      (m) => m.branch === selectedHeroBranch,
    );
    if (anyBranchMatch) return anyBranchMatch;

    return allFixtures[0] || null;
  }, [allFixtures, selectedHeroBranch]);

  const showKadikoyWeather = useMemo(
    () => isHomeIstanbulMatch(nextMatch),
    [nextMatch],
  );
  const { data: weather } = useKadikoyWeatherQuery(showKadikoyWeather);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchFixtures(),
        refetchStandings(),
        refetchNews(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchFixtures, refetchStandings, refetchNews]);

  const upcomingMatches = useMemo(() => {
    const liveAndUpcoming = allFixtures.filter((m) => {
      const st = resolveMatchStatus(m);
      return st === "live" || st === "upcoming";
    });
    return (liveAndUpcoming.length > 0 ? liveAndUpcoming : allFixtures).slice(
      0,
      5,
    );
  }, [allFixtures]);

  const loading = fixturesLoading && allFixtures.length === 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.accent}
          colors={[brand.navy, brand.yellow]}
        />
      }
    >
      <HomeMatchHero
        nextMatch={nextMatch}
        allFixtures={allFixtures}
        selectedBranch={selectedHeroBranch}
        onSelectBranch={setSelectedHeroBranch}
        showWeather={showKadikoyWeather}
        weather={weather}
        loading={loading}
        topInset={insets.top}
        onOpenMatchDetail={(id) => router.push(`/mac/${id}` as any)}
        onOpenAllFixtures={() => router.push("/fikstur")}
      />

      <LiveNowTicker
        liveMatches={liveMatches}
        onPressMatch={(id) => router.push(`/mac/${id}` as any)}
      />

      <QuickActionsGrid onNavigate={(route) => router.push(route as any)} />

      <HistoryTodayCard />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            MAÇ TAKVİMİ
          </Text>
          <TouchableOpacity onPress={() => router.push("/fikstur")}>
            <Text style={[styles.sectionLink, { color: theme.accent }]}>
              + Tüm Maçlar
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.matchList}
          >
            <MatchCardSkeleton />
            <MatchCardSkeleton />
          </ScrollView>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.matchList}
          >
            {upcomingMatches.map((item) => (
              <MatchCard
                key={item.id}
                id={item.id}
                branch={item.branch}
                competition={item.competition}
                round={item.round}
                homeTeam={item.homeTeam}
                homeLogo={item.homeLogo}
                homeScore={item.homeScore}
                awayTeam={item.awayTeam}
                awayLogo={item.awayLogo}
                awayScore={item.awayScore}
                date={item.date}
                time={item.time}
                stadium={item.stadium}
                status={item.status}
                liveClock={item.liveClock}
                onPress={() => router.push(`/mac/${item.id}` as any)}
              />
            ))}
            {upcomingMatches.length === 0 && (
              <Text
                style={{ color: theme.secondaryText, paddingHorizontal: 16 }}
              >
                Şu an maç verisi bulunamadı.
              </Text>
            )}
          </ScrollView>
        )}
      </View>

      <HomeStandingsPreview
        standings={standingsData}
        loading={standingsLoading}
        onPressSeeAll={() => router.push("/puan-durumu")}
      />

      <HomeNewsSection
        news={news}
        loading={newsLoading}
        onPressSeeAll={() => router.push("/haberler")}
      />

      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: "bold",
  },
  matchList: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
});
