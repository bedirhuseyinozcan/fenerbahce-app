import CloudinaryImage from "@/components/CloudinaryImage";
import Colors from "@/constants/Colors";
import {
  fallbackCuratedFixtures,
  fetchFixtures,
  getCachedFixturesSync,
} from "@/services/fixtureService";
import { MatchData } from "@/types";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
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
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const [selectedRival, setSelectedRival] = useState<"gs" | "bjk" | "ts">("gs");
  const [fixtures, setFixtures] = useState<MatchData[]>(
    () => getCachedFixturesSync() || fallbackCuratedFixtures,
  );

  useEffect(() => {
    fetchFixtures().then(setFixtures);
  }, []);

  const currentRival = useMemo(
    () => RIVAL_RECORDS.find((r) => r.key === selectedRival) || RIVAL_RECORDS[0],
    [selectedRival],
  );

  // Fenerbahçe'nin son 5 bitmiş maçtaki form grafiği (G / B / M)
  const recentForm = useMemo(() => {
    const finished = fixtures
      .filter(
        (m) =>
          m.branch === "Futbol" &&
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
          headerStyle: { backgroundColor: Colors.brand.navy },
          headerTintColor: Colors.brand.yellow,
          headerBackTitle: "Geri",
        }}
      />

      {/* Rakip Seçici */}
      <View style={styles.rivalTabs}>
        {RIVAL_RECORDS.map((r) => {
          const isActive = r.key === selectedRival;
          return (
            <TouchableOpacity
              key={r.key}
              style={[
                styles.rivalTabBtn,
                {
                  backgroundColor: isActive
                    ? Colors.brand.navy
                    : theme.cardBackground,
                  borderColor: isActive ? Colors.brand.yellow : theme.placeholder,
                },
              ]}
              onPress={() => setSelectedRival(r.key)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.rivalTabText,
                  { color: isActive ? Colors.brand.yellow : theme.text },
                ]}
              >
                vs {r.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* H2H Büyük Karşılaştırma Kartı */}
      <View style={styles.heroCard}>
        <Text style={styles.heroSubtitle}>TÜM ZAMANLAR REKABET RAPORU</Text>
        <View style={styles.teamsRow}>
          <View style={styles.teamCol}>
            <CloudinaryImage
              publicId="fener.png"
              style={styles.teamLogo}
              contentFit="contain"
            />
            <Text style={styles.teamName}>Fenerbahçe</Text>
          </View>

          <View style={styles.totalBox}>
            <Text style={styles.totalCount}>{currentRival.totalMatches}</Text>
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

        {/* Galibiyet / Beraberlik / Mağlubiyet Sayıları */}
        <View style={styles.h2hNumbersRow}>
          <View style={styles.h2hStatBox}>
            <Text style={[styles.h2hBigNum, { color: Colors.brand.yellow }]}>
              {currentRival.fbWins}
            </Text>
            <Text style={styles.h2hStatLabel}>FB Galibiyeti</Text>
          </View>
          <View style={styles.h2hStatBox}>
            <Text style={[styles.h2hBigNum, { color: "#CFD8DC" }]}>
              {currentRival.draws}
            </Text>
            <Text style={styles.h2hStatLabel}>Beraberlik</Text>
          </View>
          <View style={styles.h2hStatBox}>
            <Text style={[styles.h2hBigNum, { color: "#FF8A80" }]}>
              {currentRival.rivalWins}
            </Text>
            <Text style={styles.h2hStatLabel}>{currentRival.name}</Text>
          </View>
        </View>

        {/* Oran Barı */}
        <View style={styles.barContainer}>
          <View
            style={{
              width: `${winPct}%`,
              backgroundColor: Colors.brand.yellow,
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
              backgroundColor: "#E53935",
              height: "100%",
            }}
          />
        </View>

        {/* Goller */}
        <View style={styles.goalsRow}>
          <Text style={styles.goalText}>
            ⚽ FB Golü: <Text style={{ fontWeight: "900" }}>{currentRival.fbGoals}</Text>
          </Text>
          <Text style={styles.goalText}>
            Rakip Golü:{" "}
            <Text style={{ fontWeight: "900" }}>{currentRival.rivalGoals}</Text>
          </Text>
        </View>
      </View>

      {/* Tarihi Fark ve Not Kartı */}
      <View
        style={[styles.infoCard, { backgroundColor: theme.cardBackground }]}
      >
        <Text style={[styles.cardHeading, { color: Colors.brand.navy }]}>
          🏆 UNUTULMAZ DERBİ ZAFERİ
        </Text>
        <Text style={[styles.biggestWinText, { color: theme.text }]}>
          {currentRival.biggestWin}
        </Text>
        <Text style={[styles.noteText, { color: theme.secondaryText }]}>
          {currentRival.memorableNote}
        </Text>
      </View>

      {/* Fenerbahçe Son Maçlar Form Grafiği */}
      <View
        style={[styles.infoCard, { backgroundColor: theme.cardBackground }]}
      >
        <Text style={[styles.cardHeading, { color: Colors.brand.navy }]}>
          📈 FENERBAHÇE SON MAÇ FORMU
        </Text>
        {recentForm.length > 0 ? (
          <View style={{ gap: 10, marginTop: 8 }}>
            {recentForm.map((f) => {
              const badgeColor =
                f.result === "G"
                  ? "#00C853"
                  : f.result === "B"
                    ? "#FFA000"
                    : "#E53935";
              return (
                <TouchableOpacity
                  key={f.id}
                  onPress={() => router.push(`/mac/${f.id}` as any)}
                  style={styles.formRow}
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
                  <Text style={[styles.formScore, { color: theme.text }]}>
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
    backgroundColor: Colors.brand.navy,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: Colors.brand.yellow,
  },
  heroSubtitle: {
    color: Colors.brand.yellow,
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
    borderColor: Colors.brand.yellow,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
  },
  totalCount: {
    color: Colors.brand.yellow,
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
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    borderBottomColor: "rgba(0,0,0,0.06)",
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
