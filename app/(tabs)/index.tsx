import CloudinaryImage from "@/components/CloudinaryImage";
import MatchCard from "@/components/MatchCard";
import { LivePill } from "@/components/ui/LivePulseDot";
import {
  HeroSkeleton,
  MatchCardSkeleton,
  NewsCardSkeleton,
  StandingsSkeleton,
} from "@/components/ui/Skeleton";
import { Radius } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";
import { getTodayHistoricalEvent } from "@/data/historyData";
import {
  useFixturesQuery,
  useKadikoyWeatherQuery,
  useNewsQuery,
  useStandingsQuery,
} from "@/hooks/useSportsQueries";
import {
  isHomeIstanbulMatch,
  isSameIstanbulCalendarDay,
  resolveMatchStatus,
} from "@/services/fixtureService";
import { openInAppUrl } from "@/utils/browser";
import { triggerSelectionHaptic } from "@/utils/haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  isToday: boolean;
}

function calculateTimeLeft(rawDate?: string): CountdownTime {
  if (!rawDate) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true,
      isToday: false,
    };
  }
  const targetTime = new Date(rawDate).getTime();
  const now = Date.now();
  const diff = targetTime - now;

  if (isNaN(diff) || diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true,
      isToday: false,
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, isPast: false, isToday: days === 0 };
}

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

  const standings = useMemo(() => standingsData.slice(0, 5), [standingsData]);
  const news = useMemo(() => newsData.slice(0, 5), [newsData]);
  const todayHistory = useMemo(() => getTodayHistoricalEvent(), []);

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

  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: true,
    isToday: false,
  });

  useEffect(() => {
    if (!nextMatch?.rawDate) {
      setCountdown({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isPast: true,
        isToday: false,
      });
      return;
    }

    setCountdown(calculateTimeLeft(nextMatch.rawDate));

    const interval = setInterval(() => {
      setCountdown(calculateTimeLeft(nextMatch.rawDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [nextMatch?.rawDate]);

  const isNextMatchSameCalendarDay = useMemo(
    () => isSameIstanbulCalendarDay(nextMatch?.rawDate),
    [nextMatch?.rawDate],
  );

  const nextMatchStatus = nextMatch ? resolveMatchStatus(nextMatch) : "upcoming";
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
      {nextMatch ? (
        <View
          style={[
            styles.heroContainer,
            { paddingTop: insets.top, backgroundColor: brand.navy },
          ]}
        >
          <Image
            source={{
              uri: "https://media.fenerbahce.org/getmedia/5c3702c2-d352-45e3-b09e-7341857c50be/stad.jpg",
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["rgba(4, 21, 46, 0.72)", "rgba(7, 33, 70, 0.94)"]}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.heroContent}>
            <View style={styles.heroBranchBar}>
              {(["Futbol", "Basketbol", "Voleybol"] as const).map((branch) => {
                const isSelected = selectedHeroBranch === branch;
                const emoji =
                  branch === "Futbol"
                    ? "⚽"
                    : branch === "Basketbol"
                      ? "🏀"
                      : "🏐";
                return (
                  <TouchableOpacity
                    key={branch}
                    style={[
                      styles.heroBranchTab,
                      isSelected && [
                        styles.heroBranchTabActive,
                        { backgroundColor: brand.yellow },
                      ],
                    ]}
                    onPress={() => {
                      triggerSelectionHaptic();
                      setSelectedHeroBranch(branch);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.heroBranchTabText,
                        isSelected && [
                          styles.heroBranchTabTextActive,
                          { color: brand.navy },
                        ],
                      ]}
                    >
                      {emoji} {branch}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>
                {nextMatch.competition}{" "}
                {nextMatch.round ? `• ${nextMatch.round}` : ""}
              </Text>
            </View>

            <View style={styles.heroMatchRow}>
              <View style={styles.heroTeam}>
                <CloudinaryImage
                  publicId={nextMatch.homeLogo || "fener.png"}
                  style={styles.heroLogo}
                  contentFit="contain"
                />
                <Text style={styles.heroTeamName} numberOfLines={2}>
                  {nextMatch.homeTeam}
                </Text>
              </View>

              <View style={styles.heroScoreBoard}>
                {nextMatchStatus === "live" || nextMatchStatus === "finished" ? (
                  <>
                    <Text style={styles.heroDate}>{nextMatch.date}</Text>
                    <Text style={[styles.heroTime, styles.tabularNumbers]}>
                      {nextMatch.homeScore ?? "0"} - {nextMatch.awayScore ?? "0"}
                    </Text>
                    <Text style={styles.heroStadium} numberOfLines={1}>
                      📍 {nextMatch.stadium}
                    </Text>
                    {showKadikoyWeather && weather && (
                      <Text style={styles.heroWeatherText}>
                        {weather.emoji} Kadıköy {weather.temperatureC}°C •{" "}
                        {weather.conditionLabel}
                      </Text>
                    )}
                  </>
                ) : (
                  <>
                    <Text style={styles.heroDate}>{nextMatch.date}</Text>
                    <Text style={[styles.heroTime, styles.tabularNumbers]}>
                      {nextMatch.time}
                    </Text>
                    <Text style={styles.heroStadium} numberOfLines={1}>
                      📍 {nextMatch.stadium}
                    </Text>
                    {showKadikoyWeather && weather && (
                      <Text style={styles.heroWeatherText}>
                        {weather.emoji} Kadıköy {weather.temperatureC}°C •{" "}
                        {weather.conditionLabel}
                      </Text>
                    )}
                  </>
                )}
              </View>

              <View style={styles.heroTeam}>
                <CloudinaryImage
                  publicId={nextMatch.awayLogo || "fener.png"}
                  style={styles.heroLogo}
                  contentFit="contain"
                />
                <Text style={styles.heroTeamName} numberOfLines={2}>
                  {nextMatch.awayTeam}
                </Text>
              </View>
            </View>

            {nextMatchStatus === "live" ? (
              <View style={styles.liveBannerWrap}>
                <LivePill
                  label={`CANLI OYNANIYOR${nextMatch.liveClock ? ` • ${nextMatch.liveClock}` : ""}`}
                />
              </View>
            ) : !countdown.isPast ? (
              <View style={styles.countdownContainer}>
                <Text style={styles.countdownTitle}>
                  ⚡ BAŞLAMASINA KALAN SÜRE
                </Text>
                <View style={styles.countdownRow}>
                  <View style={styles.countdownBox}>
                    <Text style={[styles.countdownNumber, styles.tabularNumbers]}>
                      {String(countdown.days).padStart(2, "0")}
                    </Text>
                    <Text style={styles.countdownLabel}>GÜN</Text>
                  </View>
                  <Text style={styles.countdownColon}>:</Text>
                  <View style={styles.countdownBox}>
                    <Text style={[styles.countdownNumber, styles.tabularNumbers]}>
                      {String(countdown.hours).padStart(2, "0")}
                    </Text>
                    <Text style={styles.countdownLabel}>SAAT</Text>
                  </View>
                  <Text style={styles.countdownColon}>:</Text>
                  <View style={styles.countdownBox}>
                    <Text style={[styles.countdownNumber, styles.tabularNumbers]}>
                      {String(countdown.minutes).padStart(2, "0")}
                    </Text>
                    <Text style={styles.countdownLabel}>DAKİKA</Text>
                  </View>
                  <Text style={styles.countdownColon}>:</Text>
                  <View style={styles.countdownBox}>
                    <Text style={[styles.countdownNumber, styles.tabularNumbers]}>
                      {String(countdown.seconds).padStart(2, "0")}
                    </Text>
                    <Text style={styles.countdownLabel}>SANİYE</Text>
                  </View>
                </View>
              </View>
            ) : nextMatchStatus === "finished" ? (
              <View style={styles.matchDayBanner}>
                <Text style={styles.matchDayBannerText}>
                  🏁 MAÇ SONUCU: {nextMatch.homeScore} - {nextMatch.awayScore}
                </Text>
              </View>
            ) : isNextMatchSameCalendarDay ? (
              <View style={styles.matchDayBanner}>
                <Text style={styles.matchDayBannerText}>
                  🔥 BUGÜN MAÇ GÜNÜ! 🔥
                </Text>
              </View>
            ) : null}

            <View style={styles.heroButtonsRow}>
              <TouchableOpacity
                style={styles.heroActionBtn}
                onPress={() => router.push(`/mac/${nextMatch.id}` as any)}
                activeOpacity={0.85}
              >
                <Text style={styles.heroActionBtnText}>Maç Detayı</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.heroSecondaryBtn}
                onPress={() => router.push("/fikstur")}
                activeOpacity={0.85}
              >
                <Text style={styles.heroSecondaryBtnText}>Tüm Fikstür</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View
          style={[
            styles.heroContainer,
            {
              paddingTop: insets.top,
              backgroundColor: brand.navy,
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          {loading ? (
            <HeroSkeleton />
          ) : (
            <Text style={{ color: brand.white }}>
              Sıradaki maç bilgisi bekleniyor...
            </Text>
          )}
        </View>
      )}

      <View style={styles.quickActionsContainer}>
        <TouchableOpacity
          style={[
            styles.quickActionBtn,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
          onPress={() => router.push("/sporcular" as any)}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.quickActionIconBox,
              { backgroundColor: theme.accentSoft },
            ]}
          >
            <Text style={{ fontSize: 18 }}>👥</Text>
          </View>
          <Text style={[styles.quickActionText, { color: theme.text }]}>
            Kadrolar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickActionBtn,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
          onPress={() => router.push("/puan-durumu" as any)}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.quickActionIconBox,
              { backgroundColor: "rgba(255, 160, 0, 0.16)" },
            ]}
          >
            <Text style={{ fontSize: 18 }}>🏆</Text>
          </View>
          <Text style={[styles.quickActionText, { color: theme.text }]}>
            Puan Cetveli
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickActionBtn,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
          onPress={() => router.push("/haberler" as any)}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.quickActionIconBox,
              { backgroundColor: "rgba(30, 136, 229, 0.16)" },
            ]}
          >
            <Text style={{ fontSize: 18 }}>📰</Text>
          </View>
          <Text style={[styles.quickActionText, { color: theme.text }]}>
            Haberler
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickActionBtn,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
          onPress={() => router.push("/derbi-merkezi" as any)}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.quickActionIconBox,
              { backgroundColor: "rgba(239, 68, 68, 0.16)" },
            ]}
          >
            <Text style={{ fontSize: 18 }}>⚔️</Text>
          </View>
          <Text style={[styles.quickActionText, { color: theme.text }]}>
            Derbi & H2H
          </Text>
        </TouchableOpacity>
      </View>

      <LinearGradient
        colors={[brand.navyLight, brand.navyDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.historyCard}
      >
        <View style={styles.historyHeader}>
          <Text style={styles.historyTag}>
            📜 TARİHTE FENERBAHÇE • {todayHistory.year}
          </Text>
          {todayHistory.score && (
            <View style={styles.historyScoreBadge}>
              <Text style={styles.historyScoreText}>{todayHistory.score}</Text>
            </View>
          )}
        </View>
        <Text style={styles.historyTitle}>{todayHistory.title}</Text>
        <Text style={styles.historyDesc}>{todayHistory.description}</Text>
      </LinearGradient>

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

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            SÜPER LİG PUAN DURUMU
          </Text>
          <TouchableOpacity onPress={() => router.push("/puan-durumu")}>
            <Text style={[styles.sectionLink, { color: theme.accent }]}>
              + Tüm Liste
            </Text>
          </TouchableOpacity>
        </View>
        {standingsLoading && standings.length === 0 ? (
          <View style={{ marginHorizontal: 16 }}>
            <StandingsSkeleton rows={5} />
          </View>
        ) : (
          <View
            style={[
              styles.standingsContainer,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
              },
            ]}
          >
            <View
              style={[
                styles.standingsHeaderRow,
                { borderBottomColor: theme.divider },
              ]}
            >
              <Text
                style={[
                  styles.standingsHeaderText,
                  { flex: 0.5, color: theme.secondaryText },
                ]}
              >
                #
              </Text>
              <Text
                style={[
                  styles.standingsHeaderText,
                  { flex: 3, color: theme.secondaryText },
                ]}
              >
                TAKIM
              </Text>
              <Text
                style={[
                  styles.standingsHeaderText,
                  { flex: 1, textAlign: "center", color: theme.secondaryText },
                ]}
              >
                O
              </Text>
              <Text
                style={[
                  styles.standingsHeaderText,
                  { flex: 1, textAlign: "center", color: theme.secondaryText },
                ]}
              >
                AV
              </Text>
              <Text
                style={[
                  styles.standingsHeaderText,
                  { flex: 1, textAlign: "center", color: theme.secondaryText },
                ]}
              >
                P
              </Text>
            </View>
            {standings.map((team) => {
              const isFB = team.teamName.includes("Fenerbahçe");
              return (
                <View
                  key={team.teamId}
                  style={[
                    styles.standingsRow,
                    { borderBottomColor: theme.divider },
                    isFB && { backgroundColor: theme.highlightRow },
                  ]}
                >
                  <Text
                    style={[
                      styles.standingsText,
                      styles.tabularNumbers,
                      {
                        flex: 0.5,
                        fontWeight: "bold",
                        color: isFB ? theme.accent : theme.text,
                      },
                    ]}
                  >
                    {team.rank}
                  </Text>
                  <View style={styles.standingsTeamCell}>
                    <CloudinaryImage
                      publicId={team.badge}
                      style={{ width: 20, height: 20, marginRight: 8 }}
                      contentFit="contain"
                    />
                    <Text
                      style={[
                        styles.standingsText,
                        {
                          color: theme.text,
                          fontWeight: isFB ? "bold" : "normal",
                          fontSize: 13,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {team.teamName}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.standingsText,
                      styles.tabularNumbers,
                      {
                        flex: 1,
                        textAlign: "center",
                        color: theme.secondaryText,
                      },
                    ]}
                  >
                    {team.played}
                  </Text>
                  <Text
                    style={[
                      styles.standingsText,
                      styles.tabularNumbers,
                      {
                        flex: 1,
                        textAlign: "center",
                        color: theme.secondaryText,
                      },
                    ]}
                  >
                    {team.goalDifference > 0
                      ? `+${team.goalDifference}`
                      : team.goalDifference}
                  </Text>
                  <Text
                    style={[
                      styles.standingsText,
                      styles.tabularNumbers,
                      {
                        flex: 1,
                        textAlign: "center",
                        fontWeight: "bold",
                        color: theme.text,
                      },
                    ]}
                  >
                    {team.points}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            HABERLER
          </Text>
          <TouchableOpacity onPress={() => router.push("/haberler")}>
            <Text style={[styles.sectionLink, { color: theme.accent }]}>
              + Tüm Haberler
            </Text>
          </TouchableOpacity>
        </View>

        {newsLoading && news.length === 0 ? (
          <View style={styles.newsList}>
            <NewsCardSkeleton />
            <NewsCardSkeleton />
          </View>
        ) : news.length > 0 ? (
          <View style={styles.newsList}>
            <TouchableOpacity
              style={[
                styles.featuredNewsCard,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border,
                },
              ]}
              onPress={() => openInAppUrl(news[0].link)}
              activeOpacity={0.85}
            >
              <Image
                source={{ uri: news[0].image }}
                style={styles.featuredNewsImage}
                resizeMode="cover"
              />
              <View style={styles.featuredNewsContent}>
                <View style={styles.newsTag}>
                  <Text style={styles.newsTagText}>{news[0].category}</Text>
                </View>
                <Text
                  style={[styles.featuredNewsTitle, { color: theme.text }]}
                  numberOfLines={3}
                >
                  {news[0].title}
                </Text>
                <Text style={[styles.newsDate, { color: theme.secondaryText }]}>
                  {news[0].date}
                </Text>
              </View>
            </TouchableOpacity>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.newsGridRow}
            >
              {news.slice(1).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.smallNewsCard,
                    {
                      backgroundColor: theme.cardBackground,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={() => openInAppUrl(item.link)}
                  activeOpacity={0.85}
                >
                  {item.image ? (
                    <Image
                      source={{ uri: item.image }}
                      style={styles.smallNewsImagePlaceholder}
                    />
                  ) : (
                    <View
                      style={[
                        styles.smallNewsImagePlaceholder,
                        { backgroundColor: theme.placeholder },
                      ]}
                    />
                  )}
                  <View style={styles.smallNewsContent}>
                    <Text
                      style={[styles.smallNewsTagText, { color: theme.accent }]}
                      numberOfLines={1}
                    >
                      {item.category}
                    </Text>
                    <Text
                      style={[styles.smallNewsTitle, { color: theme.text }]}
                      numberOfLines={3}
                    >
                      {item.title}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : (
          <Text style={{ color: theme.secondaryText, paddingHorizontal: 16 }}>
            Haber bulunamadı.
          </Text>
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabularNumbers: {
    fontVariant: ["tabular-nums"],
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    gap: 10,
  },
  quickActionBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: Radius.md,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  quickActionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  heroContainer: {
    width: "100%",
    minHeight: 330,
    position: "relative",
    paddingBottom: 18,
  },
  heroImage: {
    ...StyleSheet.absoluteFill,
    width: "100%",
    height: "100%",
  },
  heroContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    alignItems: "center",
    width: "100%",
  },
  heroBranchBar: {
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 20,
    padding: 3,
    marginBottom: 10,
  },
  heroBranchTab: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 16,
  },
  heroBranchTabActive: {},
  heroBranchTabText: {
    color: "rgba(255, 255, 255, 0.78)",
    fontSize: 12,
    fontWeight: "600",
  },
  heroBranchTabTextActive: {
    fontWeight: "bold",
  },
  heroBadge: {
    backgroundColor: "rgba(255, 237, 0, 0.18)",
    borderWidth: 1,
    borderColor: "#FFED00",
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 10,
  },
  heroBadgeText: {
    color: "#FFED00",
    fontSize: 11,
    fontWeight: "bold",
  },
  heroMatchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 6,
  },
  heroTeam: {
    alignItems: "center",
    flex: 1,
  },
  heroLogo: {
    width: 52,
    height: 52,
    marginBottom: 6,
  },
  heroTeamName: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  heroScoreBoard: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1.2,
  },
  heroDate: {
    color: "#FFFFFF",
    fontSize: 11,
    opacity: 0.85,
    marginBottom: 2,
    textAlign: "center",
  },
  heroTime: {
    color: "#FFED00",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 1,
  },
  heroStadium: {
    color: "#FFFFFF",
    fontSize: 9,
    opacity: 0.78,
    marginTop: 3,
    textAlign: "center",
  },
  heroWeatherText: {
    color: "#FFED00",
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 3,
  },
  liveBannerWrap: {
    marginTop: 12,
    alignItems: "center",
  },
  countdownContainer: {
    marginTop: 12,
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.42)",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 237, 0, 0.28)",
  },
  countdownTitle: {
    color: "#FFED00",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 6,
  },
  countdownRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  countdownBox: {
    backgroundColor: "rgba(7, 33, 70, 0.92)",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 44,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 237, 0, 0.35)",
  },
  countdownNumber: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },
  countdownLabel: {
    color: "#FFED00",
    fontSize: 8,
    fontWeight: "bold",
    marginTop: 1,
  },
  countdownColon: {
    color: "#FFED00",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 8,
  },
  matchDayBanner: {
    marginTop: 12,
    backgroundColor: "#FFED00",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  matchDayBannerText: {
    color: "#072146",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  heroButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    width: "100%",
  },
  heroActionBtn: {
    flex: 1,
    backgroundColor: "#FFED00",
    paddingVertical: 9,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  heroActionBtnText: {
    color: "#072146",
    fontSize: 12,
    fontWeight: "bold",
  },
  heroSecondaryBtn: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.32)",
    paddingVertical: 9,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  heroSecondaryBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  historyCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 15,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: "rgba(255, 237, 0, 0.35)",
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  historyTag: {
    color: "#FFED00",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  historyScoreBadge: {
    backgroundColor: "#FFED00",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  historyScoreText: {
    color: "#072146",
    fontSize: 10,
    fontWeight: "900",
  },
  historyTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  historyDesc: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 12,
    lineHeight: 17,
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
  standingsContainer: {
    marginHorizontal: 16,
    borderRadius: Radius.md,
    paddingVertical: 6,
    borderWidth: 1,
  },
  standingsHeaderRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  standingsHeaderText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  standingsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  standingsTeamCell: {
    flex: 3,
    flexDirection: "row",
    alignItems: "center",
  },
  standingsText: {
    fontSize: 14,
  },
  matchList: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  newsList: {
    paddingHorizontal: 16,
  },
  featuredNewsCard: {
    borderRadius: Radius.md,
    overflow: "hidden",
    marginBottom: 14,
    borderWidth: 1,
  },
  featuredNewsImage: {
    width: "100%",
    height: 196,
  },
  featuredNewsContent: {
    padding: 15,
  },
  newsTag: {
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  newsTagText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  featuredNewsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    lineHeight: 22,
  },
  newsDate: {
    fontSize: 11,
  },
  newsGridRow: {
    flexDirection: "row",
    paddingRight: 16,
    paddingBottom: 8,
  },
  smallNewsCard: {
    width: 164,
    marginRight: 12,
    borderRadius: Radius.md,
    overflow: "hidden",
    borderWidth: 1,
  },
  smallNewsImagePlaceholder: {
    width: "100%",
    height: 100,
  },
  smallNewsContent: {
    padding: 12,
  },
  smallNewsTagText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  smallNewsTitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
});
