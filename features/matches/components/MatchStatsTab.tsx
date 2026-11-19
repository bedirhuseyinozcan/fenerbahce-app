import { Radius } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";
import { MatchDetailData, MatchStat } from "@/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export function MatchStatsTab({ match }: { match: MatchDetailData }) {
  const { theme, brand, isDark } = useAppTheme();
  const homeBarColor = isDark ? brand.yellow : brand.navy;
  const awayBarColor = isDark ? "#64748B" : "#90A4AE";

  return (
    <View style={styles.tabContentContainer}>
      {match.momentum ? (
        <View
          style={[
            styles.momentumCard,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.momentumTopRow}>
            <Text style={[styles.momentumHeading, { color: theme.accent }]}>
              ⚡ MAÇ BASKINLIĞI
            </Text>
            <Text
              style={[styles.momentumLabel, { color: theme.secondaryText }]}
            >
              {match.momentum.label}
            </Text>
          </View>
          <View style={styles.momentumValuesRow}>
            <Text
              style={[
                styles.momentumPct,
                styles.tabularNumbers,
                { color: theme.accent },
              ]}
            >
              %{match.momentum.homeScore}
            </Text>
            <Text
              style={[
                styles.momentumPct,
                styles.tabularNumbers,
                { color: theme.secondaryText },
              ]}
            >
              %{match.momentum.awayScore}
            </Text>
          </View>
          <View style={styles.statBarTrack}>
            <View
              style={[
                styles.statBarFillHome,
                {
                  width: `${match.momentum.homePercentage}%`,
                  backgroundColor: homeBarColor,
                },
              ]}
            />
            <View
              style={[
                styles.statBarFillAway,
                {
                  width: `${100 - match.momentum.homePercentage}%`,
                  backgroundColor: awayBarColor,
                },
              ]}
            />
          </View>
        </View>
      ) : null}

      <View
        style={[
          styles.statsHeaderRow,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border,
          },
        ]}
      >
        <Text
          style={[styles.statsTeamName, { color: theme.accent }]}
          numberOfLines={1}
        >
          {match.homeTeam}
        </Text>
        <Text style={[styles.statsTitle, { color: theme.secondaryText }]}>
          İSTATİSTİK
        </Text>
        <Text
          style={[
            styles.statsTeamName,
            { color: theme.text, textAlign: "right" },
          ]}
          numberOfLines={1}
        >
          {match.awayTeam}
        </Text>
      </View>

      {match.stats.length > 0 ? (
        <View
          style={[
            styles.statsListCard,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
        >
          {match.stats.map((stat: MatchStat, index: number) => (
            <View key={index} style={styles.statRow}>
              <View style={styles.statValuesRow}>
                <Text
                  style={[
                    styles.statValueText,
                    styles.tabularNumbers,
                    { color: theme.accent, fontWeight: "bold" },
                  ]}
                >
                  {stat.homeValue}
                </Text>
                <Text style={[styles.statLabelText, { color: theme.text }]}>
                  {stat.label}
                </Text>
                <Text
                  style={[
                    styles.statValueText,
                    styles.tabularNumbers,
                    { color: theme.secondaryText, fontWeight: "bold" },
                  ]}
                >
                  {stat.awayValue}
                </Text>
              </View>

              <View style={styles.statBarTrack}>
                <View
                  style={[
                    styles.statBarFillHome,
                    {
                      width: `${stat.homePercentage}%`,
                      backgroundColor: homeBarColor,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.statBarFillAway,
                    {
                      width: `${100 - stat.homePercentage}%`,
                      backgroundColor: awayBarColor,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View
          style={[
            styles.emptyCard,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
        >
          <Ionicons
            name="stats-chart-outline"
            size={32}
            color={theme.secondaryText}
          />
          <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
            Bu karşılaşma için resmi istatistik verisi henüz yayınlanmadı.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContentContainer: {
    padding: 16,
  },
  tabularNumbers: {
    fontVariant: ["tabular-nums"],
  },
  momentumCard: {
    padding: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: 12,
  },
  momentumTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  momentumHeading: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  momentumLabel: {
    fontSize: 11,
    fontWeight: "700",
  },
  momentumValuesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  momentumPct: {
    fontSize: 13,
    fontWeight: "800",
  },
  statsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: 12,
  },
  statsTeamName: {
    fontSize: 13,
    fontWeight: "bold",
    flex: 1,
  },
  statsTitle: {
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
    marginHorizontal: 8,
  },
  statsListCard: {
    padding: 16,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  statRow: {
    marginBottom: 16,
  },
  statValuesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  statValueText: {
    fontSize: 14,
  },
  statLabelText: {
    fontSize: 13,
  },
  statBarTrack: {
    height: 8,
    borderRadius: 4,
    flexDirection: "row",
    overflow: "hidden",
  },
  statBarFillHome: {
    height: "100%",
  },
  statBarFillAway: {
    height: "100%",
  },
  emptyCard: {
    padding: 30,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 10,
    fontSize: 13,
    textAlign: "center",
  },
});
