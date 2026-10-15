import CloudinaryImage from "@/components/CloudinaryImage";
import SoccerPitch from "@/components/SoccerPitch";
import Colors from "@/constants/Colors";
import { getMatchDetail } from "@/services/matchDetailService";
import { MatchDetailData, MatchStat } from "@/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
type ActiveTab = "ozet" | "kadrolar" | "istatistikler";

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const [activeTab, setActiveTab] = useState<ActiveTab>("ozet");
  const [match, setMatch] = useState<MatchDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTeamLineup, setSelectedTeamLineup] = useState<"home" | "away">(
    "home",
  );

  useEffect(() => {
    const loadMatch = async () => {
      setLoading(true);
      const data = await getMatchDetail(id || "1");
      setMatch(data);
      setLoading(false);
    };

    loadMatch();
  }, [id]);

  if (loading || !match) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={Colors.brand.navy} />
        <Text style={[styles.loadingText, { color: theme.secondaryText }]}>
          Maç Merkezi Yükleniyor...
        </Text>
      </View>
    );
  }

  const isFinished = match.homeScore !== null && match.awayScore !== null;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" />

      {/* 1. HERO SCOREBOARD (Üst Skor Tabelası) */}
      <View style={[styles.heroContainer, { paddingTop: insets.top }]}>
        <Image
          source={{
            uri: "https://media.fenerbahce.org/getmedia/5c3702c2-d352-45e3-b09e-7341857c50be/stad.jpg",
          }}
          style={styles.heroBackground}
        />
        <View style={styles.heroOverlay} />

        {/* Üst Bar: Geri Dön Butonu ve Lig Başlığı */}
        <View style={styles.topNavigation}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={Colors.brand.yellow}
            />
            <Text style={styles.backButtonText}>Geri</Text>
          </TouchableOpacity>

          <View style={styles.badgeContainer}>
            <Text style={styles.competitionBadgeText}>
              {match.competition} {match.round ? `• ${match.round}` : ""}
            </Text>
          </View>

          <View style={{ width: 60 }} />
        </View>

        {/* Skor Tablosu */}
        <View style={styles.scoreboardRow}>
          {/* Ev Sahibi */}
          <View style={styles.teamColumn}>
            <CloudinaryImage
              publicId={
                match.homeLogo ||
                (match.homeTeam.toLowerCase().includes("fenerbah")
                  ? "fener.png"
                  : "logos/superlig")
              }
              style={styles.teamLogo}
              contentFit="contain"
            />
            <Text style={styles.teamName} numberOfLines={2}>
              {match.homeTeam}
            </Text>
          </View>

          {/* Skor veya Başlama Saati */}
          <View style={styles.centerScoreColumn}>
            {isFinished ? (
              <View style={styles.scoreBox}>
                <Text style={styles.scoreText}>
                  {match.homeScore} - {match.awayScore}
                </Text>
                <View style={styles.statusPill}>
                  <Text style={styles.statusPillText}>MAÇ SONUCU</Text>
                </View>
              </View>
            ) : (
              <View style={styles.scoreBox}>
                <Text style={styles.timeText}>{match.time}</Text>
                <Text style={styles.dateText}>{match.date}</Text>
                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: Colors.brand.yellow },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      { color: Colors.brand.navy },
                    ]}
                  >
                    YAKLAŞAN MAÇ
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Deplasman */}
          <View style={styles.teamColumn}>
            <CloudinaryImage
              publicId={
                match.awayLogo ||
                (match.awayTeam.toLowerCase().includes("fenerbah")
                  ? "fener.png"
                  : "logos/superlig")
              }
              style={styles.teamLogo}
              contentFit="contain"
            />
            <Text style={styles.teamName} numberOfLines={2}>
              {match.awayTeam}
            </Text>
          </View>
        </View>
        {match.quarterScores && match.quarterScores.length > 0 && (
          <View style={styles.quartersRow}>
            {match.quarterScores.map((score, idx) => (
              <View key={idx} style={styles.quarterBadge}>
                <Text style={styles.quarterText}>{score}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Stadyum & Hakem Bilgisi */}
        <View style={styles.venueRow}>
          <Ionicons
            name="location-sharp"
            size={13}
            color={Colors.brand.yellow}
          />
          <Text style={styles.venueText} numberOfLines={1}>
            {match.stadium}
          </Text>
        </View>
      </View>

      {/* 2. SEGMENTED CONTROL TAB BAR */}
      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: theme.cardBackground,
            borderBottomColor: theme.placeholder,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "ozet" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab("ozet")}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === "ozet"
                    ? Colors.brand.navy
                    : theme.secondaryText,
              },
              activeTab === "ozet" && styles.tabTextActive,
            ]}
          >
            ÖZET & OLAYLAR
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "kadrolar" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab("kadrolar")}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === "kadrolar"
                    ? Colors.brand.navy
                    : theme.secondaryText,
              },
              activeTab === "kadrolar" && styles.tabTextActive,
            ]}
          >
            KADROLAR
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "istatistikler" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab("istatistikler")}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === "istatistikler"
                    ? Colors.brand.navy
                    : theme.secondaryText,
              },
              activeTab === "istatistikler" && styles.tabTextActive,
            ]}
          >
            İSTATİSTİKLER
          </Text>
        </TouchableOpacity>
      </View>

      {/* 3. TAB İÇERİKLERİ */}
      <ScrollView
        style={styles.contentScrollView}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* TAB 1: ÖZET VE ZAMAN ÇİZELGESİ */}
        {activeTab === "ozet" && (
          <View style={styles.tabContentContainer}>
            {/* Hakem ve Maç Detay Kartı */}
            <View
              style={[
                styles.infoCard,
                { backgroundColor: theme.cardBackground },
              ]}
            >
              <View style={styles.infoRow}>
                <Ionicons
                  name="person-circle-outline"
                  size={18}
                  color={Colors.brand.navy}
                />
                <Text
                  style={[styles.infoLabel, { color: theme.secondaryText }]}
                >
                  Başhakem:
                </Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>
                  {match.referee || "Halil Umut Meler"}
                </Text>
              </View>
              <View
                style={[
                  styles.infoDivider,
                  { backgroundColor: theme.placeholder },
                ]}
              />
              <View style={styles.infoRow}>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={Colors.brand.navy}
                />
                <Text
                  style={[styles.infoLabel, { color: theme.secondaryText }]}
                >
                  Tarih & Saat:
                </Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>
                  {match.date} • {match.time}
                </Text>
              </View>
            </View>

            {/* Olaylar Zaman Çizelgesi */}
            <Text style={[styles.sectionHeading, { color: theme.text }]}>
              MAÇ OLAYLARI
            </Text>
            {match.events.length > 0 ? (
              <View
                style={[
                  styles.eventsCard,
                  { backgroundColor: theme.cardBackground },
                ]}
              >
                {match.events.map((event, index) => {
                  const isHome = event.team === "home";
                  return (
                    <View key={event.id || index} style={styles.eventRow}>
                      {/* Sol Taraf (Ev Sahibi Olayı) */}
                      <View style={styles.eventTeamSide}>
                        {isHome && (
                          <View style={styles.eventContentRightAlign}>
                            <Text
                              style={[
                                styles.eventPlayer,
                                { color: theme.text },
                              ]}
                            >
                              {event.player}
                            </Text>
                            {event.detail && (
                              <Text
                                style={[
                                  styles.eventDetail,
                                  { color: theme.secondaryText },
                                ]}
                              >
                                {event.detail}
                              </Text>
                            )}
                          </View>
                        )}
                      </View>

                      <View style={styles.eventCenter}>
                        <View style={styles.eventIconBadge}>
                          {event.type === "goal" && (
                            <Text style={{ fontSize: 14 }}>⚽</Text>
                          )}
                          {event.type === "yellow-card" && (
                            <View
                              style={[
                                styles.cardSquare,
                                { backgroundColor: "#FFD600" },
                              ]}
                            />
                          )}
                          {event.type === "red-card" && (
                            <View
                              style={[
                                styles.cardSquare,
                                { backgroundColor: "#D50000" },
                              ]}
                            />
                          )}
                          {event.type === "substitution" && (
                            <Ionicons
                              name="swap-horizontal"
                              size={16}
                              color="#00C853"
                            />
                          )}
                          {event.type === "basket-3pt" && (
                            <Text style={{ fontSize: 11, fontWeight: "bold" }}>
                              🎯 3P
                            </Text>
                          )}
                          {event.type === "basket-2pt" && (
                            <Text style={{ fontSize: 11, fontWeight: "bold" }}>
                              🏀 2P
                            </Text>
                          )}
                          {event.type === "timeout" && (
                            <Text style={{ fontSize: 13 }}>⏱️</Text>
                          )}
                          {event.type === "ace" && (
                            <Text style={{ fontSize: 10, fontWeight: "bold" }}>
                              ⚡ACE
                            </Text>
                          )}
                          {event.type === "block" && (
                            <Text style={{ fontSize: 10, fontWeight: "bold" }}>
                              🧱BLK
                            </Text>
                          )}
                          {event.type === "spike" && (
                            <Text style={{ fontSize: 12 }}>💥</Text>
                          )}
                        </View>
                        <Text style={styles.eventMinute}>
                          {event.quarterOrSet
                            ? event.quarterOrSet
                            : `${event.minute}'`}
                        </Text>
                      </View>

                      {/* Sağ Taraf (Deplasman Olayı) */}
                      <View style={styles.eventTeamSide}>
                        {!isHome && (
                          <View style={styles.eventContentLeftAlign}>
                            <Text
                              style={[
                                styles.eventPlayer,
                                { color: theme.text },
                              ]}
                            >
                              {event.player}
                            </Text>
                            {event.detail && (
                              <Text
                                style={[
                                  styles.eventDetail,
                                  { color: theme.secondaryText },
                                ]}
                              >
                                {event.detail}
                              </Text>
                            )}
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View
                style={[
                  styles.emptyCard,
                  { backgroundColor: theme.cardBackground },
                ]}
              >
                <Ionicons
                  name="time-outline"
                  size={32}
                  color={theme.secondaryText}
                />
                <Text
                  style={[styles.emptyText, { color: theme.secondaryText }]}
                >
                  Maç henüz başlamadığı için önemli an bulunmuyor.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* TAB 2: KADROLAR VE SAHA DİZİLİŞİ */}
        {activeTab === "kadrolar" && (
          <View style={styles.tabContentContainer}>
            {/* Takım Değiştirici Butonlar */}
            <View style={styles.teamToggleRow}>
              <TouchableOpacity
                style={[
                  styles.teamToggleButton,
                  selectedTeamLineup === "home" && {
                    backgroundColor: Colors.brand.navy,
                    borderColor: Colors.brand.yellow,
                  },
                ]}
                onPress={() => setSelectedTeamLineup("home")}
              >
                <Text
                  style={[
                    styles.teamToggleText,
                    {
                      color:
                        selectedTeamLineup === "home"
                          ? Colors.brand.yellow
                          : theme.secondaryText,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {match.homeTeam}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.teamToggleButton,
                  selectedTeamLineup === "away" && {
                    backgroundColor: Colors.brand.navy,
                    borderColor: Colors.brand.yellow,
                  },
                ]}
                onPress={() => setSelectedTeamLineup("away")}
              >
                <Text
                  style={[
                    styles.teamToggleText,
                    {
                      color:
                        selectedTeamLineup === "away"
                          ? Colors.brand.yellow
                          : theme.secondaryText,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {match.awayTeam}
                </Text>
              </TouchableOpacity>
            </View>

            <SoccerPitch
              lineup={
                selectedTeamLineup === "home"
                  ? match.homeLineup
                  : match.awayLineup
              }
              teamName={
                selectedTeamLineup === "home" ? match.homeTeam : match.awayTeam
              }
              isFenerbahce={
                selectedTeamLineup === "home"
                  ? match.homeTeam.toLowerCase().includes("fenerbah")
                  : match.awayTeam.toLowerCase().includes("fenerbah")
              }
              branch={match.branch}
            />

            {/* Yedek Kulübesi Listesi */}
            <View
              style={[
                styles.subsCard,
                { backgroundColor: theme.cardBackground },
              ]}
            >
              <Text style={[styles.subsHeading, { color: theme.text }]}>
                YEDEKLER
              </Text>
              <View style={styles.subsGrid}>
                {(selectedTeamLineup === "home"
                  ? match.homeLineup.substitutes
                  : match.awayLineup.substitutes
                ).map((sub) => (
                  <View key={sub.id} style={styles.subItem}>
                    <View style={styles.subNumberBadge}>
                      <Text style={styles.subNumberText}>{sub.number}</Text>
                    </View>
                    <Text
                      style={[styles.subNameText, { color: theme.text }]}
                      numberOfLines={1}
                    >
                      {sub.name}
                    </Text>
                    <Text
                      style={[
                        styles.subPosText,
                        { color: theme.secondaryText },
                      ]}
                    >
                      {sub.position}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* TAB 3: İSTATİSTİKLER (KARŞILAŞTIRMALI BARLAR) */}
        {activeTab === "istatistikler" && (
          <View style={styles.tabContentContainer}>
            {/* Takım İsimleri Header */}
            <View
              style={[
                styles.statsHeaderRow,
                { backgroundColor: theme.cardBackground },
              ]}
            >
              <Text
                style={[styles.statsTeamName, { color: Colors.brand.navy }]}
                numberOfLines={1}
              >
                {match.homeTeam}
              </Text>
              <Text style={[styles.statsTitle, { color: theme.secondaryText }]}>
                İSTATİSTİK
              </Text>
              <Text
                style={[
                  styles.statsTeamName,
                  { color: "#37474F", textAlign: "right" },
                ]}
                numberOfLines={1}
              >
                {match.awayTeam}
              </Text>
            </View>

            {/* İstatistik Barları */}
            <View
              style={[
                styles.statsListCard,
                { backgroundColor: theme.cardBackground },
              ]}
            >
              {match.stats.map((stat: MatchStat, index: number) => (
                <View key={index} style={styles.statRow}>
                  {/* Sayısal Değerler */}
                  <View style={styles.statValuesRow}>
                    <Text
                      style={[
                        styles.statValueText,
                        { color: Colors.brand.navy, fontWeight: "bold" },
                      ]}
                    >
                      {stat.homeValue}
                    </Text>
                    <Text style={[styles.statLabelText, { color: theme.text }]}>
                      {stat.label}
                    </Text>
                    <Text
                      style={[
                        styles.statValueText,
                        { color: "#455A64", fontWeight: "bold" },
                      ]}
                    >
                      {stat.awayValue}
                    </Text>
                  </View>

                  {/* Görsel Karşılaştırma Barı */}
                  <View style={styles.statBarTrack}>
                    <View
                      style={[
                        styles.statBarFillHome,
                        {
                          width: `${stat.homePercentage}%`,
                          backgroundColor: Colors.brand.navy,
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.statBarFillAway,
                        {
                          width: `${100 - stat.homePercentage}%`,
                          backgroundColor: "#90A4AE",
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },
  heroContainer: {
    position: "relative",
    width: "100%",
    paddingBottom: 16,
    backgroundColor: Colors.brand.navy,
  },
  heroBackground: {
    ...StyleSheet.absoluteFill,
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(7, 33, 70, 0.88)",
  },
  topNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
  },
  backButtonText: {
    color: Colors.brand.yellow,
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 2,
  },
  badgeContainer: {
    backgroundColor: "rgba(255, 237, 0, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 237, 0, 0.3)",
  },
  competitionBadgeText: {
    color: Colors.brand.yellow,
    fontSize: 12,
    fontWeight: "bold",
  },
  scoreboardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  teamColumn: {
    flex: 2,
    alignItems: "center",
  },
  teamLogo: {
    width: 64,
    height: 64,
    marginBottom: 8,
  },
  teamName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  centerScoreColumn: {
    flex: 2.5,
    alignItems: "center",
  },
  scoreBox: {
    alignItems: "center",
  },
  scoreText: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  timeText: {
    color: Colors.brand.yellow,
    fontSize: 26,
    fontWeight: "bold",
  },
  dateText: {
    color: "#CFD8DC",
    fontSize: 12,
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6,
  },
  statusPillText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  venueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    paddingHorizontal: 24,
  },
  venueText: {
    color: "#ECEFF1",
    fontSize: 11,
    marginLeft: 4,
  },
  quartersRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginVertical: 8,
    paddingHorizontal: 16,
    flexWrap: "wrap",
  },
  quarterBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  quarterText: {
    color: Colors.brand.yellow,
    fontSize: 11,
    fontWeight: "bold",
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: {
    borderBottomColor: Colors.brand.yellow,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
  tabTextActive: {
    fontWeight: "800",
  },
  contentScrollView: {
    flex: 1,
  },
  tabContentContainer: {
    padding: 16,
  },
  infoCard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 13,
    marginLeft: 8,
    marginRight: 6,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "bold",
  },
  infoDivider: {
    height: 1,
    marginVertical: 10,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  eventsCard: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#EEEEEE",
  },
  eventTeamSide: {
    flex: 1,
  },
  eventContentRightAlign: {
    alignItems: "flex-end",
    paddingRight: 10,
  },
  eventContentLeftAlign: {
    alignItems: "flex-start",
    paddingLeft: 10,
  },
  eventPlayer: {
    fontSize: 13,
    fontWeight: "bold",
  },
  eventDetail: {
    fontSize: 11,
    marginTop: 2,
  },
  eventCenter: {
    alignItems: "center",
    width: 50,
  },
  eventIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#F0F2F5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  cardSquare: {
    width: 10,
    height: 14,
    borderRadius: 2,
  },
  eventMinute: {
    fontSize: 11,
    fontWeight: "bold",
    color: Colors.brand.navy,
  },
  emptyCard: {
    padding: 30,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 10,
    fontSize: 13,
    textAlign: "center",
  },
  teamToggleRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  teamToggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#CFD8DC",
    alignItems: "center",
  },
  teamToggleText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  subsCard: {
    marginTop: 14,
    padding: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  subsHeading: {
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  subsGrid: {
    gap: 8,
  },
  subItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  subNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.brand.navy,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  subNumberText: {
    color: Colors.brand.yellow,
    fontSize: 11,
    fontWeight: "bold",
  },
  subNameText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
  },
  subPosText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  statsTeamName: {
    fontSize: 13,
    fontWeight: "bold",
    flex: 1,
  },
  statsTitle: {
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
    marginHorizontal: 8,
  },
  statsListCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statRow: {
    marginBottom: 16,
  },
  statValuesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  statValueText: {
    fontSize: 14,
  },
  statLabelText: {
    fontSize: 13,
  },
  statBarTrack: {
    height: 8,
    borderRadius: 4,
    flexDirection: "row",
    overflow: "hidden",
  },
  statBarFillHome: {
    height: "100%",
  },
  statBarFillAway: {
    height: "100%",
  },
});
