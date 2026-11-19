import CloudinaryImage from "@/components/CloudinaryImage";
import SoccerPitch from "@/components/SoccerPitch";
import { LivePill } from "@/components/ui/LivePulseDot";
import { Radius } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";
import { useMatchDetailQuery } from "@/hooks/useSportsQueries";
import {
  getPredictionForMatch,
  savePredictionForMatch,
} from "@/services/fanEngagementService";
import { resolveMatchStatus } from "@/services/fixtureService";
import { MatchStat, PredictionData } from "@/types";
import {
  triggerLightHaptic,
  triggerSelectionHaptic,
  triggerSuccessHaptic,
} from "@/utils/haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ActiveTab = "ozet" | "kadrolar" | "istatistikler";

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, brand, isDark } = useAppTheme();

  const matchKey = id || "1";

  const [activeTab, setActiveTab] = useState<ActiveTab>("ozet");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTeamLineup, setSelectedTeamLineup] = useState<"home" | "away">(
    "home",
  );
  const [predHome, setPredHome] = useState<number>(2);
  const [predAway, setPredAway] = useState<number>(0);
  const [savedPred, setSavedPred] = useState<PredictionData | null>(null);

  const { data: match, isLoading, refetch } = useMatchDetailQuery(matchKey);

  useEffect(() => {
    const existingPred = getPredictionForMatch(matchKey);
    if (existingPred) {
      setSavedPred(existingPred);
      setPredHome(existingPred.homeScore);
      setPredAway(existingPred.awayScore);
    } else {
      setSavedPred(null);
      setPredHome(2);
      setPredAway(0);
    }
  }, [matchKey]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleSavePrediction = () => {
    if (!match) return;
    triggerSuccessHaptic();
    const saved = savePredictionForMatch(match.id, predHome, predAway);
    setSavedPred(saved);
  };

  if (isLoading && !match) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={[styles.loadingText, { color: theme.secondaryText }]}>
          Maç Merkezi Yükleniyor...
        </Text>
      </View>
    );
  }

  if (!match) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <Text style={[styles.loadingText, { color: theme.secondaryText }]}>
          Maç bilgisi bulunamadı.
        </Text>
      </View>
    );
  }

  const resolvedStatus = resolveMatchStatus(match);
  const isLive = resolvedStatus === "live";
  const isFinished = resolvedStatus === "finished";
  const isPredictionLocked = isLive || isFinished;
  const homeBarColor = isDark ? brand.yellow : brand.navy;
  const awayBarColor = isDark ? "#64748B" : "#90A4AE";

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" />

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
          style={styles.heroBackground}
        />
        <LinearGradient
          colors={["rgba(4, 21, 46, 0.72)", "rgba(7, 33, 70, 0.94)"]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.topNavigation}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={brand.yellow} />
            <Text style={[styles.backButtonText, { color: brand.yellow }]}>
              Geri
            </Text>
          </TouchableOpacity>

          <View style={styles.badgeContainer}>
            <Text style={[styles.competitionBadgeText, { color: brand.yellow }]}>
              {match.competition} {match.round ? `• ${match.round}` : ""}
            </Text>
          </View>

          <View style={{ width: 60 }} />
        </View>

        <View style={styles.scoreboardRow}>
          <View style={styles.teamColumn}>
            <CloudinaryImage
              publicId={
                match.homeLogo ||
                (match.homeTeam.toLowerCase().includes("fenerbah")
                  ? "fener.png"
                  : "")
              }
              style={styles.teamLogo}
              contentFit="contain"
            />
            <Text style={styles.teamName} numberOfLines={2}>
              {match.homeTeam}
            </Text>
          </View>

          <View style={styles.centerScoreColumn}>
            {isLive ? (
              <View style={styles.scoreBox}>
                <Text style={[styles.scoreText, styles.tabularNumbers]}>
                  {match.homeScore ?? "0"} - {match.awayScore ?? "0"}
                </Text>
                <View style={{ marginTop: 6 }}>
                  <LivePill label={match.liveClock || "CANLI"} />
                </View>
              </View>
            ) : isFinished ? (
              <View style={styles.scoreBox}>
                <Text style={[styles.scoreText, styles.tabularNumbers]}>
                  {match.homeScore} - {match.awayScore}
                </Text>
                <View style={styles.statusPill}>
                  <Text style={styles.statusPillText}>MAÇ SONUCU</Text>
                </View>
              </View>
            ) : (
              <View style={styles.scoreBox}>
                <Text
                  style={[
                    styles.timeText,
                    styles.tabularNumbers,
                    { color: brand.yellow },
                  ]}
                >
                  {match.time}
                </Text>
                <Text style={styles.dateText}>{match.date}</Text>
                <View
                  style={[styles.statusPill, { backgroundColor: brand.yellow }]}
                >
                  <Text
                    style={[styles.statusPillText, { color: brand.navy }]}
                  >
                    YAKLAŞAN MAÇ
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.teamColumn}>
            <CloudinaryImage
              publicId={
                match.awayLogo ||
                (match.awayTeam.toLowerCase().includes("fenerbah")
                  ? "fener.png"
                  : "")
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
                <Text style={[styles.quarterText, { color: brand.yellow }]}>
                  {score}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.venueRow}>
          <Ionicons name="location-sharp" size={13} color={brand.yellow} />
          <Text style={styles.venueText} numberOfLines={1}>
            {match.stadium}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: theme.cardBackground,
            borderBottomColor: theme.border,
          },
        ]}
      >
        {(
          [
            { key: "ozet", label: "ÖZET & OLAYLAR" },
            { key: "kadrolar", label: "KADROLAR" },
            { key: "istatistikler", label: "İSTATİSTİKLER" },
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabButton,
                isActive && { borderBottomColor: brand.yellow },
              ]}
              onPress={() => {
                triggerSelectionHaptic();
                setActiveTab(tab.key);
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: isActive ? theme.accent : theme.secondaryText,
                  },
                  isActive && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        style={styles.contentScrollView}
        contentContainerStyle={{ paddingBottom: 40 }}
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
        {activeTab === "ozet" && (
          <View style={styles.tabContentContainer}>
            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border,
                },
              ]}
            >
              {match.referee ? (
                <>
                  <View style={styles.infoRow}>
                    <Ionicons
                      name="person-circle-outline"
                      size={18}
                      color={theme.accent}
                    />
                    <Text
                      style={[styles.infoLabel, { color: theme.secondaryText }]}
                    >
                      Başhakem:
                    </Text>
                    <Text style={[styles.infoValue, { color: theme.text }]}>
                      {match.referee}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.infoDivider,
                      { backgroundColor: theme.divider },
                    ]}
                  />
                </>
              ) : null}
              <View style={styles.infoRow}>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={theme.accent}
                />
                <Text style={[styles.infoLabel, { color: theme.secondaryText }]}>
                  Tarih & Saat:
                </Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>
                  {match.date} • {match.time}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: "rgba(255, 237, 0, 0.45)",
                },
              ]}
            >
              <View style={styles.predHeader}>
                <Text style={[styles.predTitle, { color: theme.accent }]}>
                  🎯 TARAFTAR SKOR TAHMİNİ
                </Text>
                {savedPred ? (
                  <Text style={[styles.predSaved, { color: brand.winGreen }]}>
                    ✓ Tahminin: {savedPred.homeScore} - {savedPred.awayScore}
                  </Text>
                ) : isPredictionLocked ? (
                  <Text
                    style={[styles.predLocked, { color: theme.secondaryText }]}
                  >
                    {isLive ? "Maç başladı (Kilitli)" : "Maç sona erdi"}
                  </Text>
                ) : null}
              </View>

              <View style={styles.predRow}>
                <View style={styles.predTeamCol}>
                  <Text
                    style={[styles.predTeamLabel, { color: theme.text }]}
                    numberOfLines={1}
                  >
                    {match.homeTeam}
                  </Text>
                  <View style={styles.predStepperRow}>
                    <TouchableOpacity
                      disabled={isPredictionLocked}
                      onPress={() => {
                        triggerLightHaptic();
                        setPredHome((v) => Math.max(0, v - 1));
                      }}
                      style={[
                        styles.stepperBtn,
                        { backgroundColor: brand.navy },
                        isPredictionLocked && styles.stepperDisabled,
                      ]}
                    >
                      <Text style={[styles.stepperText, { color: brand.yellow }]}>
                        -
                      </Text>
                    </TouchableOpacity>
                    <Text
                      style={[
                        styles.predScoreValue,
                        styles.tabularNumbers,
                        { color: theme.text },
                      ]}
                    >
                      {predHome}
                    </Text>
                    <TouchableOpacity
                      disabled={isPredictionLocked}
                      onPress={() => {
                        triggerLightHaptic();
                        setPredHome((v) => v + 1);
                      }}
                      style={[
                        styles.stepperBtn,
                        { backgroundColor: brand.navy },
                        isPredictionLocked && styles.stepperDisabled,
                      ]}
                    >
                      <Text style={[styles.stepperText, { color: brand.yellow }]}>
                        +
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={[styles.predDash, { color: theme.secondaryText }]}>
                  -
                </Text>

                <View style={styles.predTeamCol}>
                  <Text
                    style={[styles.predTeamLabel, { color: theme.text }]}
                    numberOfLines={1}
                  >
                    {match.awayTeam}
                  </Text>
                  <View style={styles.predStepperRow}>
                    <TouchableOpacity
                      disabled={isPredictionLocked}
                      onPress={() => {
                        triggerLightHaptic();
                        setPredAway((v) => Math.max(0, v - 1));
                      }}
                      style={[
                        styles.stepperBtn,
                        { backgroundColor: brand.navy },
                        isPredictionLocked && styles.stepperDisabled,
                      ]}
                    >
                      <Text style={[styles.stepperText, { color: brand.yellow }]}>
                        -
                      </Text>
                    </TouchableOpacity>
                    <Text
                      style={[
                        styles.predScoreValue,
                        styles.tabularNumbers,
                        { color: theme.text },
                      ]}
                    >
                      {predAway}
                    </Text>
                    <TouchableOpacity
                      disabled={isPredictionLocked}
                      onPress={() => {
                        triggerLightHaptic();
                        setPredAway((v) => v + 1);
                      }}
                      style={[
                        styles.stepperBtn,
                        { backgroundColor: brand.navy },
                        isPredictionLocked && styles.stepperDisabled,
                      ]}
                    >
                      <Text style={[styles.stepperText, { color: brand.yellow }]}>
                        +
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {!isPredictionLocked && (
                <TouchableOpacity
                  onPress={handleSavePrediction}
                  style={[styles.predSaveBtn, { backgroundColor: brand.navy }]}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[styles.predSaveBtnText, { color: brand.yellow }]}
                  >
                    {savedPred ? "Tahmini Güncelle" : "Skor Tahminini Kaydet"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={[styles.sectionHeading, { color: theme.text }]}>
              MAÇ OLAYLARI
            </Text>
            {match.events.length > 0 ? (
              <View
                style={[
                  styles.eventsCard,
                  {
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.border,
                  },
                ]}
              >
                {match.events.map((event, index) => {
                  const isHome = event.team === "home";
                  return (
                    <View
                      key={event.id || index}
                      style={[
                        styles.eventRow,
                        { borderBottomColor: theme.divider },
                      ]}
                    >
                      <View style={styles.eventTeamSide}>
                        {isHome && (
                          <View style={styles.eventContentRightAlign}>
                            <Text
                              style={[
                                styles.eventPlayer,
                                { color: theme.text, textAlign: "right" },
                              ]}
                            >
                              {event.player}
                            </Text>
                            {event.detail && (
                              <Text
                                style={[
                                  styles.eventDetail,
                                  {
                                    color: theme.secondaryText,
                                    textAlign: "right",
                                  },
                                ]}
                              >
                                {event.detail}
                              </Text>
                            )}
                          </View>
                        )}
                      </View>

                      <View style={styles.eventCenter}>
                        <View
                          style={[
                            styles.eventIconBadge,
                            { backgroundColor: theme.surfaceSubtle },
                          ]}
                        >
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
                          {event.type === "var" && (
                            <Text
                              style={{
                                fontSize: 10,
                                fontWeight: "bold",
                                color: theme.text,
                              }}
                            >
                              VAR
                            </Text>
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
                        <Text
                          style={[
                            styles.eventMinute,
                            styles.tabularNumbers,
                            { color: theme.accent },
                          ]}
                        >
                          {event.quarterOrSet
                            ? event.quarterOrSet
                            : `${event.minute}'`}
                        </Text>
                      </View>

                      <View style={styles.eventTeamSide}>
                        {!isHome && (
                          <View style={styles.eventContentLeftAlign}>
                            <Text
                              style={[
                                styles.eventPlayer,
                                { color: theme.text, textAlign: "left" },
                              ]}
                            >
                              {event.player}
                            </Text>
                            {event.detail && (
                              <Text
                                style={[
                                  styles.eventDetail,
                                  {
                                    color: theme.secondaryText,
                                    textAlign: "left",
                                  },
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
                  {
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.border,
                  },
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
                  {isFinished
                    ? "Bu karşılaşma için detaylı dakika olay kaydı paylaşılmadı."
                    : isLive
                      ? "Önemli anlar oluştukça burada listelenecek."
                      : "Maç henüz başlamadığı için önemli an bulunmuyor."}
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === "kadrolar" && (
          <View style={styles.tabContentContainer}>
            <View style={styles.teamToggleRow}>
              <TouchableOpacity
                style={[
                  styles.teamToggleButton,
                  {
                    backgroundColor:
                      selectedTeamLineup === "home"
                        ? brand.navy
                        : theme.cardBackground,
                    borderColor:
                      selectedTeamLineup === "home"
                        ? brand.yellow
                        : theme.border,
                  },
                ]}
                onPress={() => {
                  triggerSelectionHaptic();
                  setSelectedTeamLineup("home");
                }}
              >
                <Text
                  style={[
                    styles.teamToggleText,
                    {
                      color:
                        selectedTeamLineup === "home"
                          ? brand.yellow
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
                  {
                    backgroundColor:
                      selectedTeamLineup === "away"
                        ? brand.navy
                        : theme.cardBackground,
                    borderColor:
                      selectedTeamLineup === "away"
                        ? brand.yellow
                        : theme.border,
                  },
                ]}
                onPress={() => {
                  triggerSelectionHaptic();
                  setSelectedTeamLineup("away");
                }}
              >
                <Text
                  style={[
                    styles.teamToggleText,
                    {
                      color:
                        selectedTeamLineup === "away"
                          ? brand.yellow
                          : theme.secondaryText,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {match.awayTeam}
                </Text>
              </TouchableOpacity>
            </View>

            {(() => {
              const currentLineup =
                selectedTeamLineup === "home"
                  ? match.homeLineup
                  : match.awayLineup;
              const hasConfirmedLineup =
                currentLineup.isConfirmed !== false &&
                currentLineup.startingXI &&
                currentLineup.startingXI.length > 0;

              if (!hasConfirmedLineup) {
                return (
                  <View
                    style={[
                      styles.emptyCard,
                      {
                        backgroundColor: theme.cardBackground,
                        borderColor: theme.border,
                        paddingVertical: 36,
                        paddingHorizontal: 20,
                      },
                    ]}
                  >
                    <Ionicons
                      name="shirt-outline"
                      size={36}
                      color={theme.accent}
                    />
                    <Text
                      style={{
                        color: theme.text,
                        fontSize: 15,
                        fontWeight: "bold",
                        marginTop: 12,
                        textAlign: "center",
                      }}
                    >
                      Resmi Kadro Henüz Yayınlanmadı
                    </Text>
                    <Text
                      style={[
                        styles.emptyText,
                        { color: theme.secondaryText, marginTop: 6 },
                      ]}
                    >
                      Bu karşılaşma için resmi maç kadrosu açıklandığında veya
                      sağlayıcı tarafından paylaşıldığında burada yer alacaktır.
                    </Text>
                    {currentLineup.coach ? (
                      <View
                        style={{
                          marginTop: 14,
                          backgroundColor: theme.badgeBg,
                          paddingHorizontal: 14,
                          paddingVertical: 6,
                          borderRadius: 12,
                        }}
                      >
                        <Text
                          style={{
                            color: theme.badgeText,
                            fontSize: 12,
                            fontWeight: "bold",
                          }}
                        >
                          Teknik Direktör: {currentLineup.coach}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                );
              }

              return (
                <>
                  <SoccerPitch
                    lineup={currentLineup}
                    teamName={
                      selectedTeamLineup === "home"
                        ? match.homeTeam
                        : match.awayTeam
                    }
                    isFenerbahce={
                      selectedTeamLineup === "home"
                        ? match.homeTeam.toLowerCase().includes("fenerbah")
                        : match.awayTeam.toLowerCase().includes("fenerbah")
                    }
                    branch={match.branch}
                  />

                  {currentLineup.substitutes.length > 0 && (
                    <View
                      style={[
                        styles.subsCard,
                        {
                          backgroundColor: theme.cardBackground,
                          borderColor: theme.border,
                        },
                      ]}
                    >
                      <Text
                        style={[styles.subsHeading, { color: theme.text }]}
                      >
                        YEDEKLER
                      </Text>
                      <View style={styles.subsGrid}>
                        {currentLineup.substitutes.map((sub) => (
                          <View key={sub.id} style={styles.subItem}>
                            <View
                              style={[
                                styles.subNumberBadge,
                                { backgroundColor: brand.navy },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.subNumberText,
                                  { color: brand.yellow },
                                ]}
                              >
                                {sub.number}
                              </Text>
                            </View>
                            <Text
                              style={[styles.subNameText, { color: theme.text }]}
                              numberOfLines={1}
                            >
                              {sub.name}
                            </Text>
                            <View style={styles.subMetaRight}>
                              {typeof sub.goals === "number" &&
                              sub.goals > 0 ? (
                                <View
                                  style={[
                                    styles.subEventBadge,
                                    { backgroundColor: theme.surfaceSubtle },
                                  ]}
                                >
                                  <Text
                                    style={{ fontSize: 10, color: theme.text }}
                                  >
                                    ⚽{sub.goals > 1 ? ` ${sub.goals}` : ""}
                                  </Text>
                                </View>
                              ) : null}
                              {typeof sub.assists === "number" &&
                              sub.assists > 0 ? (
                                <View
                                  style={[
                                    styles.subEventBadge,
                                    { backgroundColor: "#FFD700" },
                                  ]}
                                >
                                  <MaterialCommunityIcons
                                    name="shoe-cleat"
                                    size={11}
                                    color={brand.navy}
                                  />
                                  {sub.assists > 1 ? (
                                    <Text
                                      style={{
                                        fontSize: 9,
                                        fontWeight: "800",
                                        color: brand.navy,
                                      }}
                                    >
                                      {sub.assists}
                                    </Text>
                                  ) : null}
                                </View>
                              ) : null}
                              <Text
                                style={[
                                  styles.subPosText,
                                  { color: theme.secondaryText },
                                ]}
                              >
                                {sub.position}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </>
              );
            })()}
          </View>
        )}

        {activeTab === "istatistikler" && (
          <View style={styles.tabContentContainer}>
            <View
              style={[
                styles.statsHeaderRow,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text
                style={[styles.statsTeamName, { color: theme.accent }]}
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
                  { color: theme.text, textAlign: "right" },
                ]}
                numberOfLines={1}
              >
                {match.awayTeam}
              </Text>
            </View>

            {match.stats.length > 0 ? (
              <View
                style={[
                  styles.statsListCard,
                  {
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.border,
                  },
                ]}
              >
                {match.stats.map((stat: MatchStat, index: number) => (
                  <View key={index} style={styles.statRow}>
                    <View style={styles.statValuesRow}>
                      <Text
                        style={[
                          styles.statValueText,
                          styles.tabularNumbers,
                          { color: theme.accent, fontWeight: "bold" },
                        ]}
                      >
                        {stat.homeValue}
                      </Text>
                      <Text
                        style={[styles.statLabelText, { color: theme.text }]}
                      >
                        {stat.label}
                      </Text>
                      <Text
                        style={[
                          styles.statValueText,
                          styles.tabularNumbers,
                          { color: theme.secondaryText, fontWeight: "bold" },
                        ]}
                      >
                        {stat.awayValue}
                      </Text>
                    </View>

                    <View style={styles.statBarTrack}>
                      <View
                        style={[
                          styles.statBarFillHome,
                          {
                            width: `${stat.homePercentage}%`,
                            backgroundColor: homeBarColor,
                          },
                        ]}
                      />
                      <View
                        style={[
                          styles.statBarFillAway,
                          {
                            width: `${100 - stat.homePercentage}%`,
                            backgroundColor: awayBarColor,
                          },
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View
                style={[
                  styles.emptyCard,
                  {
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Ionicons
                  name="stats-chart-outline"
                  size={32}
                  color={theme.secondaryText}
                />
                <Text
                  style={[styles.emptyText, { color: theme.secondaryText }]}
                >
                  Bu karşılaşma için resmi istatistik verisi henüz
                  yayınlanmadı.
                </Text>
              </View>
            )}
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
  tabularNumbers: {
    fontVariant: ["tabular-nums"],
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
  },
  heroBackground: {
    ...StyleSheet.absoluteFill,
    width: "100%",
    height: "100%",
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
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: 16,
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
  predHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  predTitle: {
    fontSize: 13,
    fontWeight: "900",
  },
  predSaved: {
    fontSize: 11,
    fontWeight: "bold",
  },
  predLocked: {
    fontSize: 11,
    fontWeight: "600",
  },
  predRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginVertical: 6,
  },
  predTeamCol: {
    alignItems: "center",
    flex: 1,
  },
  predTeamLabel: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 6,
  },
  predStepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stepperBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperDisabled: {
    opacity: 0.45,
  },
  stepperText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  predScoreValue: {
    fontSize: 20,
    fontWeight: "900",
    minWidth: 24,
    textAlign: "center",
  },
  predDash: {
    fontSize: 18,
    fontWeight: "900",
  },
  predSaveBtn: {
    marginTop: 10,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: "center",
  },
  predSaveBtnText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  eventsCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
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
  },
  emptyCard: {
    padding: 30,
    borderRadius: Radius.md,
    borderWidth: 1,
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
    alignItems: "center",
  },
  teamToggleText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  subsCard: {
    marginTop: 14,
    padding: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
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
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  subNumberText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  subNameText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
  },
  subMetaRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  subPosText: {
    fontSize: 12,
    fontWeight: "600",
  },
  subEventBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  statsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
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
    borderRadius: Radius.md,
    borderWidth: 1,
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
