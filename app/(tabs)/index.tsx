import CloudinaryImage from "@/components/CloudinaryImage";
import MatchCard from "@/components/MatchCard";
import Colors from "@/constants/Colors";
import { fetchFixtures } from "@/services/fixtureService";
import { fetchNews } from "@/services/newsService";
import { fetchSuperLigStandings } from "@/services/standingsService";
import { MatchData, NewsData, TeamStanding } from "@/types";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabOneScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [upcomingMatches, setUpcomingMatches] = useState<MatchData[]>([]);
  const [nextMatch, setNextMatch] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);

  const [news, setNews] = useState<NewsData[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  const [standings, setStandings] = useState<TeamStanding[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setNewsLoading(true);

      const [fixturesData, newsData, standingsData] = await Promise.all([
        fetchFixtures(),
        fetchNews(),
        fetchSuperLigStandings(),
      ]);

      setUpcomingMatches(fixturesData.slice(0, 4));

      const futureMatch = fixturesData.find(
        (m) => m.homeScore === null && m.awayScore === null,
      );
      setNextMatch(futureMatch || null);

      setNews(newsData.slice(0, 5));
      setStandings(standingsData.slice(0, 5));

      setLoading(false);
      setNewsLoading(false);
    };

    loadData();
  }, []);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {nextMatch ? (
        <View style={[styles.heroContainer, { marginTop: insets.top }]}>
          <Image
            source={{
              uri: "https://media.fenerbahce.org/getmedia/5c3702c2-d352-45e3-b09e-7341857c50be/stad.jpg",
            }}
            style={styles.heroImage}
          />
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "rgba(7, 33, 70, 0.85)" },
            ]}
          />

          <View style={styles.heroContent}>
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
                <Text style={styles.heroTeamName} numberOfLines={1}>
                  {nextMatch.homeTeam}
                </Text>
              </View>

              <View style={styles.heroScoreBoard}>
                <Text style={styles.heroDate}>{nextMatch.date}</Text>
                <Text style={styles.heroTime}>{nextMatch.time}</Text>
              </View>

              <View style={styles.heroTeam}>
                <CloudinaryImage
                  publicId={nextMatch.awayLogo || "fener.png"}
                  style={styles.heroLogo}
                  contentFit="contain"
                />
                <Text style={styles.heroTeamName} numberOfLines={1}>
                  {nextMatch.awayTeam}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.heroActionBtn}
              onPress={() => router.push(`/mac/${nextMatch.id}` as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.heroActionBtnText}>Maç Merkezine Git</Text>
            </TouchableOpacity>
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
  heroContainer: {
    width: "100%",
    height: 250,
    position: "relative",
  },
  heroImage: {
    ...StyleSheet.absoluteFill,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  heroContent: {
    padding: 20,
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: "100%",
  },
  heroBadge: {
    backgroundColor: Colors.brand.yellow,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
  },
  heroBadgeText: {
    color: Colors.brand.navy,
    fontSize: 12,
    fontWeight: "bold",
  },
  heroMatchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 10,
  },
  heroTeam: {
    alignItems: "center",
    flex: 1,
  },
  heroLogo: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  heroTeamName: {
    color: Colors.brand.white,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  heroScoreBoard: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1.2,
  },
  heroDate: {
    color: Colors.brand.white,
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 4,
  },
  heroTime: {
    color: Colors.brand.white,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 2,
  },
  heroActionBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    marginBottom: 10,
  },
  heroActionBtnText: {
    color: Colors.brand.white,
    fontSize: 14,
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
    resizeMode: "cover",
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
