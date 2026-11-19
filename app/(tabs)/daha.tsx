import { Radius } from "@/constants/theme";
import { ThemeMode, useAppTheme } from "@/context/ThemeContext";
import { useFixturesQuery } from "@/hooks/useSportsQueries";
import {
  calculatePredictionStats,
  getNtfyTopic,
  openNtfySubscription,
  sendTestNtfyNotification,
  setNtfyTopic,
} from "@/services/fanEngagementService";
import { openInAppUrl } from "@/utils/browser";
import { triggerLightHaptic, triggerSelectionHaptic } from "@/utils/haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const THEME_OPTIONS: { key: ThemeMode; label: string; icon: string }[] = [
  { key: "system", label: "Sistem", icon: "📱" },
  { key: "light", label: "Aydınlık", icon: "☀️" },
  { key: "dark", label: "Karanlık", icon: "🌙" },
];

export default function DahaFazlaScreen() {
  const router = useRouter();
  const { theme, brand, mode, setMode } = useAppTheme();

  const { data: matches = [] } = useFixturesQuery();
  const [ntfyTopic, setNtfyTopicState] = useState(getNtfyTopic());
  const [pushStatus, setPushStatus] = useState<string>("");
  const [refreshTick, setRefreshTick] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setRefreshTick((t) => t + 1);
    }, []),
  );

  const predStats = useMemo(
    () => calculatePredictionStats(matches),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [matches, refreshTick],
  );

  const handleSaveTopic = (val: string) => {
    setNtfyTopicState(val);
    setNtfyTopic(val);
  };

  const handleTestPush = async () => {
    triggerLightHaptic();
    setPushStatus("Gönderiliyor...");
    const ok = await sendTestNtfyNotification();
    setPushStatus(
      ok
        ? `✅ Bildirim '${getNtfyTopic()}' kanalına gönderildi!`
        : "❌ Gönderilemedi, internet bağlantısını kontrol edin.",
    );
  };

  const menuSections = [
    {
      title: "BİLDİRİM & TAKİP",
      items: [
        {
          id: "tahmin-ligi",
          title: "Arkadaş Tahmin Ligi & Oda Sıralaması",
          subtitle:
            "Oda kodu oluştur, arkadaşlarınla skor tahmininde yarış & paylaş",
          icon: "podium",
          iconColor: theme.accent,
          onPress: () => router.push("/tahmin-ligi" as any),
        },
        {
          id: "bildirimler",
          title: "Bildirim Merkezi & Maç Hatırlatmaları",
          subtitle:
            "1 saat / 15 dk yerel uyarılar, branş matrisi, gizli ntfy & Worker",
          icon: "notifications",
          iconColor: "#F59E0B",
          onPress: () => router.push("/bildirimler" as any),
        },
      ],
    },
    {
      title: "KULÜP & SPORCULAR",
      items: [
        {
          id: "sporcular",
          title: "Tüm Branş Kadroları",
          subtitle:
            "Futbol, Basketbol, Voleybol (Erkek & Kadın) tüm sporcularımız",
          icon: "people",
          iconColor: theme.accent,
          onPress: () => router.push("/sporcular" as any),
        },
        {
          id: "puan-durumu",
          title: "Canlı Puan Durumları",
          subtitle: "Süper Lig, ŞL, Avrupa Ligi ve EuroLeague tabloları",
          icon: "trophy",
          iconColor: "#FFA000",
          onPress: () => router.push("/puan-durumu" as any),
        },
        {
          id: "derbi-merkezi",
          title: "Derbi Merkezi & H2H İstatistikleri",
          subtitle: "GS, BJK ve TS karşısında tüm zamanlar galibiyet üstünlüğü",
          icon: "flame",
          iconColor: "#EF4444",
          onPress: () => router.push("/derbi-merkezi" as any),
        },
        {
          id: "tarih-arsivi",
          title: "Tarihte Fenerbahçe Arşivi",
          subtitle: "1907'den bugüne kupalar, tarihi derbiler ve Avrupa zaferleri",
          icon: "library",
          iconColor: "#10B981",
          onPress: () => router.push("/tarih-arsivi" as any),
        },
        {
          id: "haberler",
          title: "Kulüp Haberleri",
          subtitle: "Son dakika transfer ve kulüp bültenleri",
          icon: "newspaper",
          iconColor: "#3B82F6",
          onPress: () => router.push("/haberler" as any),
        },
      ],
    },
    {
      title: "MEDYA & MAĞAZA",
      items: [
        {
          id: "fenerium",
          title: "Fenerium Online Mağaza",
          subtitle: "Resmi formalar, tişörtler ve lisanslı ürünler",
          icon: "bag-handle",
          iconColor: "#EF4444",
          onPress: () => openInAppUrl("https://fenerium.com"),
        },
        {
          id: "fbtv",
          title: "FBTV Canlı Yayın",
          subtitle: "Kulüp televizyonunu canlı izle",
          icon: "tv",
          iconColor: "#10B981",
          onPress: () => openInAppUrl("https://www.fenerbahce.org/fbtv"),
        },
        {
          id: "tarihce",
          title: "1907'den Bugüne Tarihçe",
          subtitle: "Kulübün şanlı tarihi ve müzemiz",
          icon: "ribbon",
          iconColor: theme.accent,
          onPress: () => openInAppUrl("https://www.fenerbahce.org/tarihce"),
        },
      ],
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        style={[
          styles.featuredSquadBanner,
          { backgroundColor: brand.navy, borderColor: brand.yellow },
        ]}
        activeOpacity={0.85}
        onPress={() => router.push("/sporcular" as any)}
      >
        <View style={styles.bannerLeft}>
          <Text style={[styles.bannerTag, { color: brand.yellow }]}>
            6 BRANŞ • GÜNCEL KADRO
          </Text>
          <Text style={styles.bannerTitle}>Tüm Branş Sporcularımız</Text>
          <Text style={styles.bannerSubtitle}>
            Futbol, Basketbol, Voleybol (Erkek & Kadın) kadrolarını keşfedin.
          </Text>
        </View>
        <View style={styles.bannerIconContainer}>
          <Text style={{ fontSize: 32 }}>⚽</Text>
          <Text style={{ fontSize: 24, marginTop: -8 }}>🏀🏐</Text>
        </View>
      </TouchableOpacity>

      <View
        style={[
          styles.cardGroup,
          styles.sectionCard,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border,
          },
        ]}
      >
        <Text style={[styles.cardHeading, { color: theme.accent }]}>
          🎨 GÖRÜNÜM & TEMA
        </Text>
        <View
          style={[
            styles.themeSegment,
            { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
          ]}
        >
          {THEME_OPTIONS.map((opt) => {
            const isSelected = mode === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => {
                  triggerSelectionHaptic();
                  setMode(opt.key);
                }}
                style={[
                  styles.themeSegmentBtn,
                  isSelected && { backgroundColor: brand.navy },
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.themeSegmentText,
                    { color: isSelected ? brand.yellow : theme.text },
                    isSelected && { fontWeight: "800" },
                  ]}
                >
                  {opt.icon} {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View
        style={[
          styles.cardGroup,
          styles.sectionCard,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border,
          },
        ]}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Text style={[styles.cardHeading, { color: theme.accent, marginBottom: 0 }]}>
            🏆 ARKADAŞ TAHMİN LİGİ PUANIN
          </Text>
          <TouchableOpacity onPress={() => router.push("/tahmin-ligi" as any)}>
            <Text style={{ fontSize: 12, fontWeight: "bold", color: theme.accent }}>
              Arkadaş Odası & Sıralama →
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.predStatsRow}>
          <View style={styles.predStatBox}>
            <Text style={[styles.predStatValue, { color: theme.accent }]}>
              {predStats.totalPoints}
            </Text>
            <Text style={[styles.predStatLabel, { color: theme.secondaryText }]}>
              Toplam Puan
            </Text>
          </View>
          <View style={styles.predStatBox}>
            <Text style={[styles.predStatValue, { color: brand.winGreen }]}>
              {predStats.exactHits}
            </Text>
            <Text style={[styles.predStatLabel, { color: theme.secondaryText }]}>
              Tam Skor (3P)
            </Text>
          </View>
          <View style={styles.predStatBox}>
            <Text style={[styles.predStatValue, { color: brand.drawAmber }]}>
              {predStats.correctOutcomes}
            </Text>
            <Text style={[styles.predStatLabel, { color: theme.secondaryText }]}>
              Doğru Sonuç (1P)
            </Text>
          </View>
          <View style={styles.predStatBox}>
            <Text style={[styles.predStatValue, { color: theme.text }]}>
              {predStats.totalPredictions}
            </Text>
            <Text style={[styles.predStatLabel, { color: theme.secondaryText }]}>
              Tahmin
            </Text>
          </View>
        </View>
      </View>

      <View
        style={[
          styles.cardGroup,
          styles.sectionCard,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border,
          },
        ]}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <Text style={[styles.cardHeading, { color: theme.accent, marginBottom: 0 }]}>
            🔔 CANLI BİLDİRİM & HATIRLATMA (ntfy)
          </Text>
          <TouchableOpacity onPress={() => router.push("/bildirimler" as any)}>
            <Text style={{ fontSize: 12, fontWeight: "bold", color: theme.accent }}>
              Tüm Ayarlar →
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.ntfyDesc, { color: theme.secondaryText }]}>
          Yerel maç hatırlatmaları, olay tercihleri ve arkadaş grubu ntfy.sh
          kanalını Bildirim Merkezi'nden özelleştirebilirsin:
        </Text>
        <TextInput
          value={ntfyTopic}
          onChangeText={handleSaveTopic}
          placeholder="fenerbahce-canli-1907"
          placeholderTextColor={theme.secondaryText}
          style={[
            styles.ntfyInput,
            {
              borderColor: theme.border,
              backgroundColor: theme.inputBg,
              color: theme.text,
            },
          ]}
        />
        <View style={styles.ntfyButtonsRow}>
          <TouchableOpacity
            onPress={openNtfySubscription}
            style={[styles.ntfyPrimaryBtn, { backgroundColor: brand.navy }]}
          >
            <Text style={[styles.ntfyBtnText, { color: brand.yellow }]}>
              Kanala Abone Ol
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleTestPush}
            style={[styles.ntfyPrimaryBtn, { backgroundColor: brand.yellow }]}
          >
            <Text style={[styles.ntfyBtnText, { color: brand.navy }]}>
              Test Gol Bildirimi At
            </Text>
          </TouchableOpacity>
        </View>
        {pushStatus ? (
          <Text style={[styles.pushStatusText, { color: theme.text }]}>
            {pushStatus}
          </Text>
        ) : null}
      </View>

      {menuSections.map((sec, sIdx) => (
        <View key={sIdx} style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>
            {sec.title}
          </Text>

          <View
            style={[
              styles.cardGroup,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
              },
            ]}
          >
            {sec.items.map((item, iIdx) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItemRow,
                  iIdx < sec.items.length - 1 && [
                    styles.menuItemBorder,
                    { borderBottomColor: theme.divider },
                  ],
                ]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.menuIconBox,
                    { backgroundColor: `${item.iconColor}1A` },
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={22}
                    color={item.iconColor}
                  />
                </View>

                <View style={styles.menuTextContainer}>
                  <Text style={[styles.menuItemTitle, { color: theme.text }]}>
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.menuItemSubtitle,
                      { color: theme.secondaryText },
                    ]}
                  >
                    {item.subtitle}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={theme.secondaryText}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <View style={styles.footerContainer}>
        <Text style={[styles.footerText, { color: theme.secondaryText }]}>
          Fenerbahçe Mobil v1.1.0 (Expo SDK 57)
        </Text>
        <Text
          style={[
            styles.footerText,
            { color: theme.secondaryText, marginTop: 2 },
          ]}
        >
          Bağımsız Taraftar Portalı • 1907
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  featuredSquadBanner: {
    borderRadius: 14,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    borderWidth: 1.5,
  },
  bannerLeft: {
    flex: 1,
    paddingRight: 10,
  },
  bannerTag: {
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  bannerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: "#ECEFF1",
    fontSize: 12,
    lineHeight: 16,
  },
  bannerIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  sectionCard: {
    padding: 16,
    marginBottom: 16,
  },
  cardHeading: {
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 8,
  },
  themeSegment: {
    flexDirection: "row",
    borderRadius: Radius.sm,
    borderWidth: 1,
    padding: 3,
    gap: 4,
  },
  themeSegmentBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  themeSegmentText: {
    fontSize: 12,
    fontWeight: "600",
  },
  predStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  predStatBox: {
    alignItems: "center",
    flex: 1,
  },
  predStatValue: {
    fontSize: 20,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },
  predStatLabel: {
    fontSize: 11,
    marginTop: 2,
    textAlign: "center",
  },
  ntfyDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  ntfyInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    marginBottom: 10,
  },
  ntfyButtonsRow: {
    flexDirection: "row",
    gap: 10,
  },
  ntfyPrimaryBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  ntfyBtnText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  pushStatusText: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: "600",
  },
  sectionContainer: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  cardGroup: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  menuItemRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
  },
  menuIconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 12,
  },
  footerContainer: {
    alignItems: "center",
    marginTop: 10,
    paddingVertical: 12,
  },
  footerText: {
    fontSize: 11,
  },
});
