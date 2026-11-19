import { Radius } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";
import { useFixturesQuery } from "@/hooks/useSportsQueries";
import {
  evaluatePredictionResult,
  getSavedPredictions,
} from "@/services/fanEngagementService";
import { resolveMatchStatus } from "@/services/fixtureService";
import {
  getNotificationPrefs,
  getOrCreateDeviceId,
} from "@/services/notificationPrefs";
import {
  buildRoomLeaderboard,
  fetchRoomPredictions,
  formatLeagueShareText,
  generateRoomCode,
  getLeagueProfile,
  normalizeRoomCode,
  saveLeagueProfile,
  syncAllLocalPredictionsToWorker,
} from "@/services/predictionLeagueService";
import { PredictionLeagueProfile, RemotePredictionRow } from "@/types";
import {
  triggerLightHaptic,
  triggerSelectionHaptic,
  triggerSuccessHaptic,
} from "@/utils/haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function TahminLigiScreen() {
  const { theme, brand } = useAppTheme();
  const router = useRouter();
  const { data: matches = [], refetch: refetchFixtures } = useFixturesQuery();

  const [profile, setProfile] = useState<PredictionLeagueProfile>(
    getLeagueProfile,
  );
  const [nicknameInput, setNicknameInput] = useState(profile.nickname);
  const [roomInput, setRoomInput] = useState(profile.roomCode);
  const [remoteRows, setRemoteRows] = useState<RemotePredictionRow[]>([]);
  const [statusMsg, setStatusMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  const workerConfigured = Boolean(
    getNotificationPrefs().workerBaseUrl.trim(),
  );
  const myDeviceId = useMemo(() => getOrCreateDeviceId(), []);

  useFocusEffect(
    useCallback(() => {
      setRefreshTick((t) => t + 1);
    }, []),
  );

  const loadRoom = useCallback(
    async (roomCodeOverride?: string) => {
      const code = normalizeRoomCode(roomCodeOverride ?? profile.roomCode);
      if (!workerConfigured || code.length < 3) {
        setRemoteRows([]);
        return;
      }
      setBusy(true);
      const res = await fetchRoomPredictions(code);
      setRemoteRows(res.predictions);
      setStatusMsg(res.message);
      setBusy(false);
    },
    [profile.roomCode, workerConfigured],
  );

  useEffect(() => {
    if (workerConfigured && profile.roomCode.length >= 3) {
      loadRoom(profile.roomCode);
    }
  }, [workerConfigured, profile.roomCode, loadRoom]);

  const savedPredsMap = useMemo(() => {
    void refreshTick;
    return getSavedPredictions();
  }, [refreshTick]);

  const leaderboard = useMemo(
    () => buildRoomLeaderboard(remoteRows, matches, myDeviceId, profile),
    [remoteRows, matches, myDeviceId, profile],
  );

  const upcomingMatches = useMemo(
    () =>
      matches
        .filter((m) => resolveMatchStatus(m) !== "finished")
        .slice(0, 6),
    [matches],
  );

  const myHistory = useMemo(() => {
    return Object.values(savedPredsMap)
      .map((pred) => {
        const match = matches.find((m) => m.id === pred.matchId);
        return {
          pred,
          match,
          evalResult: match
            ? evaluatePredictionResult(pred, match)
            : { status: "pending" as const, points: 0 as const },
        };
      })
      .sort((a, b) => b.pred.createdAt.localeCompare(a.pred.createdAt));
  }, [savedPredsMap, matches]);

  const handleSaveProfile = async () => {
    triggerLightHaptic();
    const cleanedNick = nicknameInput.trim().replace(/\s+/g, " ");
    const cleanedRoom = normalizeRoomCode(roomInput);
    if (cleanedNick.length < 2) {
      setStatusMsg("❌ En az 2 harfli bir takma ad gir.");
      return;
    }
    const updated = saveLeagueProfile({
      nickname: cleanedNick,
      roomCode: cleanedRoom,
    });
    setProfile(updated);
    setNicknameInput(updated.nickname);
    setRoomInput(updated.roomCode);
    triggerSuccessHaptic();

    if (!workerConfigured) {
      setStatusMsg(
        "✅ Profil kaydedildi. Çok oyunculu senkron için Bildirim Merkezi'nden Worker URL ekle.",
      );
      return;
    }

    if (updated.roomCode.length < 3) {
      setStatusMsg("❌ Oda kodu en az 3 karakter olmalı (ör. FB1907).");
      return;
    }

    setBusy(true);
    const syncRes = await syncAllLocalPredictionsToWorker();
    const roomRes = await fetchRoomPredictions(updated.roomCode);
    setRemoteRows(roomRes.predictions);
    setStatusMsg(`${syncRes.message} • ${roomRes.message}`);
    setBusy(false);
  };

  const handleGenerateRoom = () => {
    triggerSelectionHaptic();
    const code = generateRoomCode();
    setRoomInput(code);
    const updated = saveLeagueProfile({ roomCode: code });
    setProfile(updated);
    setStatusMsg(`🔑 Yeni oda kodu oluşturuldu: ${code}`);
  };

  const handleRefreshAll = async () => {
    triggerLightHaptic();
    setBusy(true);
    await refetchFixtures();
    if (workerConfigured && profile.roomCode.length >= 3 && profile.nickname.length >= 2) {
      const syncRes = await syncAllLocalPredictionsToWorker();
      const roomRes = await fetchRoomPredictions(profile.roomCode);
      setRemoteRows(roomRes.predictions);
      setStatusMsg(`${syncRes.message} • ${roomRes.message}`);
    } else if (workerConfigured && profile.roomCode.length >= 3) {
      const roomRes = await fetchRoomPredictions(profile.roomCode);
      setRemoteRows(roomRes.predictions);
      setStatusMsg(roomRes.message);
    }
    setBusy(false);
  };

  const handleShare = async () => {
    triggerSelectionHaptic();
    const message = formatLeagueShareText(profile, leaderboard, matches);
    try {
      await Share.share({
        title: "Fenerbahçe Arkadaş Tahmin Ligi",
        message,
      });
    } catch {
      // Kullanıcı iptal ettiyse veya tarayıcı Share API'si kısıtlıysa sessizce yoksay
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={busy}
          onRefresh={handleRefreshAll}
          tintColor={theme.accent}
          colors={[brand.navy, brand.yellow]}
        />
      }
    >
      <Stack.Screen
        options={{
          title: "Arkadaş Tahmin Ligi",
          headerStyle: { backgroundColor: brand.navy },
          headerTintColor: brand.yellow,
          headerBackTitle: "Geri",
        }}
      />

      {/* 1. PROFİL VE ODA KARTI */}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.cardBackground, borderColor: theme.border },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: theme.accent }]}>
            🏆 ODA & PROFİL AYARLARI
          </Text>
          <TouchableOpacity
            onPress={handleGenerateRoom}
            style={[styles.genBtn, { backgroundColor: theme.badgeBg }]}
          >
            <Ionicons name="sparkles-outline" size={12} color={theme.badgeText} />
            <Text style={[styles.genBtnText, { color: theme.badgeText }]}>
              Yeni Oda Üret
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.desc, { color: theme.secondaryText }]}>
          Tam skor +3 puan, doğru sonuç +1 puan. Aynı oda kodunu paylaşarak
          arkadaş grubunla sezonluk puan tablosunda yarış.
        </Text>

        <View style={styles.inputRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.inputLabel, { color: theme.secondaryText }]}>
              Takma Adın
            </Text>
            <TextInput
              value={nicknameInput}
              onChangeText={setNicknameInput}
              placeholder="Örn: Alex10"
              placeholderTextColor={theme.secondaryText}
              maxLength={24}
              style={[
                styles.input,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.inputBg,
                  color: theme.text,
                },
              ]}
            />
          </View>
          <View style={{ width: 130 }}>
            <Text style={[styles.inputLabel, { color: theme.secondaryText }]}>
              Oda Kodu
            </Text>
            <TextInput
              value={roomInput}
              onChangeText={(t) => setRoomInput(normalizeRoomCode(t))}
              placeholder="FB1907"
              placeholderTextColor={theme.secondaryText}
              autoCapitalize="characters"
              maxLength={16}
              style={[
                styles.input,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.inputBg,
                  color: theme.text,
                  fontWeight: "800",
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity
            disabled={busy}
            onPress={handleSaveProfile}
            style={[styles.primaryBtn, { backgroundColor: brand.navy }]}
            activeOpacity={0.85}
          >
            <Text style={[styles.primaryBtnText, { color: brand.yellow }]}>
              Kaydet & Odaya Katıl
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShare}
            style={[styles.primaryBtn, { backgroundColor: brand.yellow }]}
            activeOpacity={0.85}
          >
            <Text style={[styles.primaryBtnText, { color: brand.navy }]}>
              Skor & Davet Paylaş
            </Text>
          </TouchableOpacity>
        </View>

        {statusMsg ? (
          <Text style={[styles.statusMsg, { color: theme.text }]}>
            {statusMsg}
          </Text>
        ) : null}
      </View>

      {/* 2. WORKER BAĞLANTI DURUMU */}
      <View
        style={[
          styles.bannerCard,
          {
            backgroundColor: workerConfigured
              ? theme.badgeBg
              : theme.surfaceSubtle,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.bannerTitle, { color: theme.text }]}>
            {workerConfigured
              ? "☁️ Çok Oyunculu Oda Senkronu Aktif"
              : "📱 Yerel Mod (Tek Cihaz)"}
          </Text>
          <Text style={[styles.bannerSub, { color: theme.secondaryText }]}>
            {workerConfigured
              ? "Tahminlerin Cloudflare D1 veritabanı üzerinden odadaki arkadaşlarınla eşitlenir."
              : "Arkadaş sıralamasını buluta bağlamak için Bildirim Merkezi'nden ücretsiz Cloudflare Worker URL'si gir."}
          </Text>
        </View>
        {workerConfigured ? (
          <TouchableOpacity
            disabled={busy}
            onPress={handleRefreshAll}
            style={[styles.smallBtn, { backgroundColor: brand.navy }]}
          >
            <Text style={[styles.smallBtnText, { color: brand.yellow }]}>
              Eşitle
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => router.push("/bildirimler" as any)}
            style={[styles.smallBtn, { backgroundColor: brand.navy }]}
          >
            <Text style={[styles.smallBtnText, { color: brand.yellow }]}>
              Ayarla →
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 3. LİDERLİK TABLOSU */}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.cardBackground, borderColor: theme.border },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: theme.accent }]}>
            📊 LİDERLİK TABLOSU
            {profile.roomCode ? ` (${profile.roomCode})` : ""}
          </Text>
          <Text style={[styles.countPill, { color: theme.secondaryText }]}>
            {leaderboard.length} oyuncu
          </Text>
        </View>

        {leaderboard.map((entry, idx) => {
          const medal =
            idx === 0
              ? "🥇"
              : idx === 1
                ? "🥈"
                : idx === 2
                  ? "🥉"
                  : `${idx + 1}.`;
          return (
            <View
              key={`${entry.deviceId}-${idx}`}
              style={[
                styles.boardRow,
                { borderBottomColor: theme.divider },
                entry.isMe && {
                  backgroundColor: theme.highlightRow,
                  borderRadius: 8,
                  paddingHorizontal: 8,
                },
                idx === leaderboard.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <Text style={styles.medalText}>{medal}</Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.nickText,
                    { color: theme.text },
                    entry.isMe && { fontWeight: "900", color: theme.accent },
                  ]}
                  numberOfLines={1}
                >
                  {entry.nickname} {entry.isMe ? "(Sen)" : ""}
                </Text>
                <Text style={[styles.metaText, { color: theme.secondaryText }]}>
                  {entry.exactHits} Tam • {entry.correctOutcomes} Sonuç •{" "}
                  {entry.totalPredictions} Tahmin
                </Text>
              </View>
              <View style={styles.pointsCol}>
                <Text
                  style={[
                    styles.pointsVal,
                    styles.tabularNumbers,
                    { color: theme.accent },
                  ]}
                >
                  {entry.totalPoints}
                </Text>
                <Text style={[styles.pointsUnit, { color: theme.secondaryText }]}>
                  PUAN
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* 4. SIRADAKİ MAÇLAR (HIZLI TAHMİN) */}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.cardBackground, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: theme.accent, marginBottom: 8 }]}>
          ⚽ SIRADAKİ MAÇLARA TAHMİN YAP
        </Text>
        {upcomingMatches.length === 0 ? (
          <Text style={[styles.desc, { color: theme.secondaryText }]}>
            Şu anda tahmin yapılabilecek yaklaşan maç bulunamadı.
          </Text>
        ) : (
          upcomingMatches.map((m, idx) => {
            const saved = savedPredsMap[m.id];
            return (
              <TouchableOpacity
                key={m.id}
                onPress={() => router.push(`/mac/${m.id}` as any)}
                style={[
                  styles.matchRow,
                  { borderBottomColor: theme.divider },
                  idx === upcomingMatches.length - 1 && {
                    borderBottomWidth: 0,
                  },
                ]}
                activeOpacity={0.75}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.matchTeams, { color: theme.text }]}>
                    {m.homeTeam} - {m.awayTeam}
                  </Text>
                  <Text style={[styles.metaText, { color: theme.secondaryText }]}>
                    {m.competition} • {m.date} {m.time}
                  </Text>
                </View>
                {saved ? (
                  <View
                    style={[
                      styles.predBadge,
                      { backgroundColor: "rgba(16, 185, 129, 0.16)" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.predBadgeText,
                        styles.tabularNumbers,
                        { color: brand.winGreen },
                      ]}
                    >
                      {saved.homeScore}-{saved.awayScore}
                    </Text>
                  </View>
                ) : (
                  <View
                    style={[styles.predBadge, { backgroundColor: brand.navy }]}
                  >
                    <Text style={[styles.predBadgeText, { color: brand.yellow }]}>
                      Tahmin →
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* 5. GEÇMİŞ TAHMİN KARNEM */}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.cardBackground, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: theme.accent, marginBottom: 8 }]}>
          📋 TAHMİN KARNEM ({myHistory.length})
        </Text>
        {myHistory.length === 0 ? (
          <Text style={[styles.desc, { color: theme.secondaryText }]}>
            Henüz hiçbir maç için skor tahmini kaydetmedin. Yukarıdaki sıradaki
            maçlardan ilk tahminini yapabilirsin.
          </Text>
        ) : (
          myHistory.slice(0, 12).map(({ pred, match, evalResult }, idx) => {
            const badge =
              evalResult.status === "exact"
                ? { text: "🎯 +3P", color: brand.winGreen }
                : evalResult.status === "outcome"
                  ? { text: "✅ +1P", color: brand.drawAmber }
                  : evalResult.status === "miss"
                    ? { text: "❌ 0P", color: brand.lossRed }
                    : { text: "⏳ Bekliyor", color: theme.secondaryText };
            return (
              <TouchableOpacity
                key={`${pred.matchId}-${idx}`}
                onPress={() => router.push(`/mac/${pred.matchId}` as any)}
                style={[
                  styles.matchRow,
                  { borderBottomColor: theme.divider },
                  idx === Math.min(myHistory.length, 12) - 1 && {
                    borderBottomWidth: 0,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.matchTeams, { color: theme.text }]}>
                    {match
                      ? `${match.homeTeam} - ${match.awayTeam}`
                      : `Maç #${pred.matchId}`}
                  </Text>
                  <Text style={[styles.metaText, { color: theme.secondaryText }]}>
                    Tahminin: {pred.homeScore} - {pred.awayScore}
                    {match && match.homeScore != null && match.awayScore != null
                      ? ` • Gerçek: ${match.homeScore} - ${match.awayScore}`
                      : ""}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.historyBadgeText,
                    { color: badge.color },
                  ]}
                >
                  {badge.text}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 48, gap: 14 },
  tabularNumbers: { fontVariant: ["tabular-nums"] },
  card: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: 15,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  desc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: "row",
    gap: 10,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 8,
    fontSize: 13,
    marginBottom: 10,
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
  },
  primaryBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryBtnText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  genBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  genBtnText: {
    fontSize: 11,
    fontWeight: "800",
  },
  statusMsg: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "600",
  },
  bannerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 13,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  bannerTitle: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 2,
  },
  bannerSub: {
    fontSize: 11,
    lineHeight: 15,
  },
  smallBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9,
  },
  smallBtnText: {
    fontSize: 11,
    fontWeight: "800",
  },
  countPill: {
    fontSize: 11,
    fontWeight: "700",
  },
  boardRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 10,
  },
  medalText: {
    fontSize: 18,
    width: 28,
    textAlign: "center",
    fontWeight: "800",
  },
  nickText: {
    fontSize: 14,
    fontWeight: "700",
  },
  metaText: {
    fontSize: 11,
    marginTop: 2,
  },
  pointsCol: {
    alignItems: "flex-end",
  },
  pointsVal: {
    fontSize: 18,
    fontWeight: "900",
  },
  pointsUnit: {
    fontSize: 9,
    fontWeight: "800",
  },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 10,
  },
  matchTeams: {
    fontSize: 13,
    fontWeight: "700",
  },
  predBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  predBadgeText: {
    fontSize: 11,
    fontWeight: "800",
  },
  historyBadgeText: {
    fontSize: 12,
    fontWeight: "800",
  },
});
