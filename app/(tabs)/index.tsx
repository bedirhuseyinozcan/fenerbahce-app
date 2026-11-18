import CloudinaryImage from "@/components/CloudinaryImage";
import MatchCard from "@/components/MatchCard";
import Colors from "@/constants/Colors";
import { getTodayHistoricalEvent } from "@/data/historyData";
import {
  fallbackCuratedFixtures,
  fetchFixtures,
  getCachedFixturesSync,
} from "@/services/fixtureService";
import { fetchNews } from "@/services/newsService";
import {
  fetchSuperLigStandings,
  getCachedStandingsSync,
} from "@/services/standingsService";
import {
  fetchKadikoyWeather,
  MatchWeatherInfo,
} from "@/services/weatherService";
import { MatchData, NewsData, TeamStanding } from "@/types";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
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
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [allFixtures, setAllFixtures] = useState<MatchData[]>(
    () => getCachedFixturesSync() || [],
  );
  const [selectedHeroBranch, setSelectedHeroBranch] = useState<
    "Futbol" | "Basketbol" | "Voleybol"
  >("Futbol");
  const [loading, setLoading] = useState(() => !getCachedFixturesSync());
  const [refreshing, setRefreshing] = useState(false);

  const [news, setNews] = useState<NewsData[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  const [standings, setStandings] = useState<TeamStanding[]>(() =>
    (getCachedStandingsSync("superlig") || []).slice(0, 5),
  );
  const [weather, setWeather] = useState<MatchWeatherInfo | null>(null);
  const todayHistory = useMemo(() => getTodayHistoricalEvent(), []);

  const loadData = useCallback(async (force: boolean = false, silent: boolean = false) => {
    if (!silent) {
      setNewsLoading(true);
    }

    fetchFixtures(force).then((fixturesData) => {
      setAllFixtures(fixturesData);
      setLoading(false);
      setRefreshing(false);
    });

    fetchSuperLigStandings(force).then((standingsData) => {
      setStandings(standingsData.slice(0, 5));
    });

    fetchNews().then((newsData) => {
      setNews(newsData.slice(0, 5));
      setNewsLoading(false);
    });

    fetchKadikoyWeather().then((w) => {
      if (w) setWeather(w);
    });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Canlı maç varsa 20 saniyede bir, yoksa 60 saniyede bir otomatik güncelleme (K2 düzeltmesi)
  useEffect(() => {
    const hasLive = allFixtures.some((m) => m.status === "live");
    const intervalMs = hasLive ? 20000 : 60000;
    const timer = setInterval(() => {
      loadData(true, true);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [loadData, allFixtures]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(true, true);
  }, [loadData]);

  const nextMatch = useMemo(() => {
    // Önce seçili branşta canlı maç var mı bak
    const branchLive = allFixtures.find(
      (m) => m.branch === selectedHeroBranch && m.status === "live",
    );
    if (branchLive) return branchLive;

    // Sonra seçili branşta yaklaşan maç var mı bak
    const branchUpcoming = allFixtures.find(
      (m) =>
        m.branch === selectedHeroBranch &&
        m.status !== "finished" &&
        m.homeScore === null &&
        m.awayScore === null,
    );
    if (branchUpcoming) return branchUpcoming;

    const anyBranchMatch = allFixtures.find(
      (m) => m.branch === selectedHeroBranch,
    );
    if (anyBranchMatch) return anyBranchMatch;

    return allFixtures[0] || null;
  }, [allFixtures, selectedHeroBranch]);

  const upcomingMatches = useMemo(() => {
    const liveAndUpcoming = allFixtures.filter(
      (m) =>
        m.status === "live" ||
        (m.homeScore === null && m.awayScore === null),
    );
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

  const isNextMatchSameCalendarDay = useMemo(() => {
    if (!nextMatch?.rawDate) return false;
    const d1 = new Date(nextMatch.rawDate);
    const d2 = new Date();
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }, [nextMatch?.rawDate]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.brand.navy}
          colors={[Colors.brand.navy, Colors.brand.yellow]}
        />
      }
    >
      {nextMatch ? (
        <View style={[styles.heroContainer, { marginTop: insets.top }]}>
          <Image
            source={{
              uri: "https://media.fenerbahce.org/getmedia/5c3702c2-d352-45e3-b09e-7341857c50be/stad.jpg",
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "rgba(7, 33, 70, 0.88)" },
            ]}
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
                      isSelected && styles.heroBranchTabActive,
                    ]}
                    onPress={() => setSelectedHeroBranch(branch)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.heroBranchTabText,
                        isSelected && styles.heroBranchTabTextActive,
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
                {nextMatch.status === "live" ||
                (nextMatch.homeScore != null && nextMatch.awayScore != null) ? (
                  <>
                    <Text style={styles.heroDate}>{nextMatch.date}</Text>
                    <Text style={styles.heroTime}>
                      {nextMatch.homeScore ?? "0"} - {nextMatch.awayScore ?? "0"}
                    </Text>
                    <Text style={styles.heroStadium} numberOfLines={1}>
                      📍 {nextMatch.stadium}
                    </Text>
                    {weather && (
                      <Text
                        style={{
                          color: Colors.brand.yellow,
                          fontSize: 10,
                          fontWeight: "bold",
                          marginTop: 2,
                        }}
                      >
                        {weather.emoji} Kadıköy {weather.temperatureC}°C •{" "}
                        {weather.conditionLabel}
                      </Text>
                    )}
                  </>
                ) : (
                  <>
                    <Text style={styles.heroDate}>{nextMatch.date}</Text>
                    <Text style={styles.heroTime}>{nextMatch.time}</Text>
                    <Text style={styles.heroStadium} numberOfLines={1}>
                      📍 {nextMatch.stadium}
                    </Text>
                    {weather && (
                      <Text
                        style={{
                          color: Colors.brand.yellow,
                          fontSize: 10,
                          fontWeight: "bold",
                          marginTop: 2,
                        }}
                      >
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

            {nextMatch.status === "live" ? (
              <View
                style={[styles.matchDayBanner, { backgroundColor: "#E53935" }]}
              >
                <Text
                  style={[styles.matchDayBannerText, { color: "#FFFFFF" }]}
                >
                  🔴 CANLI OYNANIYOR {nextMatch.liveClock ? `• ${nextMatch.liveClock}` : ""}
                </Text>
              </View>
            ) : !countdown.isPast ? (
              <View style={styles.countdownContainer}>
                <Text style={styles.countdownTitle}>
                  ⚡ BAŞLAMASINA KALAN SÜRE
                </Text>
                <View style={styles.countdownRow}>
                  <View style={styles.countdownBox}>
                    <Text style={styles.countdownNumber}>
                      {String(countdown.days).padStart(2, "0")}
                    </Text>
                    <Text style={styles.countdownLabel}>GÜN</Text>
                  </View>
                  <Text style={styles.countdownColon}>:</Text>
                  <View style={styles.countdownBox}>
                    <Text style={styles.countdownNumber}>
                      {String(countdown.hours).padStart(2, "0")}
                    </Text>
                    <Text style={styles.countdownLabel}>SAAT</Text>
                  </View>
                  <Text style={styles.countdownColon}>:</Text>
                  <View style={styles.countdownBox}>
                    <Text style={styles.countdownNumber}>
                      {String(countdown.minutes).padStart(2, "0")}
                    </Text>
                    <Text style={styles.countdownLabel}>DAKİKA</Text>
                  </View>
                  <Text style={styles.countdownColon}>:</Text>
                  <View style={styles.countdownBox}>
                    <Text style={styles.countdownNumber}>
                      {String(countdown.seconds).padStart(2, "0")}
                    </Text>
                    <Text style={styles.countdownLabel}>SANİYE</Text>
                  </View>
                </View>
              </View>
            ) : nextMatch.status === "finished" ||
              (nextMatch.homeScore != null && nextMatch.awayScore != null) ? (
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
                activeOpacity={0.8}
              >
                <Text style={styles.heroActionBtnText}>Maç Detayı</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.heroSecondaryBtn}
                onPress={() => router.push("/fikstur")}
                activeOpacity={0.8}
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
              marginTop: insets.top,
              backgroundColor: Colors.brand.navy,
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={Colors.brand.yellow} />
          ) : (
            <Text style={{ color: Colors.brand.white }}>
              Sıradaki maç bilgisi bekleniyor...
            </Text>
          )}
        </View>
      )}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity
          style={[
            styles.quickActionBtn,
            { backgroundColor: theme.cardBackground },
          ]}
          onPress={() => router.push("/sporcular" as any)}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.quickActionIconBox,
              { backgroundColor: "rgba(7, 33, 70, 0.1)" },
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
            { backgroundColor: theme.cardBackground },
          ]}
          onPress={() => router.push("/puan-durumu" as any)}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.quickActionIconBox,
              { backgroundColor: "rgba(255, 160, 0, 0.15)" },
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
            { backgroundColor: theme.cardBackground },
          ]}
          onPress={() => router.push("/haberler" as any)}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.quickActionIconBox,
              { backgroundColor: "rgba(30, 136, 229, 0.15)" },
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
            { backgroundColor: theme.cardBackground },
          ]}
          onPress={() => router.push("/derbi-merkezi" as any)}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.quickActionIconBox,
              { backgroundColor: "rgba(229, 57, 53, 0.15)" },
            ]}
          >
            <Text style={{ fontSize: 18 }}>⚔️</Text>
          </View>
          <Text style={[styles.quickActionText, { color: theme.text }]}>
            Derbi & H2H
          </Text>
        </TouchableOpacity>
      </View>

      {/* TARİHTE BUGÜN KARTI (Faz 4) */}
      <View
        style={{
          marginHorizontal: 16,
          marginTop: 12,
          padding: 14,
          borderRadius: 12,
          backgroundColor: Colors.brand.navy,
          borderWidth: 1,
          borderColor: "rgba(255, 237, 0, 0.35)",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <Text
            style={{
              color: Colors.brand.yellow,
              fontSize: 11,
              fontWeight: "900",
              letterSpacing: 0.6,
            }}
          >
            📜 TARİHTE FENERBAHÇE • {todayHistory.year}
          </Text>
          {todayHistory.score && (
            <View
              style={{
                backgroundColor: Colors.brand.yellow,
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  color: Colors.brand.navy,
                  fontSize: 10,
                  fontWeight: "900",
                }}
              >
                {todayHistory.score}
              </Text>
            </View>
          )}
        </View>
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 14,
            fontWeight: "bold",
            marginBottom: 4,
          }}
        >
          {todayHistory.title}
        </Text>
        <Text
          style={{
            color: "rgba(255, 255, 255, 0.85)",
            fontSize: 12,
            lineHeight: 17,
          }}
        >
          {todayHistory.description}
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            MAÇ TAKVİMİ
          </Text>
          <TouchableOpacity onPress={() => router.push("/fikstur")}>
            <Text style={styles.sectionLink}>+ Tüm Maçlar</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ padding: 20, alignItems: "center" }}>
            <ActivityIndicator size="small" color={Colors.brand.navy} />
          </View>
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
            <Text style={styles.sectionLink}>+ Tüm Liste</Text>
          </TouchableOpacity>
        </View>
        <View
          style={[
            styles.standingsContainer,
            { backgroundColor: theme.cardBackground },
          ]}
        >
          <View style={styles.standingsHeaderRow}>
            <Text style={[styles.standingsHeaderText, { flex: 0.5 }]}>#</Text>
            <Text style={[styles.standingsHeaderText, { flex: 3 }]}>TAKIM</Text>
            <Text
              style={[
                styles.standingsHeaderText,
                { flex: 1, textAlign: "center" },
              ]}
            >
              O
            </Text>
            <Text
              style={[
                styles.standingsHeaderText,
                { flex: 1, textAlign: "center" },
              ]}
            >
              AV
            </Text>
            <Text
              style={[
                styles.standingsHeaderText,
                { flex: 1, textAlign: "center" },
              ]}
            >
              P
            </Text>
          </View>
          {loading ? (
            <View style={{ padding: 20, alignItems: "center" }}>
              <ActivityIndicator color={Colors.brand.navy} />
            </View>
          ) : (
            standings.map((team) => (
              <View
                key={team.teamId}
                style={[
                  styles.standingsRow,
                  team.teamName.includes("Fenerbahçe") && {
                    backgroundColor: "rgba(255, 237, 0, 0.15)",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.standingsText,
                    { flex: 0.5, fontWeight: "bold", color: theme.text },
                  ]}
                >
                  {team.rank}
                </Text>
                <View
                  style={{
                    flex: 3,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
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
                        fontWeight: team.teamName.includes("Fenerbahçe")
                          ? "bold"
                          : "normal",
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
            ))
          )}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            HABERLER
          </Text>
          <TouchableOpacity onPress={() => router.push("/haberler")}>
            <Text style={styles.sectionLink}>+ Tüm Haberler</Text>
          </TouchableOpacity>
        </View>

        {newsLoading ? (
          <View style={{ padding: 20, alignItems: "center" }}>
            <ActivityIndicator size="small" color={Colors.brand.navy} />
          </View>
        ) : news.length > 0 ? (
          <View style={styles.newsList}>
            {/* Featured News */}
            <TouchableOpacity
              style={[
                styles.featuredNewsCard,
                { backgroundColor: theme.cardBackground },
              ]}
              onPress={() => Linking.openURL(news[0].link)}
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
                <Text style={styles.newsDate}>{news[0].date}</Text>
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
                    { backgroundColor: theme.cardBackground },
                  ]}
                  onPress={() => Linking.openURL(item.link)}
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
                      style={[styles.newsTagText, { color: Colors.brand.navy }]}
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
    borderRadius: 12,
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
    paddingBottom: 16,
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
    marginBottom: 8,
  },
  heroBranchTab: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 16,
  },
  heroBranchTabActive: {
    backgroundColor: Colors.brand.yellow,
  },
  heroBranchTabText: {
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: 12,
    fontWeight: "600",
  },
  heroBranchTabTextActive: {
    color: Colors.brand.navy,
    fontWeight: "bold",
  },
  heroBadge: {
    backgroundColor: "rgba(255, 237, 0, 0.2)",
    borderWidth: 1,
    borderColor: Colors.brand.yellow,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 10,
  },
  heroBadgeText: {
    color: Colors.brand.yellow,
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
    color: Colors.brand.white,
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
    color: Colors.brand.white,
    fontSize: 11,
    opacity: 0.85,
    marginBottom: 2,
    textAlign: "center",
  },
  heroTime: {
    color: Colors.brand.yellow,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 1,
  },
  heroStadium: {
    color: Colors.brand.white,
    fontSize: 9,
    opacity: 0.75,
    marginTop: 3,
    textAlign: "center",
  },
  countdownContainer: {
    marginTop: 12,
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 237, 0, 0.25)",
  },
  countdownTitle: {
    color: Colors.brand.yellow,
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
    backgroundColor: "rgba(7, 33, 70, 0.9)",
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
    color: Colors.brand.yellow,
    fontSize: 8,
    fontWeight: "bold",
    marginTop: 1,
  },
  countdownColon: {
    color: Colors.brand.yellow,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 8,
  },
  matchDayBanner: {
    marginTop: 12,
    backgroundColor: Colors.brand.yellow,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  matchDayBannerText: {
    color: Colors.brand.navy,
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
    backgroundColor: Colors.brand.yellow,
    paddingVertical: 9,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  heroActionBtnText: {
    color: Colors.brand.navy,
    fontSize: 12,
    fontWeight: "bold",
  },
  heroSecondaryBtn: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
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
    fontSize: 18,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: "bold",
    color: Colors.brand.navy,
  },

  standingsContainer: {
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  standingsHeaderRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  standingsHeaderText: {
    color: Colors.light.secondaryText,
    fontSize: 12,
    fontWeight: "bold",
  },
  standingsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.02)",
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
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.placeholder,
  },
  featuredNewsImage: {
    width: "100%",
    height: 200,
  },
  featuredNewsContent: {
    padding: 16,
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
    color: Colors.brand.white,
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
    color: Colors.light.secondaryText,
  },

  featuredNewsCardEdit: {
    width: "48%",
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.light.placeholder,
  },
  newsImage: {
    width: "100%",
    height: 120,
  },
  newsBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: Colors.brand.navy,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  newsBadgeText: {
    color: Colors.brand.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  newsContent: {
    padding: 12,
  },
  newsDateEdit: {
    color: Colors.light.secondaryText,
    fontSize: 12,
    marginBottom: 6,
  },
  newsCardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    lineHeight: 20,
  },
  storeBanner: {
    margin: 16,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.placeholder,
  },

  newsGridRow: {
    flexDirection: "row",
    paddingRight: 16,
    paddingBottom: 8,
  },
  smallNewsCard: {
    width: 160,
    marginRight: 12,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.light.placeholder,
  },
  smallNewsImagePlaceholder: {
    width: "100%",
    height: 100,
  },
  smallNewsContent: {
    padding: 12,
  },
  smallNewsTitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
});
