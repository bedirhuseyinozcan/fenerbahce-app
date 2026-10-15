import MatchCard from "@/components/MatchCard";
import Colors from "@/constants/Colors";
import { fetchFixtures } from "@/services/fixtureService";
import { MatchData } from "@/types";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BRANCHES = ["Tümü", "Futbol", "Basketbol", "Voleybol"];

export default function FiksturScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const [selectedBranch, setSelectedBranch] = useState("Tümü");
  const [statusTab, setStatusTab] = useState<"upcoming" | "past">("upcoming");
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchFixtures();
      setMatches(data);
      setLoading(false);
    };

    loadData();
  }, []);

  const upcomingCount = useMemo(() => {
    return matches.filter(
      (m) =>
        (selectedBranch === "Tümü" || m.branch === selectedBranch) &&
        m.homeScore === null &&
        m.awayScore === null,
    ).length;
  }, [matches, selectedBranch]);

  const pastCount = useMemo(() => {
    return matches.filter(
      (m) =>
        (selectedBranch === "Tümü" || m.branch === selectedBranch) &&
        (m.homeScore !== null || m.awayScore !== null),
    ).length;
  }, [matches, selectedBranch]);

  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      const matchBranch = selectedBranch === "Tümü" || match.branch === selectedBranch;
      const isUpcoming = match.homeScore === null && match.awayScore === null;
      const matchStatus = statusTab === "upcoming" ? isUpcoming : !isUpcoming;
      return matchBranch && matchStatus;
    });
  }, [matches, selectedBranch, statusTab]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 1. GELECEK / BİTEN MAÇLAR SEGMENTLİ SEKMESİ */}
      <View style={styles.segmentContainer}>
        <View style={[styles.segmentWrapper, { backgroundColor: theme.cardBackground }]}>
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              statusTab === "upcoming" && { backgroundColor: Colors.brand.navy },
            ]}
            onPress={() => setStatusTab("upcoming")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentText,
                { color: statusTab === "upcoming" ? Colors.brand.yellow : theme.secondaryText },
                statusTab === "upcoming" && { fontWeight: "bold" },
              ]}
            >
              ⏳ Gelecek Maçlar ({upcomingCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentBtn,
              statusTab === "past" && { backgroundColor: Colors.brand.navy },
            ]}
            onPress={() => setStatusTab("past")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentText,
                { color: statusTab === "past" ? Colors.brand.yellow : theme.secondaryText },
                statusTab === "past" && { fontWeight: "bold" },
              ]}
            >
              🏆 Sonuçlar ({pastCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. BRANŞ FİLTRE HAPLARI */}
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
                    backgroundColor: isActive ? Colors.brand.yellow : theme.cardBackground,
                    borderColor: isActive ? Colors.brand.yellow : "rgba(0,0,0,0.06)",
                  },
                ]}
                onPress={() => setSelectedBranch(item)}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: isActive ? Colors.brand.navy : theme.text },
                    isActive && { fontWeight: "bold" },
                  ]}
                >
                  {item === "Futbol" ? "⚽ " : item === "Basketbol" ? "🏀 " : item === "Voleybol" ? "🏐 " : ""}
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>

      {/* 3. MAÇ LİSTESİ */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.brand.navy} />
          <Text style={{ marginTop: 12, color: theme.secondaryText }}>
            Maç Takvimi Yükleniyor...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredMatches}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
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
    borderRadius: 14,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  filterText: {
    fontSize: 13,
  },
  loadingContainer: {
    padding: 48,
    alignItems: "center",
  },
  listContent: {
    paddingTop: 4,
    alignItems: "center",
  },
  cardWrapper: {
    width: "100%",
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 8,
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
