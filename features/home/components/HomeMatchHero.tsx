import CloudinaryImage from "@/components/CloudinaryImage";
import { LivePill, LivePulseDot } from "@/components/ui/LivePulseDot";
import { HeroSkeleton } from "@/components/ui/Skeleton";
import { useAppTheme } from "@/context/ThemeContext";
import {
  isSameIstanbulCalendarDay,
  resolveMatchStatus,
} from "@/services/fixtureService";
import { MatchWeatherInfo } from "@/services/weatherService";
import { MatchData } from "@/types";
import { triggerSelectionHaptic } from "@/utils/haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type HeroBranch = "Futbol" | "Basketbol" | "Voleybol";

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function calculateTimeLeft(rawDate?: string): CountdownTime {
  if (!rawDate) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }
  const targetTime = new Date(rawDate).getTime();
  const diff = targetTime - Date.now();
  if (isNaN(diff) || diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isPast: false,
  };
}

interface HomeMatchHeroProps {
  nextMatch: MatchData | null;
  allFixtures: MatchData[];
  selectedBranch: HeroBranch;
  onSelectBranch: (branch: HeroBranch) => void;
  showWeather: boolean;
  weather?: MatchWeatherInfo | null;
  loading: boolean;
  topInset: number;
  onOpenMatchDetail: (matchId: string) => void;
  onOpenAllFixtures: () => void;
}

export function HomeMatchHero({
  nextMatch,
  allFixtures,
  selectedBranch,
  onSelectBranch,
  showWeather,
  weather,
  loading,
  topInset,
  onOpenMatchDetail,
  onOpenAllFixtures,
}: HomeMatchHeroProps) {
  const { brand } = useAppTheme();

  const [countdown, setCountdown] = useState<CountdownTime>(() =>
    calculateTimeLeft(nextMatch?.rawDate),
  );

  useEffect(() => {
    setCountdown(calculateTimeLeft(nextMatch?.rawDate));
    if (!nextMatch?.rawDate) return;

    const interval = setInterval(() => {
      setCountdown(calculateTimeLeft(nextMatch.rawDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [nextMatch?.rawDate]);

  const isNextMatchSameCalendarDay = useMemo(
    () => isSameIstanbulCalendarDay(nextMatch?.rawDate),
    [nextMatch?.rawDate],
  );

  const liveByBranch = useMemo(() => {
    const set = new Set<string>();
    allFixtures.forEach((m) => {
      if (resolveMatchStatus(m) === "live") {
        set.add(m.branch);
      }
    });
    return set;
  }, [allFixtures]);

  if (!nextMatch) {
    return (
      <View
        style={[
          styles.heroContainer,
          {
            paddingTop: topInset,
            backgroundColor: brand.navy,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        {loading ? (
          <HeroSkeleton />
        ) : (
          <Text style={{ color: brand.white }}>
            Sıradaki maç bilgisi bekleniyor...
          </Text>
        )}
      </View>
    );
  }

  const nextMatchStatus = resolveMatchStatus(nextMatch);

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
        style={styles.heroImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={["rgba(4, 21, 46, 0.72)", "rgba(7, 33, 70, 0.94)"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.heroContent}>
        <View style={styles.heroBranchBar}>
          {(["Futbol", "Basketbol", "Voleybol"] as const).map((branch) => {
            const isSelected = selectedBranch === branch;
            const hasLive = liveByBranch.has(branch);
            const emoji =
              branch === "Futbol"
                ? "⚽"
                : branch === "Basketbol"
                  ? "🏀"
                  : "🏐";
            return (
              <TouchableOpacity
                key={branch}
                style={[
                  styles.heroBranchTab,
                  isSelected && { backgroundColor: brand.yellow },
                ]}
                onPress={() => {
                  triggerSelectionHaptic();
                  onSelectBranch(branch);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.branchTabInner}>
                  <Text
                    style={[
                      styles.heroBranchTabText,
                      isSelected && { color: brand.navy, fontWeight: "bold" },
                    ]}
                  >
                    {emoji} {branch}
                  </Text>
                  {hasLive && <LivePulseDot color={brand.liveRed} size={6} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>
            {nextMatch.competition}{" "}
            {nextMatch.round ? `• ${nextMatch.round}` : ""}
          </Text>
        </View>

        <View style={styles.heroMatchRow}>
          <View style={styles.heroTeam}>
            <View style={styles.logoHalo}>
              <CloudinaryImage
                publicId={nextMatch.homeLogo || "fener.png"}
                style={styles.heroLogo}
                contentFit="contain"
              />
            </View>
            <Text style={styles.heroTeamName} numberOfLines={2}>
              {nextMatch.homeTeam}
            </Text>
          </View>

          <View style={styles.heroScoreBoard}>
            {nextMatchStatus === "live" || nextMatchStatus === "finished" ? (
              <>
                <Text style={styles.heroDate}>{nextMatch.date}</Text>
                <Text style={[styles.heroTime, styles.tabularNumbers]}>
                  {nextMatch.homeScore ?? "0"} - {nextMatch.awayScore ?? "0"}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.heroDate}>{nextMatch.date}</Text>
                <Text style={[styles.heroTime, styles.tabularNumbers]}>
                  {nextMatch.time}
                </Text>
              </>
            )}
            <Text style={styles.heroStadium} numberOfLines={1}>
              📍 {nextMatch.stadium}
            </Text>
            {showWeather && weather && (
              <Text style={styles.heroWeatherText}>
                {weather.emoji} Kadıköy {weather.temperatureC}°C •{" "}
                {weather.conditionLabel}
              </Text>
            )}
          </View>

          <View style={styles.heroTeam}>
            <View style={styles.logoHalo}>
              <CloudinaryImage
                publicId={nextMatch.awayLogo || "fener.png"}
                style={styles.heroLogo}
                contentFit="contain"
              />
            </View>
            <Text style={styles.heroTeamName} numberOfLines={2}>
              {nextMatch.awayTeam}
            </Text>
          </View>
        </View>

        {nextMatchStatus === "live" ? (
          <View style={styles.liveBannerWrap}>
            <LivePill
              label={`CANLI OYNANIYOR${nextMatch.liveClock ? ` • ${nextMatch.liveClock}` : ""}`}
            />
          </View>
        ) : !countdown.isPast ? (
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownTitle}>⚡ BAŞLAMASINA KALAN SÜRE</Text>
            <View style={styles.countdownRow}>
              <View style={styles.countdownBox}>
                <Text style={[styles.countdownNumber, styles.tabularNumbers]}>
                  {String(countdown.days).padStart(2, "0")}
                </Text>
                <Text style={styles.countdownLabel}>GÜN</Text>
              </View>
              <Text style={styles.countdownColon}>:</Text>
              <View style={styles.countdownBox}>
                <Text style={[styles.countdownNumber, styles.tabularNumbers]}>
                  {String(countdown.hours).padStart(2, "0")}
                </Text>
                <Text style={styles.countdownLabel}>SAAT</Text>
              </View>
              <Text style={styles.countdownColon}>:</Text>
              <View style={styles.countdownBox}>
                <Text style={[styles.countdownNumber, styles.tabularNumbers]}>
                  {String(countdown.minutes).padStart(2, "0")}
                </Text>
                <Text style={styles.countdownLabel}>DAKİKA</Text>
              </View>
              <Text style={styles.countdownColon}>:</Text>
              <View style={styles.countdownBox}>
                <Text style={[styles.countdownNumber, styles.tabularNumbers]}>
                  {String(countdown.seconds).padStart(2, "0")}
                </Text>
                <Text style={styles.countdownLabel}>SANİYE</Text>
              </View>
            </View>
          </View>
        ) : nextMatchStatus === "finished" ? (
          <View style={styles.matchDayBanner}>
            <Text style={styles.matchDayBannerText}>
              🏁 MAÇ SONUCU: {nextMatch.homeScore} - {nextMatch.awayScore}
            </Text>
          </View>
        ) : isNextMatchSameCalendarDay ? (
          <View style={styles.matchDayBanner}>
            <Text style={styles.matchDayBannerText}>🔥 BUGÜN MAÇ GÜNÜ! 🔥</Text>
          </View>
        ) : null}

        <View style={styles.heroButtonsRow}>
          <TouchableOpacity
            style={styles.heroActionBtn}
            onPress={() => onOpenMatchDetail(nextMatch.id)}
            activeOpacity={0.85}
          >
            <Text style={styles.heroActionBtnText}>Maç Detayı</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.heroSecondaryBtn}
            onPress={onOpenAllFixtures}
            activeOpacity={0.85}
          >
            <Text style={styles.heroSecondaryBtnText}>Tüm Fikstür</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabularNumbers: {
    fontVariant: ["tabular-nums"],
  },
  heroContainer: {
    width: "100%",
    minHeight: 330,
    position: "relative",
    paddingBottom: 18,
  },
  heroImage: {
    ...StyleSheet.absoluteFill,
    width: "100%",
    height: "100%",
  },
  heroContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    alignItems: "center",
    width: "100%",
  },
  heroBranchBar: {
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 20,
    padding: 3,
    marginBottom: 10,
  },
  heroBranchTab: {
    paddingHorizontal: 13,
    paddingVertical: 5,
    borderRadius: 16,
  },
  branchTabInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  heroBranchTabText: {
    color: "rgba(255, 255, 255, 0.78)",
    fontSize: 12,
    fontWeight: "600",
  },
  heroBadge: {
    backgroundColor: "rgba(255, 237, 0, 0.18)",
    borderWidth: 1,
    borderColor: "#FFED00",
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 10,
  },
  heroBadgeText: {
    color: "#FFED00",
    fontSize: 11,
    fontWeight: "bold",
  },
  heroMatchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 6,
  },
  heroTeam: {
    alignItems: "center",
    flex: 1,
  },
  logoHalo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  heroLogo: {
    width: 48,
    height: 48,
  },
  heroTeamName: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  heroScoreBoard: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1.2,
  },
  heroDate: {
    color: "#FFFFFF",
    fontSize: 11,
    opacity: 0.85,
    marginBottom: 2,
    textAlign: "center",
  },
  heroTime: {
    color: "#FFED00",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 1,
  },
  heroStadium: {
    color: "#FFFFFF",
    fontSize: 9,
    opacity: 0.78,
    marginTop: 3,
    textAlign: "center",
  },
  heroWeatherText: {
    color: "#FFED00",
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 3,
  },
  liveBannerWrap: {
    marginTop: 12,
    alignItems: "center",
  },
  countdownContainer: {
    marginTop: 12,
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.42)",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 237, 0, 0.28)",
  },
  countdownTitle: {
    color: "#FFED00",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 6,
  },
  countdownRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  countdownBox: {
    backgroundColor: "rgba(7, 33, 70, 0.92)",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 44,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 237, 0, 0.35)",
  },
  countdownNumber: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },
  countdownLabel: {
    color: "#FFED00",
    fontSize: 8,
    fontWeight: "bold",
    marginTop: 1,
  },
  countdownColon: {
    color: "#FFED00",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 8,
  },
  matchDayBanner: {
    marginTop: 12,
    backgroundColor: "#FFED00",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  matchDayBannerText: {
    color: "#072146",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  heroButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    width: "100%",
  },
  heroActionBtn: {
    flex: 1,
    backgroundColor: "#FFED00",
    paddingVertical: 9,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  heroActionBtnText: {
    color: "#072146",
    fontSize: 12,
    fontWeight: "bold",
  },
  heroSecondaryBtn: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.32)",
    paddingVertical: 9,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  heroSecondaryBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
});
