import MatchCard from "@/components/MatchCard";
import Colors from "@/constants/Colors";
import { fetchFixtures } from "@/services/fixtureService";
import { MatchData } from "@/types";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabOneScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const [upcomingMatches, setUpcomingMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchFixtures();
      setUpcomingMatches(data.slice(0, 4));
      setLoading(false);
    };

    loadData();
  }, []);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.heroContainer, { marginTop: insets.top }]}>
        <Image
          source={{
            uri: "https://media.fenerbahce.org/getmedia/835dcbca-04a4-4a24-ad8b-4a6c8eecbfbe/genelkurul.jpg",
          }}
          style={styles.heroImage}
        />
        <View style={styles.heroOverlay}>
          <Text style={styles.heroTitle}>
            FENERBAHÇE SPOR KULÜBÜ OLAĞAN GENEL KURUL TOPLANTI DUYURUSU
          </Text>
          <TouchableOpacity style={styles.heroButton}>
            <Text style={styles.heroButtonText}>Devamı</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            MAÇ TAKVİMİ
          </Text>
          <TouchableOpacity>
            <Text style={styles.sectionLink}>+ Tüm Maçlar</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ padding: 20, alignItems: "center" }}>
            <ActivityIndicator size="small" color={Colors.brand.navy} />
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.matchList}
          >
            {upcomingMatches.map((item) => (
              <MatchCard
                key={item.id}
                branch={item.branch}
                competition={item.competition}
                round={item.round}
                homeTeam={item.homeTeam}
                homeLogo={item.homeLogo}
                homeScore={item.homeScore}
                awayTeam={item.awayTeam}
                awayLogo={item.awayLogo}
                awayScore={item.awayScore}
                date={item.date}
                time={item.time}
                stadium={item.stadium}
              />
            ))}
            {upcomingMatches.length === 0 && (
              <Text
                style={{ color: theme.secondaryText, paddingHorizontal: 16 }}
              >
                Şu an maç verisi bulunamadı.
              </Text>
            )}
          </ScrollView>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            HABERLER
          </Text>
          <TouchableOpacity>
            <Text style={styles.sectionLink}>+ Tüm Haberler</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.newsList}>
          <TouchableOpacity
            style={[
              styles.featuredNewsCard,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <Image
              source={{
                uri: "https://media.fenerbahce.org/getmedia/5c3702c2-d352-45e3-b09e-7341857c50be/stad.jpg",
              }}
              style={styles.featuredNewsImage}
            />
            <View style={styles.featuredNewsContent}>
              <View style={styles.newsTag}>
                <Text style={styles.newsTagText}>KULÜP</Text>
              </View>
              <Text
                style={[styles.featuredNewsTitle, { color: theme.text }]}
                numberOfLines={3}
              >
                Fenerbahçe Şükrü Saracoğlu Spor Kompleksi'nde dev kapasite
                artışı başlıyor
              </Text>
              <Text style={styles.newsDate}>09 Eylül 2026 • 14:01</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.newsGridRow}>
            <TouchableOpacity
              style={[
                styles.smallNewsCard,
                { backgroundColor: theme.cardBackground },
              ]}
            >
              <View
                style={[
                  styles.smallNewsImagePlaceholder,
                  { backgroundColor: Colors.brand.navy },
                ]}
              />
              <View style={styles.smallNewsContent}>
                <Text
                  style={[styles.newsTagText, { color: Colors.brand.navy }]}
                >
                  KULÜP
                </Text>
                <Text
                  style={[styles.smallNewsTitle, { color: theme.text }]}
                  numberOfLines={2}
                >
                  Kamuoyuna Duyuru
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.smallNewsCard,
                { backgroundColor: theme.cardBackground },
              ]}
            >
              <View
                style={[
                  styles.smallNewsImagePlaceholder,
                  { backgroundColor: theme.placeholder },
                ]}
              />
              <View style={styles.smallNewsContent}>
                <Text
                  style={[styles.newsTagText, { color: Colors.brand.navy }]}
                >
                  BASKETBOL
                </Text>
                <Text
                  style={[styles.smallNewsTitle, { color: theme.text }]}
                  numberOfLines={2}
                >
                  Eski Yöneticimiz ve sporcumuz Ferhan Baras'ı kaybettik
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroContainer: {
    width: "100%",
    height: 250,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 30, 70, 0.6)",
    justifyContent: "flex-end",
    padding: 20,
  },
  heroTitle: {
    color: Colors.brand.white,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  heroButton: {
    alignSelf: "flex-start",
  },
  heroButtonText: {
    color: Colors.brand.yellow,
    fontSize: 14,
    fontWeight: "bold",
  },

  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: "bold",
    color: Colors.brand.navy,
  },

  matchList: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },

  newsList: {
    paddingHorizontal: 16,
  },
  featuredNewsCard: {
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.placeholder,
  },
  featuredNewsImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  featuredNewsContent: {
    padding: 16,
  },
  newsTag: {
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  newsTagText: {
    color: Colors.brand.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  featuredNewsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    lineHeight: 22,
  },
  newsDate: {
    fontSize: 11,
    color: Colors.light.secondaryText,
  },

  featuredNewsCardEdit: {
    width: "48%",
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.light.placeholder,
  },
  newsImage: {
    width: "100%",
    height: 120,
  },
  newsBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: Colors.brand.navy,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  newsBadgeText: {
    color: Colors.brand.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  newsContent: {
    padding: 12,
  },
  newsDateEdit: {
    color: Colors.light.secondaryText,
    fontSize: 12,
    marginBottom: 6,
  },
  newsCardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    lineHeight: 20,
  },
  storeBanner: {
    margin: 16,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.placeholder,
  },

  newsGridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  smallNewsCard: {
    width: "48%",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  smallNewsImagePlaceholder: {
    width: "100%",
    height: 100,
  },
  smallNewsContent: {
    padding: 12,
  },
  smallNewsTitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
});
