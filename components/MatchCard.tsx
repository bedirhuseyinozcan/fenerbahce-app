import CloudinaryImage from "@/components/CloudinaryImage";
import Colors from "@/constants/Colors";
import { MatchStatus } from "@/types";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

interface MatchCardProps {
  id?: string;
  homeTeam: string;
  homeLogo?: string;
  homeScore?: string | null;
  awayTeam: string;
  awayLogo?: string;
  awayScore?: string | null;
  date: string;
  time: string;
  stadium: string;
  competition: string;
  round?: string;
  branch?: string;
  status?: MatchStatus;
  liveClock?: string;
  isFullWidth?: boolean;
  onPress?: () => void;
}

export default function MatchCard({
  id,
  homeTeam,
  homeLogo,
  homeScore,
  awayTeam,
  awayLogo,
  awayScore,
  date,
  time,
  stadium,
  competition,
  round,
  branch = "Futbol",
  status,
  liveClock,
  isFullWidth = false,
  onPress,
}: MatchCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const isLive = status === "live";
  const hasScore = isLive || (homeScore != null && awayScore != null);

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.85 : 1}
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.cardBackground,
          width: isFullWidth ? "100%" : 280,
          marginRight: isFullWidth ? 0 : 16,
          borderColor: isLive ? "#E53935" : Colors.light.placeholder,
          borderWidth: isLive ? 1.5 : 1,
        },
      ]}
    >
      <View style={styles.topBar}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text
            style={[styles.branchText, { color: Colors.brand.navy }]}
            numberOfLines={1}
          >
            {branch}
          </Text>
          {isLive && (
            <View style={styles.livePill}>
              <Text style={styles.livePillText}>
                ● {liveClock || "CANLI"}
              </Text>
            </View>
          )}
        </View>
        <Text
          style={[styles.competitionText, { color: theme.secondaryText }]}
          numberOfLines={1}
        >
          {competition} {round ? `• ${round}` : ""}
        </Text>
      </View>

      <View style={styles.matchRow}>
        <View style={styles.teamContainer}>
          {homeLogo ? (
            <CloudinaryImage
              publicId={homeLogo}
              style={styles.logo}
              contentFit="contain"
            />
          ) : (
            <View
              style={[
                styles.logoPlaceholder,
                { backgroundColor: theme.placeholder },
              ]}
            />
          )}
          <Text
            style={[styles.teamName, { color: theme.text }]}
            numberOfLines={2}
          >
            {homeTeam}
          </Text>
        </View>

        <View style={styles.matchInfo}>
          {hasScore ? (
            <Text
              style={[
                styles.timeText,
                {
                  color: isLive ? "#E53935" : theme.text,
                  fontSize: 24,
                  letterSpacing: 1,
                },
              ]}
              numberOfLines={1}
            >
              {homeScore ?? "0"} - {awayScore ?? "0"}
            </Text>
          ) : (
            <>
              <Text
                style={[styles.dateText, { color: theme.text }]}
                numberOfLines={2}
              >
                {date}
              </Text>
              <Text
                style={[styles.timeText, { color: Colors.brand.navy }]}
                numberOfLines={1}
              >
                {time}
              </Text>
            </>
          )}
          <Text
            style={[
              styles.stadiumText,
              { color: theme.secondaryText, marginTop: 4 },
            ]}
            numberOfLines={2}
          >
            {stadium}
          </Text>
        </View>

        <View style={styles.teamContainer}>
          {awayLogo ? (
            <CloudinaryImage
              publicId={awayLogo}
              style={styles.logo}
              contentFit="contain"
            />
          ) : (
            <View
              style={[
                styles.logoPlaceholder,
                { backgroundColor: theme.placeholder },
              ]}
            />
          )}
          <Text
            style={[styles.teamName, { color: theme.text }]}
            numberOfLines={2}
          >
            {awayTeam}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
    marginLeft: 2,
    shadowColor: Colors.light.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "column",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.placeholder,
    paddingBottom: 8,
    marginBottom: 12,
    gap: 8,
  },
  branchText: {
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
    flexShrink: 1,
  },
  livePill: {
    backgroundColor: "#E53935",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  livePillText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  competitionText: {
    fontSize: 11,
    fontWeight: "500",
    flexShrink: 1,
    textAlign: "right",
  },
  matchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
  },
  teamContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 2,
  },
  logo: {
    width: 44,
    height: 44,
    marginBottom: 6,
  },
  logoPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginBottom: 6,
  },
  teamName: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  matchInfo: {
    flex: 1.2,
    alignItems: "center",
    paddingHorizontal: 4,
  },
  dateText: {
    fontSize: 10,
    fontWeight: "600",
    marginBottom: 2,
    textAlign: "center",
  },
  timeText: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 2,
    textAlign: "center",
  },
  stadiumText: {
    fontSize: 9,
    textAlign: "center",
    lineHeight: 12,
  },
});
