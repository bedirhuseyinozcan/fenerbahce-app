import { Radius } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";
import { useFixturesQuery } from "@/hooks/useSportsQueries";
import {
  getNtfyTopic,
  openNtfySubscription,
  sendTestNtfyNotification,
  setNtfyTopic,
} from "@/services/fanEngagementService";
import {
  checkWorkerHealth,
  generatePrivateNtfyTopic,
  getNotificationPrefs,
  registerDeviceWithWorker,
  saveNotificationPrefs,
} from "@/services/notificationPrefs";
import {
  getNotificationPermissionStatus,
  PermissionState,
  registerExpoPushTokenAsync,
  requestNotificationPermission,
  sendInstantLocalTestNotification,
  syncUpcomingMatchReminders,
} from "@/services/notificationService";
import { NotificationPreferences } from "@/types";
import {
  triggerLightHaptic,
  triggerSelectionHaptic,
  triggerSuccessHaptic,
} from "@/utils/haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function BildirimlerScreen() {
  const { theme, brand } = useAppTheme();
  const { data: matches = [] } = useFixturesQuery();

  const [prefs, setPrefs] = useState<NotificationPreferences>(
    getNotificationPrefs,
  );
  const [permStatus, setPermStatus] = useState<PermissionState>("undetermined");
  const [ntfyTopic, setNtfyTopicState] = useState(getNtfyTopic());
  const [localStatusMsg, setLocalStatusMsg] = useState("");
  const [ntfyStatusMsg, setNtfyStatusMsg] = useState("");
  const [workerStatusMsg, setWorkerStatusMsg] = useState("");
  const [busyWorker, setBusyWorker] = useState(false);

  useEffect(() => {
    getNotificationPermissionStatus().then(setPermStatus);
  }, []);

  const updatePrefs = (patch: Partial<NotificationPreferences>) => {
    triggerSelectionHaptic();
    const updated = saveNotificationPrefs(patch);
    setPrefs(updated);
  };

  const handleSyncReminders = async () => {
    triggerLightHaptic();
    const perm = await requestNotificationPermission();
    setPermStatus(perm);
    if (perm !== "granted") {
      setLocalStatusMsg("❌ Bildirim izni verilmedi.");
      return;
    }
    const count = await syncUpcomingMatchReminders(matches, prefs);
    triggerSuccessHaptic();
    setLocalStatusMsg(
      count > 0
        ? `✅ Yaklaşan maçlar için ${count} yerel hatırlatma planlandı!`
        : "ℹ️ Planlanacak uygun gelecek maç bulunamadı.",
    );
  };

  const handleLocalTest = async () => {
    triggerLightHaptic();
    const ok = await sendInstantLocalTestNotification();
    const perm = await getNotificationPermissionStatus();
    setPermStatus(perm);
    setLocalStatusMsg(
      ok
        ? "✅ 2 saniye içinde cihaz bildirimi gelecek!"
        : "❌ Bildirim izni yok veya bu platformda desteklenmiyor.",
    );
  };

  const handleTopicChange = (val: string) => {
    setNtfyTopicState(val);
    setNtfyTopic(val);
  };

  const handleGeneratePrivateTopic = () => {
    triggerSuccessHaptic();
    const topic = generatePrivateNtfyTopic();
    setNtfyTopicState(topic);
    setNtfyTopic(topic);
    setNtfyStatusMsg(`🔒 Gizli kanal üretildi: ${topic}`);
  };

  const handleTestNtfy = async () => {
    triggerLightHaptic();
    setNtfyStatusMsg("Gönderiliyor...");
    const ok = await sendTestNtfyNotification();
    setNtfyStatusMsg(
      ok
        ? `✅ Bildirim '${getNtfyTopic()}' kanalına gönderildi!`
        : "❌ Gönderilemedi, internet bağlantısını kontrol edin.",
    );
  };

  const handleWorkerHealth = async () => {
    triggerLightHaptic();
    setBusyWorker(true);
    setWorkerStatusMsg("Kontrol ediliyor...");
    const res = await checkWorkerHealth(prefs.workerBaseUrl);
    setWorkerStatusMsg(res.message);
    setBusyWorker(false);
  };

  const handleRegisterWorker = async () => {
    triggerLightHaptic();
    setBusyWorker(true);
    setWorkerStatusMsg("Cihaz kaydediliyor...");
    const token = await registerExpoPushTokenAsync();
    const res = await registerDeviceWithWorker(prefs, token);
    if (res.ok) triggerSuccessHaptic();
    setWorkerStatusMsg(res.message);
    setBusyWorker(false);
  };

  const permBadge =
    permStatus === "granted"
      ? { label: "İzin Verildi", color: brand.winGreen }
      : permStatus === "denied"
        ? { label: "İzin Reddedildi", color: brand.lossRed }
        : { label: "İzin Bekleniyor", color: brand.drawAmber };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen
        options={{
          title: "Bildirim Merkezi",
          headerStyle: { backgroundColor: brand.navy },
          headerTintColor: brand.yellow,
          headerBackTitle: "Geri",
        }}
      />

      {/* 1. YEREL MAÇ HATIRLATMALARI */}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.cardBackground, borderColor: theme.border },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: theme.accent }]}>
            ⏰ YEREL MAÇ HATIRLATMALARI
          </Text>
          <View
            style={[
              styles.permPill,
              { backgroundColor: `${permBadge.color}20` },
            ]}
          >
            <Text style={[styles.permText, { color: permBadge.color }]}>
              {permBadge.label}
            </Text>
          </View>
        </View>

        <View style={[styles.switchRow, { borderBottomColor: theme.divider }]}>
          <View style={styles.switchTextCol}>
            <Text style={[styles.switchLabel, { color: theme.text }]}>
              Hatırlatmaları Etkinleştir
            </Text>
            <Text style={[styles.switchSub, { color: theme.secondaryText }]}>
              Sunucusuz çalışır, maç başlamadan uyarı verir
            </Text>
          </View>
          <Switch
            value={prefs.enabled}
            onValueChange={(v) => updatePrefs({ enabled: v })}
            trackColor={{ false: theme.muted, true: brand.navyLight }}
            thumbColor={prefs.enabled ? brand.yellow : "#f4f3f4"}
          />
        </View>

        <View style={[styles.switchRow, { borderBottomColor: theme.divider }]}>
          <Text style={[styles.switchLabel, { color: theme.text }]}>
            Maçtan 1 Saat Önce
          </Text>
          <Switch
            value={prefs.remind60Min}
            onValueChange={(v) => updatePrefs({ remind60Min: v })}
            disabled={!prefs.enabled}
            trackColor={{ false: theme.muted, true: brand.navyLight }}
            thumbColor={prefs.remind60Min ? brand.yellow : "#f4f3f4"}
          />
        </View>

        <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
          <Text style={[styles.switchLabel, { color: theme.text }]}>
            Maçtan 15 Dakika Önce
          </Text>
          <Switch
            value={prefs.remind15Min}
            onValueChange={(v) => updatePrefs({ remind15Min: v })}
            disabled={!prefs.enabled}
            trackColor={{ false: theme.muted, true: brand.navyLight }}
            thumbColor={prefs.remind15Min ? brand.yellow : "#f4f3f4"}
          />
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity
            onPress={handleSyncReminders}
            style={[styles.primaryBtn, { backgroundColor: brand.navy }]}
            activeOpacity={0.85}
          >
            <Text style={[styles.primaryBtnText, { color: brand.yellow }]}>
              Maçları Planla
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleLocalTest}
            style={[styles.primaryBtn, { backgroundColor: brand.yellow }]}
            activeOpacity={0.85}
          >
            <Text style={[styles.primaryBtnText, { color: brand.navy }]}>
              Yerel Test At
            </Text>
          </TouchableOpacity>
        </View>

        {localStatusMsg ? (
          <Text style={[styles.statusMsg, { color: theme.text }]}>
            {localStatusMsg}
          </Text>
        ) : null}
      </View>

      {/* 2. BRANŞ TERCİHLERİ */}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.cardBackground, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: theme.accent }]}>
          🏅 BRANŞ FİLTRELERİ
        </Text>
        {(
          [
            { key: "Futbol", label: "⚽ Futbol (Süper Lig & Avrupa)" },
            { key: "Basketbol", label: "🏀 Basketbol (EuroLeague)" },
            { key: "Voleybol", label: "🏐 Voleybol (Sultanlar Ligi)" },
          ] as const
        ).map((item, idx, arr) => (
          <View
            key={item.key}
            style={[
              styles.switchRow,
              { borderBottomColor: theme.divider },
              idx === arr.length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            <Text style={[styles.switchLabel, { color: theme.text }]}>
              {item.label}
            </Text>
            <Switch
              value={prefs.branches[item.key]}
              onValueChange={(v) =>
                updatePrefs({
                  branches: { ...prefs.branches, [item.key]: v },
                })
              }
              trackColor={{ false: theme.muted, true: brand.navyLight }}
              thumbColor={prefs.branches[item.key] ? brand.yellow : "#f4f3f4"}
            />
          </View>
        ))}
      </View>

      {/* 3. CANLI OLAY TERCİHLERİ */}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.cardBackground, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: theme.accent }]}>
          ⚡ CANLI OLAY TERCİHLERİ
        </Text>
        {(
          [
            { key: "goals", label: "⚽ Goller & VAR İptalleri" },
            { key: "cards", label: "🟥 Kırmızı Kartlar" },
            {
              key: "kickoffAndFullTime",
              label: "🏁 Başlama, Devre & Maç Sonucu",
            },
            { key: "lineups", label: "📋 İlk 11 Açıklandığında" },
            {
              key: "quarterAndSetEnds",
              label: "🏀 Basketbol Çeyrek / Voleybol Set Sonu",
            },
          ] as const
        ).map((item, idx, arr) => (
          <View
            key={item.key}
            style={[
              styles.switchRow,
              { borderBottomColor: theme.divider },
              idx === arr.length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            <Text style={[styles.switchLabel, { color: theme.text }]}>
              {item.label}
            </Text>
            <Switch
              value={prefs.events[item.key]}
              onValueChange={(v) =>
                updatePrefs({
                  events: { ...prefs.events, [item.key]: v },
                })
              }
              trackColor={{ false: theme.muted, true: brand.navyLight }}
              thumbColor={prefs.events[item.key] ? brand.yellow : "#f4f3f4"}
            />
          </View>
        ))}
      </View>

      {/* 4. GİZLİ NTFY KANALI */}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.cardBackground, borderColor: theme.border },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: theme.accent }]}>
            🔔 GİZLİ NTFY.SH KANALI (0 ₺)
          </Text>
          <TouchableOpacity
            onPress={handleGeneratePrivateTopic}
            style={[styles.genBtn, { backgroundColor: theme.badgeBg }]}
          >
            <Ionicons name="key-outline" size={12} color={theme.badgeText} />
            <Text style={[styles.genBtnText, { color: theme.badgeText }]}>
              Gizli Kanal Üret
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.desc, { color: theme.secondaryText }]}>
          Arkadaş grubunla yalnızca size özel bir kanal kodu belirleyip ntfy
          uygulamasından anlık gol bildirimi alabilirsiniz.
        </Text>
        <TextInput
          value={ntfyTopic}
          onChangeText={handleTopicChange}
          placeholder="fb-1907-gizli-kanal"
          placeholderTextColor={theme.secondaryText}
          style={[
            styles.input,
            {
              borderColor: theme.border,
              backgroundColor: theme.inputBg,
              color: theme.text,
            },
          ]}
        />
        <View style={styles.btnRow}>
          <TouchableOpacity
            onPress={openNtfySubscription}
            style={[styles.primaryBtn, { backgroundColor: brand.navy }]}
          >
            <Text style={[styles.primaryBtnText, { color: brand.yellow }]}>
              Kanala Abone Ol
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleTestNtfy}
            style={[styles.primaryBtn, { backgroundColor: brand.yellow }]}
          >
            <Text style={[styles.primaryBtnText, { color: brand.navy }]}>
              ntfy Testi At
            </Text>
          </TouchableOpacity>
        </View>
        {ntfyStatusMsg ? (
          <Text style={[styles.statusMsg, { color: theme.text }]}>
            {ntfyStatusMsg}
          </Text>
        ) : null}
      </View>

      {/* 5. CLOUDFLARE WORKER MAÇ MOTORU */}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.cardBackground, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: theme.accent }]}>
          ☁️ CLOUDFLARE MAÇ MOTORU (OPSİYONEL)
        </Text>
        <Text style={[styles.desc, { color: theme.secondaryText }]}>
          Repo içindeki `worker/` projesini ücretsiz Cloudflare hesabına deploy
          ettikten sonra Worker URL'ni buraya girip cihaz tercihlerini eşitle.
        </Text>
        <TextInput
          value={prefs.workerBaseUrl}
          onChangeText={(val) => updatePrefs({ workerBaseUrl: val })}
          placeholder="https://fenerbahce-match-engine.hesap.workers.dev"
          placeholderTextColor={theme.secondaryText}
          autoCapitalize="none"
          autoCorrect={false}
          style={[
            styles.input,
            {
              borderColor: theme.border,
              backgroundColor: theme.inputBg,
              color: theme.text,
            },
          ]}
        />
        <View style={styles.btnRow}>
          <TouchableOpacity
            disabled={busyWorker}
            onPress={handleWorkerHealth}
            style={[styles.primaryBtn, { backgroundColor: brand.navy }]}
          >
            <Text style={[styles.primaryBtnText, { color: brand.yellow }]}>
              Bağlantıyı Test Et
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={busyWorker}
            onPress={handleRegisterWorker}
            style={[styles.primaryBtn, { backgroundColor: brand.yellow }]}
          >
            <Text style={[styles.primaryBtnText, { color: brand.navy }]}>
              Tercihleri Eşitle
            </Text>
          </TouchableOpacity>
        </View>
        {workerStatusMsg ? (
          <Text style={[styles.statusMsg, { color: theme.text }]}>
            {workerStatusMsg}
          </Text>
        ) : null}
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
    paddingBottom: 48,
    gap: 16,
  },
  card: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: 16,
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
    marginBottom: 6,
  },
  permPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  permText: {
    fontSize: 11,
    fontWeight: "800",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 12,
  },
  switchTextCol: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  switchSub: {
    fontSize: 11,
    marginTop: 2,
  },
  desc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    marginBottom: 10,
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
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
});
