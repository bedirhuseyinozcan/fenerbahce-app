import Colors from "@/constants/Colors";
import React from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

interface MatchCardProps {
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  competition: string;
}

export default function MatchCard({
  homeTeam,
  awayTeam,
  date,
  time,
  competition,
}: MatchCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
      <View style={styles.header}>
        <Text style={[styles.competitionText, { color: theme.secondaryText }]}>
          {competition}
        </Text>
        <Text style={[styles.dateText, { color: theme.secondaryText }]}>
          {date} • {time}
        </Text>
      </View>

      <View style={styles.matchRow}>
        <View style={styles.teamContainer}>
          <View
            style={[
              styles.teamBadgePlaceholder,
              { backgroundColor: theme.placeholder },
            ]}
          />
          <Text
            style={[styles.teamName, { color: theme.text }]}
            numberOfLines={1}
          >
            {homeTeam}
          </Text>
        </View>

        <View style={styles.vsContainer}>
          <Text style={[styles.vsText, { color: theme.muted }]}>VS</Text>
        </View>

        <View style={styles.teamContainer}>
          <View
            style={[
              styles.teamBadgePlaceholder,
              { backgroundColor: theme.placeholder },
            ]}
          />
          <Text
            style={[styles.teamName, { color: theme.text }]}
            numberOfLines={1}
          >
            {awayTeam}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.footer,
          {
            backgroundColor:
              colorScheme === "dark" ? Colors.brand.navy : Colors.brand.yellow,
          },
        ]}
      >
        <Text
          style={[
            styles.footerText,
            {
              color:
                colorScheme === "dark" ? Colors.brand.white : Colors.brand.navy,
            },
          ]}
        >
          Maça Kalan Süre: 2 Gün 14 Saat
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  competitionText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  dateText: {
    fontSize: 12,
    fontWeight: "500",
  },
  matchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  teamContainer: {
    flex: 1,
    alignItems: "center",
  },
  teamBadgePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  teamName: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  vsContainer: {
    paddingHorizontal: 16,
  },
  vsText: {
    fontSize: 20,
    fontWeight: "900",
  },
  footer: {
    marginTop: 8,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  footerText: {
    fontWeight: "bold",
    fontSize: 14,
  },
});
