import CloudinaryImage from "@/components/CloudinaryImage";
import Colors from "@/constants/Colors";
import {
  fetchStandingsByLeague,
  StandingsLeagueKey,
} from "@/services/standingsService";
import { TeamStanding } from "@/types";
import { Stack } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

const LEAGUE_TABS: { key: StandingsLeagueKey; label: string; emoji: string }[] =
  [
    { key: "superlig", label: "Süper Lig", emoji: "⚽" },
    { key: "champions", label: "Şampiyonlar Ligi", emoji: "⭐" },
    { key: "euroleague", label: "EuroLeague", emoji: "🏀" },
  ];

export default function PuanDurumuScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const [selectedLeague, setSelectedLeague] =
    useState<StandingsLeagueKey>("superlig");
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(
    async (force: boolean = false) => {
      const data = await fetchStandingsByLeague(selectedLeague, force);
      setStandings(data);
      setLoading(false);
      setRefreshing(false);
    },
    [selectedLeague],
  );

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  // 60 saniyede bir otomatik canlı puan durumu yenileme
  useEffect(() => {
    const timer = setInterval(() => {
      loadData(true);
    }, 60 * 1000);
    return () => clearInterval(timer);
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(true);
  }, [loadData]);

  const isBasketball = selectedLeague === "euroleague";

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: "Canlı Puan Durumu",
          headerStyle: { backgroundColor: Colors.brand.navy },
          headerTintColor: Colors.brand.yellow,
          headerBackTitle: "Geri",
        }}
      />

      {/* Lig Seçici Sekmeler */}
      <View style={styles.leagueTabsRow}>
        {LEAGUE_TABS.map((t) => {
          const isActive = selectedLeague === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              style={[
                styles.leagueTab,
                {
                  backgroundColor: isActive
                    ? Colors.brand.navy
                    : theme.cardBackground,
                  borderColor: isActive ? Colors.brand.yellow : theme.placeholder,
                },
              ]}
              onPress={() => setSelectedLeague(t.key)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.leagueTabText,
                  { color: isActive ? Colors.brand.yellow : theme.text },
                ]}
              >
                {t.emoji} {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={Colors.brand.navy} />
          <Text
            style={{
              marginTop: 10,
              fontSize: 13,
              color: theme.secondaryText,
            }}
          >
            Puan tablosu güncelleniyor...
          </Text>
        </View>
      ) : (
        <View
          style={[
            styles.tableContainer,
            { backgroundColor: theme.cardBackground },
          ]}
        >
          <View style={styles.headerRow}>
            <Text style={[styles.headerText, { flex: 0.5 }]}>#</Text>
            <Text style={[styles.headerText, { flex: 3 }]}>TAKIM</Text>
            <Text
              style={[styles.headerText, { flex: 0.8, textAlign: "center" }]}
            >
              O
            </Text>
            <Text
              style={[styles.headerText, { flex: 0.8, textAlign: "center" }]}
            >
              G
            </Text>
            {!isBasketball && (
              <Text
                style={[styles.headerText, { flex: 0.8, textAlign: "center" }]}
              >
                B
              </Text>
            )}
            <Text
              style={[styles.headerText, { flex: 0.8, textAlign: "center" }]}
            >
              M
            </Text>
            <Text style={[styles.headerText, { flex: 1, textAlign: "center" }]}>
              AV
            </Text>
            <Text style={[styles.headerText, { flex: 1, textAlign: "center" }]}>
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
                tintColor={Colors.brand.navy}
                colors={[Colors.brand.navy, Colors.brand.yellow]}
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
              return (
                <View
                  style={[
                    styles.row,
                    isFB && {
                      backgroundColor: "rgba(255, 237, 0, 0.18)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.cellText,
                      {
                        flex: 0.5,
                        fontWeight: "bold",
                        color: isFB ? Colors.brand.navy : theme.text,
                      },
                    ]}
                  >
                    {item.rank}
                  </Text>
                  <View
                    style={{
                      flex: 3,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
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
  leagueTabsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  leagueTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
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
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  headerText: {
    color: Colors.light.secondaryText,
    fontSize: 11,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.02)",
  },
  cellText: {
    fontSize: 12,
  },
});
