import CloudinaryImage from "@/components/CloudinaryImage";
import { LivePill } from "@/components/ui/LivePulseDot";
import { useAppTheme } from "@/context/ThemeContext";
import {
  isMatchReminderScheduled,
  toggleMatchReminder,
} from "@/services/notificationService";
import { MatchDetailData } from "@/types";
import { triggerLightHaptic, triggerSuccessHaptic } from "@/utils/haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Image,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface MatchHeroHeaderProps {
  match: MatchDetailData;
  isLive: boolean;
  isFinished: boolean;
  topInset: number;
  onBack: () => void;
}

export function MatchHeroHeader({
  match,
  isLive,
  isFinished,
  topInset,
  onBack,
}: MatchHeroHeaderProps) {
  const { brand } = useAppTheme();
  const [reminded, setReminded] = useState(() =>
    isMatchReminderScheduled(match.id),
  );
  const [reminderHint, setReminderHint] = useState("");

  useEffect(() => {
    setReminded(isMatchReminderScheduled(match.id));
    setReminderHint("");
  }, [match.id]);

  useEffect(() => {
    if (!reminderHint) return;
    const t = setTimeout(() => setReminderHint(""), 3500);
    return () => clearTimeout(t);
  }, [reminderHint]);

  const handleToggleReminder = async () => {
    triggerLightHaptic();
    const res = await toggleMatchReminder(match);
    setReminded(res.scheduled);
    setReminderHint(res.message);
    if (res.scheduled) {
      triggerSuccessHaptic();
    }
  };

  const handleShare = async () => {
    triggerLightHaptic();
    const scorePart =
      isLive || isFinished
        ? `${match.homeScore ?? "0"} - ${match.awayScore ?? "0"}`
        : `${match.date} • ${match.time}`;
    const statusLabel = isLive ? "🔴 CANLI" : isFinished ? "🏁 MS" : "⏳";
    const msg = `${statusLabel} ${match.homeTeam} ${scorePart} ${match.awayTeam}\n🏆 ${match.competition}\n📍 ${match.stadium}\n💛💙 Fenerbahçe 1907`;
    try {
      await Share.share({ message: msg });
    } catch {
      // ignore share cancel
    }
  };

  return (
    <View
      style={[
        styles.heroContainer,
        { paddingTop: topInset, backgroundColor: brand.navy },
      ]}
    >
      <Image
        source={{
          uri: "https://media.fenerbahce.org/getmedia/5c3702c2-d352-45e3-b09e-7341857c50be/stad.jpg",
        }}
        style={styles.heroBackground}
      />
      <LinearGradient
        colors={["rgba(4, 21, 46, 0.72)", "rgba(7, 33, 70, 0.94)"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.topNavigation}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={brand.yellow} />
          <Text style={[styles.backButtonText, { color: brand.yellow }]}>
            Geri
          </Text>
        </TouchableOpacity>

        <View style={styles.badgeContainer}>
          <Text
            style={[styles.competitionBadgeText, { color: brand.yellow }]}
            numberOfLines={1}
          >
            {match.competition} {match.round ? `• ${match.round}` : ""}
          </Text>
        </View>

        <View style={styles.topRightActions}>
          {!isLive && !isFinished && (
            <TouchableOpacity
              style={styles.actionIconBtn}
              onPress={handleToggleReminder}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={reminded ? "notifications" : "notifications-outline"}
                size={20}
                color={brand.yellow}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionIconBtn}
            onPress={handleShare}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 8 }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="share-social-outline"
              size={20}
              color={brand.yellow}
            />
          </TouchableOpacity>
        </View>
      </View>

      {reminderHint ? (
        <View style={styles.reminderToast}>
          <Text style={[styles.reminderToastText, { color: brand.navy }]}>
            {reminderHint}
          </Text>
        </View>
      ) : null}

      <View style={styles.scoreboardRow}>
        <View style={styles.teamColumn}>
          <CloudinaryImage
            publicId={
              match.homeLogo ||
              (match.homeTeam.toLowerCase().includes("fenerbah")
                ? "fener.png"
                : "")
            }
            style={styles.teamLogo}
            contentFit="contain"
          />
          <Text style={styles.teamName} numberOfLines={2}>
            {match.homeTeam}
          </Text>
        </View>

        <View style={styles.centerScoreColumn}>
          {isLive ? (
            <View style={styles.scoreBox}>
              <Text style={[styles.scoreText, styles.tabularNumbers]}>
                {match.homeScore ?? "0"} - {match.awayScore ?? "0"}
              </Text>
              <View style={{ marginTop: 6 }}>
                <LivePill label={match.liveClock || "CANLI"} />
              </View>
            </View>
          ) : isFinished ? (
            <View style={styles.scoreBox}>
              <Text style={[styles.scoreText, styles.tabularNumbers]}>
                {match.homeScore} - {match.awayScore}
              </Text>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>MAÇ SONUCU</Text>
              </View>
            </View>
          ) : (
            <View style={styles.scoreBox}>
              <Text
                style={[
                  styles.timeText,
                  styles.tabularNumbers,
                  { color: brand.yellow },
                ]}
              >
                {match.time}
              </Text>
              <Text style={styles.dateText}>{match.date}</Text>
              <View
                style={[styles.statusPill, { backgroundColor: brand.yellow }]}
              >
                <Text style={[styles.statusPillText, { color: brand.navy }]}>
                  YAKLAŞAN MAÇ
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.teamColumn}>
          <CloudinaryImage
            publicId={
              match.awayLogo ||
              (match.awayTeam.toLowerCase().includes("fenerbah")
                ? "fener.png"
                : "")
            }
            style={styles.teamLogo}
            contentFit="contain"
          />
          <Text style={styles.teamName} numberOfLines={2}>
            {match.awayTeam}
          </Text>
        </View>
      </View>

      {match.quarterScores && match.quarterScores.length > 0 && (
        <View style={styles.quartersRow}>
          {match.quarterScores.map((score, idx) => (
            <View key={idx} style={styles.quarterBadge}>
              <Text style={[styles.quarterText, { color: brand.yellow }]}>
                {score}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.venueRow}>
        <Ionicons name="location-sharp" size={13} color={brand.yellow} />
        <Text style={styles.venueText} numberOfLines={1}>
          {match.stadium}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabularNumbers: {
    fontVariant: ["tabular-nums"],
  },
  heroContainer: {
    position: "relative",
    width: "100%",
    paddingBottom: 16,
  },
  heroBackground: {
    ...StyleSheet.absoluteFill,
    width: "100%",
    height: "100%",
  },
  topNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 2,
  },
  badgeContainer: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(255, 237, 0, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 237, 0, 0.3)",
  },
  competitionBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  topRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionIconBtn: {
    padding: 6,
  },
  reminderToast: {
    marginHorizontal: 16,
    marginBottom: 4,
    backgroundColor: "#FFED00",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: "center",
  },
  reminderToastText: {
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
  },
  scoreboardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  teamColumn: {
    flex: 2,
    alignItems: "center",
  },
  teamLogo: {
    width: 64,
    height: 64,
    marginBottom: 8,
  },
  teamName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  centerScoreColumn: {
    flex: 2.5,
    alignItems: "center",
  },
  scoreBox: {
    alignItems: "center",
  },
  scoreText: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  timeText: {
    fontSize: 26,
    fontWeight: "bold",
  },
  dateText: {
    color: "#CFD8DC",
    fontSize: 12,
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6,
  },
  statusPillText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  venueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    paddingHorizontal: 24,
  },
  venueText: {
    color: "#ECEFF1",
    fontSize: 11,
    marginLeft: 4,
  },
  quartersRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginVertical: 8,
    paddingHorizontal: 16,
    flexWrap: "wrap",
  },
  quarterBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  quarterText: {
    fontSize: 11,
    fontWeight: "bold",
  },
});
