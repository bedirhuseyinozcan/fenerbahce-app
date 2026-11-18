import Colors from "@/constants/Colors";
import {
  calculatePredictionStats,
  getNtfyTopic,
  openNtfySubscription,
  sendTestNtfyNotification,
  setNtfyTopic,
} from "@/services/fanEngagementService";
import { fetchFixtures } from "@/services/fixtureService";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export default function DahaFazlaScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const [ntfyTopic, setNtfyTopicState] = useState(getNtfyTopic());
  const [pushStatus, setPushStatus] = useState<string>("");
  const [predStats, setPredStats] = useState({
    totalPredictions: 0,
    exactHits: 0,
    correctOutcomes: 0,
    totalPoints: 0,
  });

  useEffect(() => {
    fetchFixtures().then((matches) => {
      setPredStats(calculatePredictionStats(matches));
    });
  }, []);

  const handleSaveTopic = (val: string) => {
    setNtfyTopicState(val);
    setNtfyTopic(val);
  };

  const handleTestPush = async () => {
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
      title: "KULÜP & SPORCULAR",
      items: [
        {
          id: "sporcular",
          title: "Tüm Branş Kadroları",
          subtitle:
            "Futbol, Basketbol, Voleybol (Erkek & Kadın) tüm sporcularımız",
          icon: "people",
          iconColor: Colors.brand.navy,
          onPress: () => router.push("/sporcular" as any),
        },
        {
          id: "puan-durumu",
          title: "Canlı Puan Durumları",
          subtitle: "Süper Lig, Şampiyonlar Ligi ve EuroLeague tabloları",
          icon: "trophy",
          iconColor: "#FFA000",
          onPress: () => router.push("/puan-durumu" as any),
        },
        {
          id: "derbi-merkezi",
          title: "Derbi Merkezi & H2H İstatistikleri",
          subtitle: "GS, BJK ve TS karşısında tüm zamanlar galibiyet üstünlüğü",
          icon: "flame",
          iconColor: "#E53935",
          onPress: () => router.push("/derbi-merkezi" as any),
        },
        {
          id: "haberler",
          title: "Kulüp Haberleri",
          subtitle: "Son dakika transfer ve kulüp bültenleri",
          icon: "newspaper",
          iconColor: "#1E88E5",
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
          iconColor: "#E53935",
          onPress: () => Linking.openURL("https://fenerium.com"),
        },
        {
          id: "fbtv",
          title: "FBTV Canlı Yayın",
          subtitle: "Kulüp televizyonunu canlı izle",
          icon: "tv",
          iconColor: "#43A047",
          onPress: () => Linking.openURL("https://www.fenerbahce.org/fbtv"),
        },
        {
          id: "tarihce",
          title: "1907'den Bugüne Tarihçe",
          subtitle: "Kulübün şanlı tarihi ve müzemiz",
          icon: "ribbon",
          iconColor: Colors.brand.navy,
          onPress: () => Linking.openURL("https://www.fenerbahce.org/tarihce"),
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
        style={styles.featuredSquadBanner}
        activeOpacity={0.85}
        onPress={() => router.push("/sporcular" as any)}
      >
        <View style={styles.bannerLeft}>
          <Text style={styles.bannerTag}>6 BRANŞ • GÜNCEL KADRO</Text>
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

      {/* TARAFTAR SKOR TAHMİN LİGİ KARTI (Faz 4) */}
      <View
        style={[
          styles.cardGroup,
          {
            backgroundColor: theme.cardBackground,
            padding: 16,
            marginBottom: 20,
          },
        ]}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: "900",
            color: Colors.brand.navy,
            marginBottom: 8,
          }}
        >
          🏆 ARKADAŞ TAHMİN LİGİ PUANIN
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 4,
          }}
        >
          <View style={{ alignItems: "center", flex: 1 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "900",
                color: Colors.brand.navy,
              }}
            >
              {predStats.totalPoints}
            </Text>
            <Text style={{ fontSize: 11, color: theme.secondaryText }}>
              Toplam Puan
            </Text>
          </View>
          <View style={{ alignItems: "center", flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: "900", color: "#00C853" }}>
              {predStats.exactHits}
            </Text>
            <Text style={{ fontSize: 11, color: theme.secondaryText }}>
              Tam Skor (3P)
            </Text>
          </View>
          <View style={{ alignItems: "center", flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: "900", color: "#FFA000" }}>
              {predStats.correctOutcomes}
            </Text>
            <Text style={{ fontSize: 11, color: theme.secondaryText }}>
              Doğru Sonuç (1P)
            </Text>
          </View>
          <View style={{ alignItems: "center", flex: 1 }}>
            <Text
              style={{ fontSize: 20, fontWeight: "900", color: theme.text }}
            >
              {predStats.totalPredictions}
            </Text>
            <Text style={{ fontSize: 11, color: theme.secondaryText }}>
              Tahmin
            </Text>
          </View>
        </View>
      </View>

      {/* SIFIR MALİYETLİ CANLI GOL BİLDİRİM KANALI (ntfy.sh - Faz 2) */}
      <View
        style={[
          styles.cardGroup,
          {
            backgroundColor: theme.cardBackground,
            padding: 16,
            marginBottom: 20,
          },
        ]}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: "900",
            color: Colors.brand.navy,
            marginBottom: 4,
          }}
        >
          🔔 SIFIR MALİYETLİ CANLI MAÇ BİLDİRİMİ (ntfy)
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: theme.secondaryText,
            lineHeight: 17,
            marginBottom: 10,
          }}
        >
          Android ve iOS'ta mağaza veya ücretli sunucu olmadan gol ve maç sonu
          bildirimi almak için arkadaş grubunuzla ortak ntfy.sh kanal kodunuzu
          girin:
        </Text>
        <TextInput
          value={ntfyTopic}
          onChangeText={handleSaveTopic}
          placeholder="fenerbahce-canli-1907"
          placeholderTextColor={theme.secondaryText}
          style={{
            borderWidth: 1,
            borderColor: theme.placeholder,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 8,
            color: theme.text,
            fontSize: 13,
            marginBottom: 10,
          }}
        />
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            onPress={openNtfySubscription}
            style={{
              flex: 1,
              backgroundColor: Colors.brand.navy,
              paddingVertical: 10,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: Colors.brand.yellow,
                fontSize: 12,
                fontWeight: "bold",
              }}
            >
              Kanala Abone Ol
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleTestPush}
            style={{
              flex: 1,
              backgroundColor: Colors.brand.yellow,
              paddingVertical: 10,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: Colors.brand.navy,
                fontSize: 12,
                fontWeight: "bold",
              }}
            >
              Test Gol Bildirimi At
            </Text>
          </TouchableOpacity>
        </View>
        {pushStatus ? (
          <Text
            style={{
              marginTop: 8,
              fontSize: 11,
              color: theme.text,
              fontWeight: "600",
            }}
          >
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
              { backgroundColor: theme.cardBackground },
            ]}
          >
            {sec.items.map((item, iIdx) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItemRow,
                  iIdx < sec.items.length - 1 && [
                    styles.menuItemBorder,
                    { borderBottomColor: theme.placeholder },
                  ],
                ]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.menuIconBox,
                    { backgroundColor: `${item.iconColor}15` },
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
    backgroundColor: Colors.brand.navy,
    borderRadius: 14,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: Colors.brand.yellow,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  bannerLeft: {
    flex: 1,
    paddingRight: 10,
  },
  bannerTag: {
    color: Colors.brand.yellow,
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
  sectionContainer: {
    marginBottom: 20,
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
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
