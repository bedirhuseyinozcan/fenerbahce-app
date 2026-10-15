import MatchCard from "@/components/MatchCard";
import Colors from "@/constants/Colors";
import { fetchFixtures } from "@/services/fixtureService";
import { MatchData } from "@/types";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

const BRANCHES = ["Tümü", "Futbol", "Basketbol", "Voleybol"];

export default function FiksturScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const [selectedBranch, setSelectedBranch] = useState("Tümü");
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchFixtures();
      setTimeout(() => {
        setMatches(data);
        setLoading(false);
      }, 600);
    };

    loadData();
  }, []);
  const filteredMatches = matches.filter(
    (match) => selectedBranch === "Tümü" || match.branch === selectedBranch,
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.filterContainer, { borderBottomColor: theme.placeholder }]}>
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
                      ? Colors.brand.navy
                      : theme.cardBackground,
                    borderColor: isActive
                      ? Colors.brand.navy
                      : theme.placeholder,
                  },
                ]}
                onPress={() => setSelectedBranch(item)}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: isActive ? Colors.brand.yellow : theme.text },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.brand.navy} />
          <Text style={{ marginTop: 12, color: theme.secondaryText }}>
            Fikstür Yükleniyor...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredMatches}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
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
              <Text style={{ color: theme.secondaryText }}>
                Bu branşta yaklaşan maç bulunamadı.
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
  loadingContainer: {
    padding: 32,
    alignItems: "center",
  },
  filterContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  listContent: {
    paddingVertical: 12,
    alignItems: "center",
  },
  cardWrapper: {
    width: "100%",
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 8,
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
});
