import MatchCard from "@/components/MatchCard";
import Colors from "@/constants/Colors";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabOneScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View
        style={[
          styles.headerContainer,
          {
            backgroundColor: Colors.brand.navy,
            paddingTop: Math.max(insets.top, 20) + 10,
          },
        ]}
      >
        <Text style={styles.headerTitle}>Fenerbahçe</Text>
        <Text style={styles.headerSubtitle}>Spor Kulübü Resmi Uygulaması</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Yaklaşan Maç
        </Text>
        <MatchCard
          homeTeam="Fenerbahçe"
          awayTeam="Galatasaray"
          competition="Süper Lig"
          date="24 Eki 2026"
          time="19:00"
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Son Haberler
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.newsList}
        >
          <View
            style={[styles.newsCard, { backgroundColor: theme.cardBackground }]}
          >
            <View
              style={[
                styles.newsImagePlaceholder,
                { backgroundColor: theme.placeholder },
              ]}
            />
            <Text
              style={[styles.newsTitle, { color: theme.text }]}
              numberOfLines={2}
            >
              Futbol Takımımız hazırlıklarına devam ediyor
            </Text>
          </View>

          <View
            style={[styles.newsCard, { backgroundColor: theme.cardBackground }]}
          >
            <View
              style={[
                styles.newsImagePlaceholder,
                { backgroundColor: theme.placeholder },
              ]}
            />
            <Text
              style={[styles.newsTitle, { color: theme.text }]}
              numberOfLines={2}
            >
              Fenerbahçe Beko deplasmanda galip
            </Text>
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 10,
  },
  headerTitle: {
    color: Colors.brand.yellow,
    fontSize: 28,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: Colors.brand.white,
    fontSize: 14,
    marginTop: 4,
    opacity: 0.8,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginHorizontal: 16,
    marginBottom: 10,
  },
  newsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  newsCard: {
    width: 200,
    marginRight: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newsImagePlaceholder: {
    height: 120,
  },
  newsTitle: {
    padding: 12,
    fontSize: 14,
    fontWeight: "600",
  },
});
