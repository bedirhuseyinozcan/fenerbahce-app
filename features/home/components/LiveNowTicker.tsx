import { LivePulseDot } from "@/components/ui/LivePulseDot";
import { Radius } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";
import { MatchData } from "@/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface LiveNowTickerProps {
  liveMatches: MatchData[];
  onPressMatch: (matchId: string) => void;
}

export function LiveNowTicker({
  liveMatches,
  onPressMatch,
}: LiveNowTickerProps) {
  const { theme, brand } = useAppTheme();

  if (liveMatches.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {liveMatches.map((m) => (
          <TouchableOpacity
            key={m.id}
            style={[
              styles.tickerChip,
              {
                backgroundColor: theme.cardBackground,
                borderColor: brand.liveRed,
              },
            ]}
            onPress={() => onPressMatch(m.id)}
            activeOpacity={0.8}
          >
            <LivePulseDot color={brand.liveRed} size={7} />
            <Text style={[styles.branchTag, { color: theme.accent }]}>
              {m.branch}
            </Text>
            <Text style={[styles.scoreText, { color: theme.text }]}>
              {m.homeTeam.split(" ")[0]} {m.homeScore ?? "0"}-
              {m.awayScore ?? "0"} {m.awayTeam.split(" ")[0]}
            </Text>
            {m.liveClock ? (
              <Text style={[styles.clockText, { color: brand.liveRed }]}>
                {m.liveClock}
              </Text>
            ) : null}
            <Ionicons
              name="chevron-forward"
              size={14}
              color={theme.secondaryText}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  tickerChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
  },
  branchTag: {
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  scoreText: {
    fontSize: 12,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  clockText: {
    fontSize: 11,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
});
