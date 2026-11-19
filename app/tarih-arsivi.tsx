import { Radius } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";
import {
  fenerbahceHistoryEvents,
  getTodayHistoricalEvent,
} from "@/data/historyData";
import { HistoricalEvent } from "@/types";
import { triggerSelectionHaptic } from "@/utils/haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const MONTHS_TR = [
  "",
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

const CATEGORIES: ("Tümü" | HistoricalEvent["category"])[] = [
  "Tümü",
  "Avrupa",
  "Şampiyonluk",
  "Derbi Zaferi",
  "Kulüp Tarihi",
];

function formatEventDate(ev: HistoricalEvent): string {
  const monthLabel = MONTHS_TR[ev.month] || String(ev.month);
  return `${ev.day} ${monthLabel} ${ev.year}`;
}

export default function TarihArsiviScreen() {
  const { theme, brand } = useAppTheme();
  const [selectedCategory, setSelectedCategory] = useState<
    "Tümü" | HistoricalEvent["category"]
  >("Tümü");
  const [searchQuery, setSearchQuery] = useState("");
  const [newestFirst, setNewestFirst] = useState(true);

  const featuredToday = useMemo(() => getTodayHistoricalEvent(), []);

  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return fenerbahceHistoryEvents
      .filter((ev) => {
        const matchesCat =
          selectedCategory === "Tümü" || ev.category === selectedCategory;
        const matchesQuery =
          !q ||
          ev.title.toLowerCase().includes(q) ||
          ev.description.toLowerCase().includes(q) ||
          String(ev.year).includes(q);
        return matchesCat && matchesQuery;
      })
      .sort((a, b) =>
        newestFirst
          ? b.year - a.year || b.month - a.month || b.day - a.day
          : a.year - b.year || a.month - b.month || a.day - b.day,
      );
  }, [selectedCategory, searchQuery, newestFirst]);

  const handleShareEvent = async (ev: HistoricalEvent) => {
    triggerSelectionHaptic();
    const scorePart = ev.score ? `\nSkor: ${ev.score}` : "";
    try {
      await Share.share({
        title: ev.title,
        message: `📜 Tarihte Fenerbahçe (${formatEventDate(ev)})\n${ev.title}\n${ev.description}${scorePart} 💛💙`,
      });
    } catch {
      // ignore cancelled share
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: "Tarihte Fenerbahçe Arşivi",
          headerStyle: { backgroundColor: brand.navy },
          headerTintColor: brand.yellow,
          headerBackTitle: "Geri",
        }}
      />

      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <LinearGradient
              colors={[brand.navyLight, brand.navyDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <Text style={styles.heroTag}>
                📜 GÜNÜN TARİHİ OLAYI • {formatEventDate(featuredToday)}
              </Text>
              <Text style={styles.heroTitle}>{featuredToday.title}</Text>
              <Text style={styles.heroDesc}>{featuredToday.description}</Text>
            </LinearGradient>

            <View
              style={[
                styles.searchRow,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border,
                },
              ]}
            >
              <Ionicons name="search" size={16} color={theme.secondaryText} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Yıl, rakip veya efsane ara (ör. 2002, Chelsea)..."
                placeholderTextColor={theme.secondaryText}
                style={[styles.searchInput, { color: theme.text }]}
              />
              <TouchableOpacity
                onPress={() => {
                  triggerSelectionHaptic();
                  setNewestFirst((v) => !v);
                }}
                style={[styles.sortBtn, { backgroundColor: theme.badgeBg }]}
              >
                <Text style={[styles.sortBtnText, { color: theme.badgeText }]}>
                  {newestFirst ? "Yeniden Eskiye" : "Eskiden Yeniye"}
                </Text>
              </TouchableOpacity>
            </View>

            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={CATEGORIES}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.catsRow}
              renderItem={({ item }) => {
                const isActive = selectedCategory === item;
                return (
                  <TouchableOpacity
                    onPress={() => {
                      triggerSelectionHaptic();
                      setSelectedCategory(item);
                    }}
                    style={[
                      styles.catPill,
                      {
                        backgroundColor: isActive
                          ? brand.navy
                          : theme.cardBackground,
                        borderColor: isActive ? brand.yellow : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.catPillText,
                        { color: isActive ? brand.yellow : theme.text },
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />

            <Text style={[styles.resultCount, { color: theme.secondaryText }]}>
              {filteredEvents.length} tarihi kayıt gösteriliyor
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.eventCard,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.eventTopRow}>
              <View style={[styles.datePill, { backgroundColor: theme.badgeBg }]}>
                <Text style={[styles.datePillText, { color: theme.badgeText }]}>
                  {formatEventDate(item)}
                </Text>
              </View>
              <View style={styles.topRightRow}>
                {item.score ? (
                  <View
                    style={[styles.scoreBadge, { backgroundColor: brand.yellow }]}
                  >
                    <Text style={[styles.scoreText, { color: brand.navy }]}>
                      {item.score}
                    </Text>
                  </View>
                ) : null}
                <TouchableOpacity onPress={() => handleShareEvent(item)}>
                  <Ionicons
                    name="share-social-outline"
                    size={18}
                    color={theme.accent}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={[styles.eventTitle, { color: theme.text }]}>
              {item.title}
            </Text>
            <Text style={[styles.eventDesc, { color: theme.secondaryText }]}>
              {item.description}
            </Text>
            <Text style={[styles.catTag, { color: theme.accent }]}>
              • {item.category}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 48, gap: 12 },
  heroCard: {
    padding: 16,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: "rgba(255, 237, 0, 0.35)",
    marginBottom: 12,
  },
  heroTag: {
    color: "#FFED00",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 4,
  },
  heroDesc: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 12,
    lineHeight: 17,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 2,
  },
  sortBtn: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  sortBtnText: {
    fontSize: 10,
    fontWeight: "800",
  },
  catsRow: {
    gap: 8,
    paddingBottom: 10,
  },
  catPill: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  catPillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  resultCount: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  eventCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: 14,
  },
  eventTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  datePill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  datePillText: {
    fontSize: 11,
    fontWeight: "800",
  },
  topRightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  scoreText: {
    fontSize: 10,
    fontWeight: "900",
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },
  eventDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 6,
  },
  catTag: {
    fontSize: 11,
    fontWeight: "700",
  },
});
