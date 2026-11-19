import { Radius } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";
import { GoalAlertBanner } from "@/features/matches/components/GoalAlertBanner";
import { MatchHeroHeader } from "@/features/matches/components/MatchHeroHeader";
import { MatchLineupsTab } from "@/features/matches/components/MatchLineupsTab";
import { MatchStatsTab } from "@/features/matches/components/MatchStatsTab";
import { MatchTimeline } from "@/features/matches/components/MatchTimeline";
import { ScorePredictionCard } from "@/features/matches/components/ScorePredictionCard";
import { useMatchDetailQuery } from "@/hooks/useSportsQueries";
import {
  getPredictionForMatch,
  savePredictionForMatch,
} from "@/services/fanEngagementService";
import { resolveMatchStatus } from "@/services/fixtureService";
import { PredictionData } from "@/types";
import {
  triggerSelectionHaptic,
  triggerSuccessHaptic,
} from "@/utils/haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
  const { theme, brand } = useAppTheme();

  const matchKey = id || "1";

  const [activeTab, setActiveTab] = useState<ActiveTab>("ozet");
  const [refreshing, setRefreshing] = useState(false);
  const [predHome, setPredHome] = useState<number>(2);
  const [predAway, setPredAway] = useState<number>(0);
  const [savedPred, setSavedPred] = useState<PredictionData | null>(null);
  const [showGoalAlert, setShowGoalAlert] = useState(false);

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
    setShowGoalAlert(false);
  }, [matchKey]);

  const prevFbScoreRef = useRef<number | null>(null);
  useEffect(() => {
    prevFbScoreRef.current = null;
  }, [matchKey]);

  useEffect(() => {
    if (!match) return;
    const isLiveNow = resolveMatchStatus(match) === "live";
    if (!isLiveNow) return;

    const isFbHome = match.homeTeam.toLowerCase().includes("fenerbah");
    const rawFbScore = isFbHome ? match.homeScore : match.awayScore;
    if (rawFbScore == null) return;

    const fbScore = parseInt(String(rawFbScore), 10);
    if (isNaN(fbScore)) return;

    if (prevFbScoreRef.current !== null && fbScore > prevFbScoreRef.current) {
      triggerSuccessHaptic();
      setShowGoalAlert(true);
    }
    prevFbScoreRef.current = fbScore;
  }, [match]);

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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" />

      <MatchHeroHeader
        match={match}
        isLive={isLive}
        isFinished={isFinished}
        topInset={insets.top}
        onBack={() => router.back()}
      />

      <GoalAlertBanner
        visible={showGoalAlert}
        scoreText={`${match.homeTeam} ${match.homeScore ?? "0"} - ${match.awayScore ?? "0"} ${match.awayTeam}`}
        onDismiss={() => setShowGoalAlert(false)}
      />

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

            <ScorePredictionCard
              match={match}
              isLive={isLive}
              isFinished={isFinished}
              predHome={predHome}
              predAway={predAway}
              savedPred={savedPred}
              onChangeHome={(delta) =>
                setPredHome((v) => Math.max(0, v + delta))
              }
              onChangeAway={(delta) =>
                setPredAway((v) => Math.max(0, v + delta))
              }
              onSave={handleSavePrediction}
            />

            <MatchTimeline
              events={match.events}
              commentary={match.commentary}
              isLive={isLive}
              isFinished={isFinished}
            />
          </View>
        )}

        {activeTab === "kadrolar" && <MatchLineupsTab match={match} />}

        {activeTab === "istatistikler" && <MatchStatsTab match={match} />}
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
});
