import Colors from "@/constants/Colors";
import { fetchAthletes } from "@/services/athleteService";
import { Athlete } from "@/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

type BranchType = "Futbol" | "Basketbol" | "Voleybol";

export default function SporcularScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const [selectedBranch, setSelectedBranch] = useState<BranchType>("Futbol");
  const [selectedCategory, setSelectedCategory] = useState<string>("Tümü");
  const [searchQuery, setSearchQuery] = useState("");
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchAthletes(selectedBranch);
      setAthletes(data);
      setLoading(false);
      setSelectedCategory("Tümü");
    };
    load();
  }, [selectedBranch]);

  const categoryFilters = useMemo(() => {
    if (selectedBranch === "Futbol") {
      return ["Tümü", "Kaleci", "Defans", "Orta Saha", "Forvet"];
    }
    if (selectedBranch === "Basketbol") {
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
          title: "A Takım Kadroları",
          headerStyle: { backgroundColor: Colors.brand.navy },
          headerTintColor: Colors.brand.yellow,
          headerBackTitle: "Geri",
        }}
      />
      <View
        style={[styles.branchTabs, { backgroundColor: theme.cardBackground }]}
      >
        {(["Futbol", "Basketbol", "Voleybol"] as BranchType[]).map((b) => {
          const isActive = selectedBranch === b;
          return (
            <TouchableOpacity
              key={b}
              style={[
                styles.branchTabButton,
                isActive && { borderBottomColor: Colors.brand.yellow },
              ]}
              onPress={() => setSelectedBranch(b)}
            >
              <Text style={{ fontSize: 16, marginRight: 6 }}>
                {b === "Futbol" ? "⚽" : b === "Basketbol" ? "🏀" : "🏐"}
              </Text>
              <Text
                style={[
                  styles.branchTabText,
                  { color: isActive ? Colors.brand.navy : theme.secondaryText },
                  isActive && styles.branchTabTextActive,
                ]}
              >
                {b}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.cardBackground },
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
                      ? Colors.brand.navy
                      : theme.cardBackground,
                    borderColor: isActive
                      ? Colors.brand.navy
                      : theme.placeholder,
                  },
                ]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    { color: isActive ? Colors.brand.yellow : theme.text },
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
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.brand.navy} />
          <Text style={[styles.loadingText, { color: theme.secondaryText }]}>
            {selectedBranch} kadrosu yükleniyor...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredAthletes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.athleteCard,
                { backgroundColor: theme.cardBackground },
              ]}
              onPress={() => setSelectedAthlete(item)}
              activeOpacity={0.75}
            >
              {item.image ? (
                <Image
                  source={{ uri: item.image }}
                  style={styles.athleteImage}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.numberBadge}>
                  <Text style={styles.numberText}>{item.number}</Text>
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
                  <View style={styles.posBadge}>
                    <Text style={styles.posText}>{item.position}</Text>
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
                  <View style={styles.modalNumberBadge}>
                    <Text style={styles.modalNumberText}>
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
                    style={styles.modalImage}
                    contentFit="cover"
                  />
                ) : null}

                <Text style={[styles.modalName, { color: theme.text }]}>
                  {selectedAthlete.name}
                </Text>

                <View style={styles.modalDetailsList}>
                  <View style={styles.modalDetailRow}>
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
                  <View style={styles.modalDetailRow}>
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
                    <View style={styles.modalDetailRow}>
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
                  <View style={styles.modalDetailRow}>
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
                        { color: Colors.brand.navy, fontWeight: "bold" },
                      ]}
                    >
                      Fenerbahçe Spor Kulübü
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setSelectedAthlete(null)}
                >
                  <Text style={styles.modalCloseBtnText}>Kapat</Text>
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
    borderBottomColor: "#EEEEEE",
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
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 2,
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
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  numberBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.brand.navy,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    borderWidth: 1.5,
    borderColor: Colors.brand.yellow,
  },
  athleteImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 14,
    backgroundColor: "rgba(254, 209, 0, 0.2)",
    borderWidth: 1.5,
    borderColor: Colors.brand.yellow,
  },
  modalImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.brand.yellow,
    backgroundColor: "rgba(7, 33, 70, 0.05)",
  },
  numberText: {
    color: Colors.brand.yellow,
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
    backgroundColor: "rgba(7, 33, 70, 0.08)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  posText: {
    color: Colors.brand.navy,
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
  loadingText: {
    marginTop: 10,
    fontSize: 13,
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
    backgroundColor: Colors.brand.navy,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modalNumberText: {
    color: Colors.brand.yellow,
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
    borderBottomColor: "#EEEEEE",
  },
  modalDetailLabel: {
    fontSize: 13,
  },
  modalDetailValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  modalCloseBtn: {
    backgroundColor: Colors.brand.navy,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalCloseBtnText: {
    color: Colors.brand.yellow,
    fontSize: 14,
    fontWeight: "bold",
  },
});
