import Colors from "@/constants/Colors";
import { fetchNews } from "@/services/newsService";
import { NewsData } from "@/types";
import { Image } from "expo-image";
import { Stack } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

const NEWS_CATEGORIES = ["TÜMÜ", "TRANSFER", "FUTBOL", "BASKETBOL", "VOLEYBOL", "KULÜP"];

export default function HaberlerScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const [news, setNews] = useState<NewsData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("TÜMÜ");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (force: boolean = false) => {
    const data = await fetchNews(force);
    setNews(data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(true);
  }, [loadData]);

  const filteredNews = useMemo(() => {
    if (selectedCategory === "TÜMÜ") return news;
    return news.filter((item) =>
      item.category.toUpperCase().includes(selectedCategory),
    );
  }, [news, selectedCategory]);

  const handleOpenLink = async (url: string) => {
    try {
      if (url) {
        await Linking.openURL(url);
      }
    } catch (err) {
      console.warn("Haber linki açılamadı:", err);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: "Kulüp & Transfer Haberleri",
          headerStyle: { backgroundColor: Colors.brand.navy },
          headerTintColor: Colors.brand.yellow,
          headerBackTitle: "Geri",
        }}
      />

      {/* Kategori Filtre Hapları (Faz 5: Akıllı Haber Akışı) */}
      <View style={styles.filterRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={NEWS_CATEGORIES}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10 }}
          renderItem={({ item }) => {
            const isActive = selectedCategory === item;
            return (
              <TouchableOpacity
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isActive
                      ? Colors.brand.navy
                      : theme.cardBackground,
                    borderColor: isActive
                      ? Colors.brand.yellow
                      : theme.placeholder,
                  },
                ]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    { color: isActive ? Colors.brand.yellow : theme.text },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.brand.navy} />
          <Text style={[styles.loadingText, { color: theme.secondaryText }]}>
            Haberler yükleniyor...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNews}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.brand.navy}
              colors={[Colors.brand.navy, Colors.brand.yellow]}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.newsCard,
                { backgroundColor: theme.cardBackground },
              ]}
              onPress={() => handleOpenLink(item.link)}
              activeOpacity={0.75}
            >
              {item.image ? (
                <Image
                  source={{ uri: item.image }}
                  style={styles.newsImage}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View
                  style={[
                    styles.newsImage,
                    { backgroundColor: theme.placeholder },
                  ]}
                />
              )}
              <View style={styles.newsContent}>
                <Text style={styles.newsTag}>{item.category}</Text>
                <Text
                  style={[styles.newsTitle, { color: theme.text }]}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
                <Text
                  style={[styles.newsDate, { color: theme.secondaryText }]}
                >
                  {item.date}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={{ color: theme.secondaryText, fontSize: 14 }}>
                Bu kategoride haber bulunamadı.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterRow: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    marginRight: 8,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  newsCard: {
    flexDirection: "row",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  newsImage: {
    width: 105,
    height: 105,
  },
  newsContent: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  newsTag: {
    color: Colors.brand.navy,
    fontSize: 10,
    fontWeight: "bold",
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginVertical: 4,
    lineHeight: 18,
  },
  newsDate: {
    fontSize: 11,
  },
});
