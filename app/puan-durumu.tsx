import CloudinaryImage from "@/components/CloudinaryImage";
import { StandingsSkeleton } from "@/components/ui/Skeleton";
import { Radius } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";
import { useStandingsQuery } from "@/hooks/useSportsQueries";
import { StandingsLeagueKey } from "@/services/standingsService";
import { triggerSelectionHaptic } from "@/utils/haptics";
import { Stack } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const LEAGUE_TABS: { key: StandingsLeagueKey; label: string; emoji: string }[] =
  [
    { key: "superlig", label: "Süper Lig", emoji: "⚽" },
    { key: "champions", label: "Şampiyonlar Ligi", emoji: "⭐" },
    { key: "europa", label: "Avrupa Ligi", emoji: "🏆" },
    { key: "euroleague", label: "EuroLeague", emoji: "🏀" },
  ];

function getZoneColor(
  league: StandingsLeagueKey,
  rank: number,
  totalTeams: number,
): string | null {
  if (league === "superlig") {
    if (rank <= 2) return "#10B981";
    if (rank <= 4) return "#3B82F6";
    if (totalTeams >= 16 && rank > totalTeams - 3) return "#EF4444";
  } else if (league === "champions" || league === "europa") {
    if (rank <= 8) return "#10B981";
    if (rank <= 24) return "#F59E0B";
  } else if (league === "euroleague") {
    if (rank <= 6) return "#10B981";
    if (rank <= 10) return "#F59E0B";
  }
  return null;
}

export default function PuanDurumuScreen() {
  const { theme, brand } = useAppTheme();
  const [selectedLeague, setSelectedLeague] =
    useState<StandingsLeagueKey>("superlig");
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: standings = [],
    isLoading,
    refetch,
  } = useStandingsQuery(selectedLeague);

  const loading = isLoading && standings.length === 0;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const isBasketball = selectedLeague === "euroleague";

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: "Canlı Puan Durumu",
          headerStyle: { backgroundColor: brand.navy },
          headerTintColor: brand.yellow,
          headerBackTitle: "Geri",
        }}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.leagueTabsScroll}
        contentContainerStyle={styles.leagueTabsRow}
      >
        {LEAGUE_TABS.map((t) => {
          const isActive = selectedLeague === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              style={[
                styles.leagueTab,
                {
                  backgroundColor: isActive ? brand.navy : theme.cardBackground,
                  borderColor: isActive ? brand.yellow : theme.border,
                },
              ]}
              onPress={() => {
                triggerSelectionHaptic();
                setSelectedLeague(t.key);
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.leagueTabText,
                  { color: isActive ? brand.yellow : theme.text },
                ]}
              >
                {t.emoji} {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? (
        <StandingsSkeleton rows={10} />
      ) : (
        <View
          style={[
            styles.tableContainer,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
        >
          <View
            style={[
              styles.headerRow,
              {
                borderBottomColor: theme.divider,
                backgroundColor: theme.surfaceSubtle,
              },
            ]}
          >
            <Text
              style={[styles.headerText, { flex: 0.6, color: theme.secondaryText }]}
            >
              #
            </Text>
            <Text
              style={[styles.headerText, { flex: 3, color: theme.secondaryText }]}
            >
              TAKIM
            </Text>
            <Text
              style={[
                styles.headerText,
                { flex: 0.8, textAlign: "center", color: theme.secondaryText },
              ]}
            >
              O
            </Text>
            <Text
              style={[
                styles.headerText,
                { flex: 0.8, textAlign: "center", color: theme.secondaryText },
              ]}
            >
              G
            </Text>
            {!isBasketball && (
              <Text
                style={[
                  styles.headerText,
                  { flex: 0.8, textAlign: "center", color: theme.secondaryText },
                ]}
              >
                B
              </Text>
            )}
            <Text
              style={[
                styles.headerText,
                { flex: 0.8, textAlign: "center", color: theme.secondaryText },
              ]}
            >
              M
            </Text>
            <Text
              style={[
                styles.headerText,
                { flex: 1, textAlign: "center", color: theme.secondaryText },
              ]}
            >
              AV
            </Text>
            <Text
              style={[
                styles.headerText,
                { flex: 1, textAlign: "center", color: theme.secondaryText },
              ]}
            >
              {isBasketball ? "G%" : "P"}
            </Text>
          </View>

          <FlatList
            data={standings}
            keyExtractor={(item) => item.teamId}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.accent}
                colors={[brand.navy, brand.yellow]}
              />
            }
            ListEmptyComponent={
              <View style={{ padding: 32, alignItems: "center" }}>
                <Text style={{ color: theme.secondaryText, fontSize: 13 }}>
                  Bu turnuva için güncel puan tablosu verisi bulunamadı.
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const isFB = item.teamName.toLowerCase().includes("fenerbah");
              const winPct =
                item.played > 0
                  ? `%${Math.round((item.win / item.played) * 100)}`
                  : "%0";
              const zoneColor = getZoneColor(
                selectedLeague,
                item.rank,
                standings.length,
              );

              return (
                <View
                  style={[
                    styles.row,
                    { borderBottomColor: theme.divider },
                    isFB && { backgroundColor: theme.highlightRow },
                  ]}
                >
                  <View style={styles.rankCell}>
                    <View
                      style={[
                        styles.zoneIndicator,
                        { backgroundColor: zoneColor || "transparent" },
                      ]}
                    />
                    <Text
                      style={[
                        styles.cellText,
                        styles.tabularNumbers,
                        {
                          fontWeight: "bold",
                          color: isFB ? theme.accent : theme.text,
                        },
                      ]}
                    >
                      {item.rank}
                    </Text>
                  </View>
                  <View style={styles.teamCell}>
                    <CloudinaryImage
                      publicId={item.badge}
                      style={{ width: 22, height: 22, marginRight: 8 }}
                      contentFit="contain"
                    />
                    <Text
                      style={[
                        styles.cellText,
                        {
                          color: theme.text,
                          fontWeight: isFB ? "800" : "normal",
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {item.teamName}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.cellText,
                      styles.tabularNumbers,
                      {
                        flex: 0.8,
                        textAlign: "center",
                        color: theme.secondaryText,
                      },
                    ]}
                  >
                    {item.played}
                  </Text>
                  <Text
                    style={[
                      styles.cellText,
                      styles.tabularNumbers,
                      {
                        flex: 0.8,
                        textAlign: "center",
                        color: theme.secondaryText,
                      },
                    ]}
                  >
                    {item.win}
                  </Text>
                  {!isBasketball && (
                    <Text
                      style={[
                        styles.cellText,
                        styles.tabularNumbers,
                        {
                          flex: 0.8,
                          textAlign: "center",
                          color: theme.secondaryText,
                        },
                      ]}
                    >
                      {item.draw}
                    </Text>
                  )}
                  <Text
                    style={[
                      styles.cellText,
                      styles.tabularNumbers,
                      {
                        flex: 0.8,
                        textAlign: "center",
                        color: theme.secondaryText,
                      },
                    ]}
                  >
                    {item.loss}
                  </Text>
                  <Text
                    style={[
                      styles.cellText,
                      styles.tabularNumbers,
                      {
                        flex: 1,
                        textAlign: "center",
                        color: theme.secondaryText,
                      },
                    ]}
                  >
                    {item.goalDifference > 0
                      ? `+${item.goalDifference}`
                      : item.goalDifference}
                  </Text>
                  <Text
                    style={[
                      styles.cellText,
                      styles.tabularNumbers,
                      {
                        flex: 1,
                        textAlign: "center",
                        fontWeight: "bold",
                        color: theme.text,
                      },
                    ]}
                  >
                    {isBasketball ? winPct : item.points}
                  </Text>
                </View>
              );
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  tabularNumbers: {
    fontVariant: ["tabular-nums"],
  },
  leagueTabsScroll: {
    flexGrow: 0,
    marginBottom: 14,
  },
  leagueTabsRow: {
    flexDirection: "row",
    gap: 8,
  },
  leagueTab: {
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  leagueTabText: {
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableContainer: {
    borderRadius: Radius.md,
    overflow: "hidden",
    borderWidth: 1,
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  rankCell: {
    flex: 0.6,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  zoneIndicator: {
    width: 3,
    height: 16,
    borderRadius: 2,
  },
  teamCell: {
    flex: 3,
    flexDirection: "row",
    alignItems: "center",
  },
  cellText: {
    fontSize: 12,
  },
});
