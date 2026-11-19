import { AthleteCardSkeleton } from "@/components/ui/Skeleton";
import { Radius } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";
import { useAthletesQuery } from "@/hooks/useSportsQueries";
import { LIVE_ROSTER_BRANCHES } from "@/services/athleteService";
import { Athlete, AthleteBranch } from "@/types";
import { triggerSelectionHaptic } from "@/utils/haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { Stack } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const BRANCH_TABS: { key: AthleteBranch; label: string; emoji: string }[] = [
  { key: "Futbol", label: "Futbol", emoji: "⚽" },
  { key: "Basketbol", label: "Basketbol", emoji: "🏀" },
  { key: "Voleybol", label: "Kadın Voleybol", emoji: "🏐" },
  { key: "Kadın Basketbol", label: "Kadın Basket", emoji: "🏀" },
  { key: "Erkek Voleybol", label: "Erkek Voleybol", emoji: "🏐" },
  { key: "Kadın Futbol", label: "Kadın Futbol", emoji: "⚽" },
];

export default function SporcularScreen() {
  const { theme, brand } = useAppTheme();

  const [selectedBranch, setSelectedBranch] = useState<AthleteBranch>("Futbol");
  const [selectedCategory, setSelectedCategory] = useState<string>("Tümü");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: athletes = [],
    isLoading,
    refetch,
  } = useAthletesQuery(selectedBranch);

  const loading = isLoading && athletes.length === 0;
  const loadedSource = athletes[0]?.source;
  const sourceBadgeLabel =
    loadedSource === "espn"
      ? "● Canlı Kaynak: ESPN"
      : loadedSource === "euroleague"
        ? "● Canlı Kaynak: EuroLeague"
        : loadedSource === "wikipedia"
          ? "● Canlı Kaynak: Wikipedia"
          : LIVE_ROSTER_BRANCHES.has(selectedBranch)
            ? "● Canlı Kaynak"
            : "📋 Sezon Listesi";

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const categoryFilters = useMemo(() => {
    if (selectedBranch === "Futbol" || selectedBranch === "Kadın Futbol") {
      return ["Tümü", "Kaleci", "Defans", "Orta Saha", "Forvet"];
    }
    if (selectedBranch === "Basketbol" || selectedBranch === "Kadın Basketbol") {
      return ["Tümü", "Gard", "Forvet/Pivot"];
    }
    return ["Tümü", "Smaçör", "Pasör", "Orta Oyuncu", "Libero"];
  }, [selectedBranch]);

  const filteredAthletes = useMemo(() => {
    return athletes.filter((a) => {
      const matchesCategory =
        selectedCategory === "Tümü" || a.category === selectedCategory;
      const matchesSearch =
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(a.number).includes(searchQuery);
      return matchesCategory && matchesSearch;
    });
  }, [athletes, selectedCategory, searchQuery]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: "Tüm Branş Kadroları",
          headerStyle: { backgroundColor: brand.navy },
          headerTintColor: brand.yellow,
          headerBackTitle: "Geri",
        }}
      />

      <View
        style={[
          styles.branchTabs,
          {
            backgroundColor: theme.cardBackground,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={BRANCH_TABS}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ paddingHorizontal: 8 }}
          renderItem={({ item }) => {
            const isActive = selectedBranch === item.key;
            return (
              <TouchableOpacity
                style={[
                  styles.branchTabButton,
                  { paddingHorizontal: 14 },
                  isActive && { borderBottomColor: brand.yellow },
                ]}
                onPress={() => {
                  triggerSelectionHaptic();
                  setSelectedBranch(item.key);
                  setSelectedCategory("Tümü");
                }}
              >
                <Text style={{ fontSize: 15, marginRight: 5 }}>
                  {item.emoji}
                </Text>
                <Text
                  style={[
                    styles.branchTabText,
                    {
                      color: isActive ? theme.accent : theme.secondaryText,
                    },
                    isActive && styles.branchTabTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border,
          },
        ]}
      >
        <Ionicons
          name="search"
          size={18}
          color={theme.secondaryText}
          style={{ marginRight: 8 }}
        />
        <TextInput
          placeholder="Sporcu adı veya forma numarası..."
          placeholderTextColor={theme.secondaryText}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[styles.searchInput, { color: theme.text }]}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons
              name="close-circle"
              size={18}
              color={theme.secondaryText}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.sourceMetaRow}>
        <View
          style={[
            styles.sourceBadge,
            { backgroundColor: theme.badgeBg, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.sourceBadgeText, { color: theme.badgeText }]}>
            {sourceBadgeLabel}
          </Text>
        </View>
        <Text style={[styles.countText, { color: theme.secondaryText }]}>
          {filteredAthletes.length} sporcu
        </Text>
      </View>

      <View style={styles.categoryFilterRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categoryFilters}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
          renderItem={({ item }) => {
            const isActive = selectedCategory === item;
            return (
              <TouchableOpacity
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: isActive
                      ? brand.navy
                      : theme.cardBackground,
                    borderColor: isActive ? brand.yellow : theme.border,
                  },
                ]}
                onPress={() => {
                  triggerSelectionHaptic();
                  setSelectedCategory(item);
                }}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    { color: isActive ? brand.yellow : theme.text },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {loading ? (
        <View style={styles.listContent}>
          <AthleteCardSkeleton />
          <AthleteCardSkeleton />
          <AthleteCardSkeleton />
          <AthleteCardSkeleton />
        </View>
      ) : (
        <FlatList
          data={filteredAthletes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
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
            <TouchableOpacity
              style={[
                styles.athleteCard,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border,
                },
              ]}
              onPress={() => setSelectedAthlete(item)}
              activeOpacity={0.75}
            >
              {item.image ? (
                <Image
                  source={{ uri: item.image }}
                  style={[styles.athleteImage, { borderColor: brand.yellow }]}
                  contentFit="cover"
                />
              ) : (
                <View
                  style={[
                    styles.numberBadge,
                    { backgroundColor: brand.navy, borderColor: brand.yellow },
                  ]}
                >
                  <Text style={[styles.numberText, { color: brand.yellow }]}>
                    {item.number}
                  </Text>
                </View>
              )}
              <View style={styles.athleteInfo}>
                <Text
                  style={[styles.athleteName, { color: theme.text }]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <View style={styles.athleteMetaRow}>
                  <View
                    style={[styles.posBadge, { backgroundColor: theme.badgeBg }]}
                  >
                    <Text style={[styles.posText, { color: theme.badgeText }]}>
                      {item.position}
                    </Text>
                  </View>
                  {item.country && (
                    <Text
                      style={[
                        styles.countryText,
                        { color: theme.secondaryText },
                      ]}
                    >
                      📍 {item.country}
                    </Text>
                  )}
                </View>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={theme.secondaryText}
              />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={{ color: theme.secondaryText, fontSize: 14 }}>
                Aradığınız kriterlere uygun sporcu bulunamadı.
              </Text>
            </View>
          }
        />
      )}

      <Modal
        visible={!!selectedAthlete}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedAthlete(null)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            {selectedAthlete && (
              <>
                <View style={styles.modalHeader}>
                  <View
                    style={[
                      styles.modalNumberBadge,
                      { backgroundColor: brand.navy },
                    ]}
                  >
                    <Text
                      style={[styles.modalNumberText, { color: brand.yellow }]}
                    >
                      #{selectedAthlete.number}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedAthlete(null)}>
                    <Ionicons name="close" size={24} color={theme.text} />
                  </TouchableOpacity>
                </View>

                {selectedAthlete.image ? (
                  <Image
                    source={{ uri: selectedAthlete.image }}
                    style={[styles.modalImage, { borderColor: brand.yellow }]}
                    contentFit="cover"
                  />
                ) : null}

                <Text style={[styles.modalName, { color: theme.text }]}>
                  {selectedAthlete.name}
                </Text>

                <View style={styles.modalDetailsList}>
                  <View
                    style={[
                      styles.modalDetailRow,
                      { borderBottomColor: theme.divider },
                    ]}
                  >
                    <Text
                      style={[
                        styles.modalDetailLabel,
                        { color: theme.secondaryText },
                      ]}
                    >
                      Branş:
                    </Text>
                    <Text
                      style={[styles.modalDetailValue, { color: theme.text }]}
                    >
                      {selectedAthlete.branch}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.modalDetailRow,
                      { borderBottomColor: theme.divider },
                    ]}
                  >
                    <Text
                      style={[
                        styles.modalDetailLabel,
                        { color: theme.secondaryText },
                      ]}
                    >
                      Mevki:
                    </Text>
                    <Text
                      style={[styles.modalDetailValue, { color: theme.text }]}
                    >
                      {selectedAthlete.position} ({selectedAthlete.category})
                    </Text>
                  </View>
                  {selectedAthlete.country && (
                    <View
                      style={[
                        styles.modalDetailRow,
                        { borderBottomColor: theme.divider },
                      ]}
                    >
                      <Text
                        style={[
                          styles.modalDetailLabel,
                          { color: theme.secondaryText },
                        ]}
                      >
                        Ülke:
                      </Text>
                      <Text
                        style={[styles.modalDetailValue, { color: theme.text }]}
                      >
                        {selectedAthlete.country}
                      </Text>
                    </View>
                  )}
                  {selectedAthlete.age ? (
                    <View
                      style={[
                        styles.modalDetailRow,
                        { borderBottomColor: theme.divider },
                      ]}
                    >
                      <Text
                        style={[
                          styles.modalDetailLabel,
                          { color: theme.secondaryText },
                        ]}
                      >
                        Yaş:
                      </Text>
                      <Text
                        style={[styles.modalDetailValue, { color: theme.text }]}
                      >
                        {selectedAthlete.age}
                      </Text>
                    </View>
                  ) : null}
                  {selectedAthlete.height || selectedAthlete.weight ? (
                    <View
                      style={[
                        styles.modalDetailRow,
                        { borderBottomColor: theme.divider },
                      ]}
                    >
                      <Text
                        style={[
                          styles.modalDetailLabel,
                          { color: theme.secondaryText },
                        ]}
                      >
                        Fiziksel:
                      </Text>
                      <Text
                        style={[styles.modalDetailValue, { color: theme.text }]}
                      >
                        {[selectedAthlete.height, selectedAthlete.weight]
                          .filter(Boolean)
                          .join(" • ")}
                      </Text>
                    </View>
                  ) : null}
                  <View
                    style={[
                      styles.modalDetailRow,
                      { borderBottomColor: theme.divider },
                    ]}
                  >
                    <Text
                      style={[
                        styles.modalDetailLabel,
                        { color: theme.secondaryText },
                      ]}
                    >
                      Kulüp:
                    </Text>
                    <Text
                      style={[
                        styles.modalDetailValue,
                        { color: theme.accent, fontWeight: "bold" },
                      ]}
                    >
                      Fenerbahçe Spor Kulübü
                    </Text>
                  </View>
                </View>

                {selectedAthlete.stats ? (
                  <View
                    style={[
                      styles.statsBox,
                      {
                        backgroundColor: theme.surfaceSubtle,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.statsTitle, { color: theme.accent }]}
                    >
                      📊 SEZON İSTATİSTİKLERİ
                      {selectedAthlete.stats.sourceLabel
                        ? ` (${selectedAthlete.stats.sourceLabel})`
                        : ""}
                    </Text>
                    <View style={styles.statsGrid}>
                      {selectedAthlete.stats.appearances !== undefined && (
                        <View style={styles.statCell}>
                          <Text style={[styles.statVal, { color: theme.text }]}>
                            {selectedAthlete.stats.appearances}
                          </Text>
                          <Text
                            style={[
                              styles.statLbl,
                              { color: theme.secondaryText },
                            ]}
                          >
                            Maç
                          </Text>
                        </View>
                      )}
                      {selectedAthlete.stats.goals !== undefined && (
                        <View style={styles.statCell}>
                          <Text style={[styles.statVal, { color: theme.text }]}>
                            {selectedAthlete.stats.goals}
                          </Text>
                          <Text
                            style={[
                              styles.statLbl,
                              { color: theme.secondaryText },
                            ]}
                          >
                            Gol
                          </Text>
                        </View>
                      )}
                      {selectedAthlete.stats.assists !== undefined && (
                        <View style={styles.statCell}>
                          <Text style={[styles.statVal, { color: theme.text }]}>
                            {selectedAthlete.stats.assists}
                          </Text>
                          <Text
                            style={[
                              styles.statLbl,
                              { color: theme.secondaryText },
                            ]}
                          >
                            Asist
                          </Text>
                        </View>
                      )}
                      {selectedAthlete.stats.pointsPerGame !== undefined && (
                        <View style={styles.statCell}>
                          <Text style={[styles.statVal, { color: theme.text }]}>
                            {selectedAthlete.stats.pointsPerGame}
                          </Text>
                          <Text
                            style={[
                              styles.statLbl,
                              { color: theme.secondaryText },
                            ]}
                          >
                            Sayı Ort.
                          </Text>
                        </View>
                      )}
                      {selectedAthlete.stats.reboundsPerGame !== undefined && (
                        <View style={styles.statCell}>
                          <Text style={[styles.statVal, { color: theme.text }]}>
                            {selectedAthlete.stats.reboundsPerGame}
                          </Text>
                          <Text
                            style={[
                              styles.statLbl,
                              { color: theme.secondaryText },
                            ]}
                          >
                            Ribaund
                          </Text>
                        </View>
                      )}
                      {selectedAthlete.stats.assistsPerGame !== undefined && (
                        <View style={styles.statCell}>
                          <Text style={[styles.statVal, { color: theme.text }]}>
                            {selectedAthlete.stats.assistsPerGame}
                          </Text>
                          <Text
                            style={[
                              styles.statLbl,
                              { color: theme.secondaryText },
                            ]}
                          >
                            Asist Ort.
                          </Text>
                        </View>
                      )}
                      {selectedAthlete.stats.pir !== undefined && (
                        <View style={styles.statCell}>
                          <Text style={[styles.statVal, { color: theme.text }]}>
                            {selectedAthlete.stats.pir}
                          </Text>
                          <Text
                            style={[
                              styles.statLbl,
                              { color: theme.secondaryText },
                            ]}
                          >
                            VP
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ) : (
                  <Text
                    style={[styles.noStatsText, { color: theme.secondaryText }]}
                  >
                    Bu sporcu için canlı sezon istatistiği henüz yayınlanmadı.
                  </Text>
                )}

                <TouchableOpacity
                  style={[styles.modalCloseBtn, { backgroundColor: brand.navy }]}
                  onPress={() => setSelectedAthlete(null)}
                >
                  <Text
                    style={[styles.modalCloseBtnText, { color: brand.yellow }]}
                  >
                    Kapat
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  branchTabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  branchTabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderBottomWidth: 2.5,
    borderBottomColor: "transparent",
  },
  branchTabText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  branchTabTextActive: {
    fontWeight: "800",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 2,
  },
  sourceMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 2,
  },
  sourceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  sourceBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  countText: {
    fontSize: 11,
    fontWeight: "600",
  },
  categoryFilterRow: {
    marginBottom: 4,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 10,
  },
  athleteCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  numberBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    borderWidth: 1.5,
  },
  athleteImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 14,
    backgroundColor: "rgba(254, 209, 0, 0.2)",
    borderWidth: 1.5,
  },
  modalImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: "center",
    marginBottom: 12,
    borderWidth: 2,
  },
  numberText: {
    fontSize: 15,
    fontWeight: "bold",
  },
  athleteInfo: {
    flex: 1,
  },
  athleteName: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 4,
  },
  athleteMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  posBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  posText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  countryText: {
    fontSize: 11,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalNumberBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modalNumberText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  modalName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  modalDetailsList: {
    gap: 10,
    marginBottom: 20,
  },
  modalDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 0.5,
  },
  modalDetailLabel: {
    fontSize: 13,
  },
  modalDetailValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  modalCloseBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalCloseBtnText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  statsBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginBottom: 14,
  },
  statsTitle: {
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 8,
    letterSpacing: 0.4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-around",
  },
  statCell: {
    alignItems: "center",
    minWidth: 54,
  },
  statVal: {
    fontSize: 16,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },
  statLbl: {
    fontSize: 10,
    fontWeight: "600",
  },
  noStatsText: {
    fontSize: 11,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 14,
  },
});
