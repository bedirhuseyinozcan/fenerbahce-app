import CloudinaryImage from "@/components/CloudinaryImage";
import { Radius } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";
import { useFixturesQuery } from "@/hooks/useSportsQueries";
import { resolveMatchStatus } from "@/services/fixtureService";
import { triggerSelectionHaptic } from "@/utils/haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface RivalRecord {
  key: "gs" | "bjk" | "ts";
  name: string;
  logo: string;
  totalMatches: number;
  fbWins: number;
  draws: number;
  rivalWins: number;
  fbGoals: number;
  rivalGoals: number;
  biggestWin: string;
  memorableNote: string;
}

const RIVAL_RECORDS: RivalRecord[] = [
  {
    key: "gs",
    name: "Galatasaray",
    logo: "https://res.cloudinary.com/z1hvtpqh/image/upload/v1789046288/gs.png",
    totalMatches: 401,
    fbWins: 149,
    draws: 122,
    rivalWins: 130,
    fbGoals: 542,
    rivalGoals: 498,
    biggestWin: "Fenerbahçe 6 - 0 Galatasaray (6 Kasım 2002)",
    memorableNote:
      "Kıtalararası derbide toplam galibiyet ve atılan gol sayısında Fenerbahçe'nin tarihi üstünlüğü bulunuyor.",
  },
  {
    key: "bjk",
    name: "Beşiktaş",
    logo: "https://res.cloudinary.com/z1hvtpqh/image/upload/v1789046288/bjk.png",
    totalMatches: 360,
    fbWins: 135,
    draws: 97,
    rivalWins: 128,
    fbGoals: 499,
    rivalGoals: 459,
    biggestWin: "Fenerbahçe 7 - 0 Beşiktaş (6 Aralık 1958)",
    memorableNote:
      "100 yılı aşkın ezeli rekabette Fenerbahçe galibiyet ve gol sayılarında önde yer alıyor.",
  },
  {
    key: "ts",
    name: "Trabzonspor",
    logo: "https://res.cloudinary.com/z1hvtpqh/image/upload/v1789046288/ts.png",
    totalMatches: 136,
    fbWins: 54,
    draws: 38,
    rivalWins: 44,
    fbGoals: 176,
    rivalGoals: 156,
    biggestWin: "Trabzonspor 0 - 4 Fenerbahçe (2016) / FB 5 - 2 TS (1999)",
    memorableNote:
      "Süper Lig ve Türkiye Kupası randevularında sarı-lacivertlilerin net galibiyet üstünlüğü var.",
  },
];

export default function DerbiMerkeziScreen() {
  const router = useRouter();
  const { theme, brand } = useAppTheme();

  const [selectedRival, setSelectedRival] = useState<"gs" | "bjk" | "ts">("gs");
  const { data: fixtures = [] } = useFixturesQuery();

  const currentRival = useMemo(
    () => RIVAL_RECORDS.find((r) => r.key === selectedRival) || RIVAL_RECORDS[0],
    [selectedRival],
  );

  const recentForm = useMemo(() => {
    const finished = fixtures
      .filter(
        (m) =>
          m.branch === "Futbol" &&
          resolveMatchStatus(m) === "finished" &&
          m.homeScore != null &&
          m.awayScore != null,
      )
      .slice(0, 5);

    return finished.map((m) => {
      const isFBHome = m.homeTeam.toLowerCase().includes("fenerbah");
      const hs = parseInt(String(m.homeScore), 10) || 0;
      const as = parseInt(String(m.awayScore), 10) || 0;
      const fbScore = isFBHome ? hs : as;
      const oppScore = isFBHome ? as : hs;
      const result: "G" | "B" | "M" =
        fbScore > oppScore ? "G" : fbScore === oppScore ? "B" : "M";
      return {
        id: m.id,
        opponent: isFBHome ? m.awayTeam : m.homeTeam,
        score: `${hs}-${as}`,
        result,
      };
    });
  }, [fixtures]);

  const winPct = Math.round(
    (currentRival.fbWins / currentRival.totalMatches) * 100,
  );
  const drawPct = Math.round(
    (currentRival.draws / currentRival.totalMatches) * 100,
  );
  const lossPct = 100 - winPct - drawPct;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen
        options={{
          title: "Derbi Merkezi & H2H",
          headerStyle: { backgroundColor: brand.navy },
          headerTintColor: brand.yellow,
          headerBackTitle: "Geri",
        }}
      />

      <View style={styles.rivalTabs}>
        {RIVAL_RECORDS.map((r) => {
          const isActive = r.key === selectedRival;
          return (
            <TouchableOpacity
              key={r.key}
              style={[
                styles.rivalTabBtn,
                {
                  backgroundColor: isActive ? brand.navy : theme.cardBackground,
                  borderColor: isActive ? brand.yellow : theme.border,
                },
              ]}
              onPress={() => {
                triggerSelectionHaptic();
                setSelectedRival(r.key);
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.rivalTabText,
                  { color: isActive ? brand.yellow : theme.text },
                ]}
              >
                vs {r.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <LinearGradient
        colors={[brand.navyLight, brand.navyDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.heroCard, { borderColor: brand.yellow }]}
      >
        <Text style={[styles.heroSubtitle, { color: brand.yellow }]}>
          TÜM ZAMANLAR REKABET RAPORU
        </Text>
        <View style={styles.teamsRow}>
          <View style={styles.teamCol}>
            <CloudinaryImage
              publicId="fener.png"
              style={styles.teamLogo}
              contentFit="contain"
            />
            <Text style={styles.teamName}>Fenerbahçe</Text>
          </View>

          <View style={[styles.totalBox, { borderColor: brand.yellow }]}>
            <Text
              style={[
                styles.totalCount,
                styles.tabularNumbers,
                { color: brand.yellow },
              ]}
            >
              {currentRival.totalMatches}
            </Text>
            <Text style={styles.totalLabel}>MAÇ</Text>
          </View>

          <View style={styles.teamCol}>
            <CloudinaryImage
              publicId={currentRival.logo}
              style={styles.teamLogo}
              contentFit="contain"
            />
            <Text style={styles.teamName}>{currentRival.name}</Text>
          </View>
        </View>

        <View style={styles.h2hNumbersRow}>
          <View style={styles.h2hStatBox}>
            <Text
              style={[
                styles.h2hBigNum,
                styles.tabularNumbers,
                { color: brand.yellow },
              ]}
            >
              {currentRival.fbWins}
            </Text>
            <Text style={styles.h2hStatLabel}>FB Galibiyeti</Text>
          </View>
          <View style={styles.h2hStatBox}>
            <Text
              style={[
                styles.h2hBigNum,
                styles.tabularNumbers,
                { color: "#CFD8DC" },
              ]}
            >
              {currentRival.draws}
            </Text>
            <Text style={styles.h2hStatLabel}>Beraberlik</Text>
          </View>
          <View style={styles.h2hStatBox}>
            <Text
              style={[
                styles.h2hBigNum,
                styles.tabularNumbers,
                { color: "#FF8A80" },
              ]}
            >
              {currentRival.rivalWins}
            </Text>
            <Text style={styles.h2hStatLabel}>{currentRival.name}</Text>
          </View>
        </View>

        <View style={styles.barContainer}>
          <View
            style={{
              width: `${winPct}%`,
              backgroundColor: brand.yellow,
              height: "100%",
            }}
          />
          <View
            style={{
              width: `${drawPct}%`,
              backgroundColor: "#90A4AE",
              height: "100%",
            }}
          />
          <View
            style={{
              width: `${lossPct}%`,
              backgroundColor: brand.liveRed,
              height: "100%",
            }}
          />
        </View>

        <View style={styles.goalsRow}>
          <Text style={styles.goalText}>
            ⚽ FB Golü:{" "}
            <Text style={[styles.tabularNumbers, { fontWeight: "900" }]}>
              {currentRival.fbGoals}
            </Text>
          </Text>
          <Text style={styles.goalText}>
            Rakip Golü:{" "}
            <Text style={[styles.tabularNumbers, { fontWeight: "900" }]}>
              {currentRival.rivalGoals}
            </Text>
          </Text>
        </View>
      </LinearGradient>

      <View
        style={[
          styles.infoCard,
          { backgroundColor: theme.cardBackground, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.cardHeading, { color: theme.accent }]}>
          🏆 UNUTULMAZ DERBİ ZAFERİ
        </Text>
        <Text style={[styles.biggestWinText, { color: theme.text }]}>
          {currentRival.biggestWin}
        </Text>
        <Text style={[styles.noteText, { color: theme.secondaryText }]}>
          {currentRival.memorableNote}
        </Text>
      </View>

      <View
        style={[
          styles.infoCard,
          { backgroundColor: theme.cardBackground, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.cardHeading, { color: theme.accent }]}>
          📈 FENERBAHÇE SON MAÇ FORMU
        </Text>
        {recentForm.length > 0 ? (
          <View style={{ gap: 10, marginTop: 8 }}>
            {recentForm.map((f) => {
              const badgeColor =
                f.result === "G"
                  ? brand.winGreen
                  : f.result === "B"
                    ? brand.drawAmber
                    : brand.lossRed;
              return (
                <TouchableOpacity
                  key={f.id}
                  onPress={() => router.push(`/mac/${f.id}` as any)}
                  style={[styles.formRow, { borderBottomColor: theme.divider }]}
                >
                  <View
                    style={[styles.formBadge, { backgroundColor: badgeColor }]}
                  >
                    <Text style={styles.formBadgeText}>{f.result}</Text>
                  </View>
                  <Text
                    style={[styles.formOpponent, { color: theme.text }]}
                    numberOfLines={1}
                  >
                    vs {f.opponent}
                  </Text>
                  <Text
                    style={[
                      styles.formScore,
                      styles.tabularNumbers,
                      { color: theme.text },
                    ]}
                  >
                    {f.score}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <Text style={{ color: theme.secondaryText, fontSize: 12 }}>
            Henüz tamamlanmış maç verisi yok.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  tabularNumbers: {
    fontVariant: ["tabular-nums"],
  },
  rivalTabs: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  rivalTabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  rivalTabText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  heroCard: {
    borderRadius: Radius.lg,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
  },
  heroSubtitle: {
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  teamsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  teamCol: {
    flex: 1,
    alignItems: "center",
  },
  teamLogo: {
    width: 56,
    height: 56,
    marginBottom: 6,
  },
  teamName: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "center",
  },
  totalBox: {
    backgroundColor: "rgba(255, 237, 0, 0.15)",
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
  },
  totalCount: {
    fontSize: 22,
    fontWeight: "900",
  },
  totalLabel: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "bold",
  },
  h2hNumbersRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  h2hStatBox: {
    alignItems: "center",
  },
  h2hBigNum: {
    fontSize: 24,
    fontWeight: "900",
  },
  h2hStatLabel: {
    color: "#ECEFF1",
    fontSize: 11,
    marginTop: 2,
  },
  barContainer: {
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
    flexDirection: "row",
    marginBottom: 12,
  },
  goalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.12)",
  },
  goalText: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  infoCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  cardHeading: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  biggestWinText: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 6,
  },
  noteText: {
    fontSize: 12,
    lineHeight: 18,
  },
  formRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
  },
  formBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  formBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  formOpponent: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },
  formScore: {
    fontSize: 14,
    fontWeight: "bold",
  },
});
