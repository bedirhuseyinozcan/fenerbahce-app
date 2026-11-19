import MatchCard from "@/components/MatchCard";
import { LivePulseDot } from "@/components/ui/LivePulseDot";
import { MatchCardSkeleton } from "@/components/ui/Skeleton";
import { Radius } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";
import { useFixturesQuery } from "@/hooks/useSportsQueries";
import { resolveMatchStatus } from "@/services/fixtureService";
import { MatchData } from "@/types";
import { triggerSelectionHaptic } from "@/utils/haptics";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BRANCHES = ["Tümü", "Futbol", "Basketbol", "Voleybol"];

export default function FiksturScreen() {
  const router = useRouter();
  const { theme, brand } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [selectedBranch, setSelectedBranch] = useState("Tümü");
  const [statusTab, setStatusTab] = useState<"upcoming" | "past">("upcoming");
  const [refreshing, setRefreshing] = useState(false);

  const { data: matches = [], isLoading, refetch } = useFixturesQuery();
  const loading = isLoading && matches.length === 0;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const isLiveOrUpcoming = (m: MatchData) => {
    const st = resolveMatchStatus(m);
    return st === "live" || st === "upcoming";
  };

  const hasLiveInSelectedBranch = useMemo(() => {
    return matches.some(
      (m) =>
        (selectedBranch === "Tümü" || m.branch === selectedBranch) &&
        resolveMatchStatus(m) === "live",
    );
  }, [matches, selectedBranch]);

  const upcomingCount = useMemo(() => {
    return matches.filter(
      (m) =>
        (selectedBranch === "Tümü" || m.branch === selectedBranch) &&
        isLiveOrUpcoming(m),
    ).length;
  }, [matches, selectedBranch]);

  const pastCount = useMemo(() => {
    return matches.filter(
      (m) =>
        (selectedBranch === "Tümü" || m.branch === selectedBranch) &&
        !isLiveOrUpcoming(m),
    ).length;
  }, [matches, selectedBranch]);

  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      const matchBranch =
        selectedBranch === "Tümü" || match.branch === selectedBranch;
      const upcomingOrLive = isLiveOrUpcoming(match);
      const matchStatus =
        statusTab === "upcoming" ? upcomingOrLive : !upcomingOrLive;
      return matchBranch && matchStatus;
    });
  }, [matches, selectedBranch, statusTab]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.segmentContainer}>
        <View
          style={[
            styles.segmentWrapper,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              statusTab === "upcoming" && {
                backgroundColor: brand.navy,
              },
            ]}
            onPress={() => {
              triggerSelectionHaptic();
              setStatusTab("upcoming");
            }}
            activeOpacity={0.8}
          >
            <View style={styles.segmentLabelRow}>
              {hasLiveInSelectedBranch && <LivePulseDot size={6} />}
              <Text
                style={[
                  styles.segmentText,
                  {
                    color:
                      statusTab === "upcoming"
                        ? brand.yellow
                        : theme.secondaryText,
                  },
                  statusTab === "upcoming" && { fontWeight: "bold" },
                ]}
              >
                {hasLiveInSelectedBranch ? "Canlı & Gelecek" : "⏳ Gelecek"} (
                {upcomingCount})
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentBtn,
              statusTab === "past" && { backgroundColor: brand.navy },
            ]}
            onPress={() => {
              triggerSelectionHaptic();
              setStatusTab("past");
            }}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentText,
                {
                  color:
                    statusTab === "past" ? brand.yellow : theme.secondaryText,
                },
                statusTab === "past" && { fontWeight: "bold" },
              ]}
            >
              🏆 Sonuçlar ({pastCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={BRANCHES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const isActive = selectedBranch === item;
            return (
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  {
                    backgroundColor: isActive
                      ? brand.yellow
                      : theme.cardBackground,
                    borderColor: isActive ? brand.yellow : theme.border,
                  },
                ]}
                onPress={() => {
                  triggerSelectionHaptic();
                  setSelectedBranch(item);
                }}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: isActive ? brand.navy : theme.text },
                    isActive && { fontWeight: "bold" },
                  ]}
                >
                  {item === "Futbol"
                    ? "⚽ "
                    : item === "Basketbol"
                      ? "🏀 "
                      : item === "Voleybol"
                        ? "🏐 "
                        : ""}
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>

      {loading ? (
        <View style={styles.skeletonList}>
          <MatchCardSkeleton fullWidth />
          <MatchCardSkeleton fullWidth />
          <MatchCardSkeleton fullWidth />
        </View>
      ) : (
        <FlatList
          data={filteredMatches}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.accent}
              colors={[brand.navy, brand.yellow]}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <MatchCard
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
                isFullWidth={true}
                onPress={() => router.push(`/mac/${item.id}` as any)}
              />
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>📅</Text>
              <Text style={[styles.emptyText, { color: theme.text }]}>
                {statusTab === "upcoming"
                  ? "Bu branşta planlanmış gelecek maç bulunamadı."
                  : "Bu branşta kayıtlı bitmiş maç bulunamadı."}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  segmentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  segmentWrapper: {
    flexDirection: "row",
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  segmentText: {
    fontSize: 13,
  },
  filterContainer: {
    paddingVertical: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterText: {
    fontSize: 13,
  },
  skeletonList: {
    paddingHorizontal: 16,
    gap: 4,
  },
  listContent: {
    paddingTop: 4,
    alignItems: "center",
  },
  cardWrapper: {
    width: "100%",
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 6,
  },
  emptyContainer: {
    padding: 48,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
});
