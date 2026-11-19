import { Radius } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";
import {
  fenerbahceHistoryEvents,
  getTodayHistoricalEvent,
} from "@/data/historyData";
import { triggerSelectionHaptic } from "@/utils/haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function HistoryTodayCard() {
  const { brand } = useAppTheme();

  const initialIndex = useMemo(() => {
    const todayEvent = getTodayHistoricalEvent();
    const idx = fenerbahceHistoryEvents.findIndex(
      (e) => e.id === todayEvent.id,
    );
    return idx >= 0 ? idx : 0;
  }, []);

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const total = fenerbahceHistoryEvents.length;
  const current = fenerbahceHistoryEvents[activeIndex] || fenerbahceHistoryEvents[0];

  const handlePrev = () => {
    triggerSelectionHaptic();
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    triggerSelectionHaptic();
    setActiveIndex((prev) => (prev + 1) % total);
  };

  return (
    <LinearGradient
      colors={[brand.navyLight, brand.navyDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.historyCard}
    >
      <View style={styles.historyHeader}>
        <Text style={styles.historyTag}>
          📜 TARİHTE FENERBAHÇE • {current.year}
        </Text>
        <View style={styles.rightCluster}>
          {current.score && (
            <View style={styles.historyScoreBadge}>
              <Text style={styles.historyScoreText}>{current.score}</Text>
            </View>
          )}
          <View style={styles.navGroup}>
            <TouchableOpacity
              onPress={handlePrev}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 4 }}
              style={styles.navBtn}
            >
              <Ionicons name="chevron-back" size={14} color="#FFED00" />
            </TouchableOpacity>
            <Text style={styles.counterText}>
              {activeIndex + 1}/{total}
            </Text>
            <TouchableOpacity
              onPress={handleNext}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 6 }}
              style={styles.navBtn}
            >
              <Ionicons name="chevron-forward" size={14} color="#FFED00" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Text style={styles.historyTitle}>{current.title}</Text>
      <Text style={styles.historyDesc}>{current.description}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  historyCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 15,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: "rgba(255, 237, 0, 0.35)",
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  historyTag: {
    color: "#FFED00",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.6,
    flexShrink: 1,
  },
  rightCluster: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  historyScoreBadge: {
    backgroundColor: "#FFED00",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  historyScoreText: {
    color: "#072146",
    fontSize: 10,
    fontWeight: "900",
  },
  navGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 4,
  },
  navBtn: {
    padding: 2,
  },
  counterText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  historyTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  historyDesc: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 12,
    lineHeight: 17,
  },
});
