import Colors from "@/constants/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export default function DahaFazlaScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const menuSections = [
    {
      title: "KULÜP & SPORCULAR",
      items: [
        {
          id: "sporcular",
          title: "A Takım Kadroları",
          subtitle: "Futbol, Basketbol ve Voleybol sporcuları",
          icon: "people",
          iconColor: Colors.brand.navy,
          onPress: () => router.push("/sporcular" as any),
        },
        {
          id: "puan-durumu",
          title: "Süper Lig Puan Durumu",
          subtitle: "Güncel puan tablosu ve averajlar",
          icon: "trophy",
          iconColor: "#FFA000",
          onPress: () => router.push("/puan-durumu" as any),
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
          <Text style={styles.bannerTag}>YENİ ÖZELLİK</Text>
          <Text style={styles.bannerTitle}>A Takım Sporcuları</Text>
          <Text style={styles.bannerSubtitle}>
            Futbol, Basketbol ve Voleybol güncel kadrolarını keşfedin.
          </Text>
        </View>
        <View style={styles.bannerIconContainer}>
          <Text style={{ fontSize: 32 }}>⚽</Text>
          <Text style={{ fontSize: 24, marginTop: -8 }}>🏀🏐</Text>
        </View>
      </TouchableOpacity>
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
          Fenerbahçe Mobil v1.0.0 (Expo SDK 57)
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
