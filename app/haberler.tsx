import { NewsCardSkeleton } from "@/components/ui/Skeleton";
import { Radius } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";
import { useNewsQuery } from "@/hooks/useSportsQueries";
import { openInAppUrl } from "@/utils/browser";
import { triggerSelectionHaptic } from "@/utils/haptics";
import { Image } from "expo-image";
import { Stack } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const NEWS_CATEGORIES = [
  "TÜMÜ",
  "TRANSFER",
  "FUTBOL",
  "BASKETBOL",
  "VOLEYBOL",
  "KULÜP",
];

export default function HaberlerScreen() {
  const { theme, brand } = useAppTheme();
  const [selectedCategory, setSelectedCategory] = useState("TÜMÜ");
  const [refreshing, setRefreshing] = useState(false);

  const { data: news = [], isLoading, refetch } = useNewsQuery();
  const loading = isLoading && news.length === 0;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const filteredNews = useMemo(() => {
    if (selectedCategory === "TÜMÜ") return news;
    return news.filter((item) =>
      item.category.toUpperCase().includes(selectedCategory),
    );
  }, [news, selectedCategory]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: "Kulüp & Transfer Haberleri",
          headerStyle: { backgroundColor: brand.navy },
          headerTintColor: brand.yellow,
          headerBackTitle: "Geri",
        }}
      />

      <View style={[styles.filterRow, { borderBottomColor: theme.divider }]}>
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
                      ? brand.navy
                      : theme.cardBackground,
                    borderColor: isActive ? brand.yellow : theme.border,
                  },
                ]}
                onPress={() => {
                  triggerSelectionHaptic();
                  setSelectedCategory(item);
                }}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    { color: isActive ? brand.yellow : theme.text },
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
        <View style={styles.listContainer}>
          <NewsCardSkeleton />
          <NewsCardSkeleton />
          <NewsCardSkeleton />
          <NewsCardSkeleton />
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
              tintColor={theme.accent}
              colors={[brand.navy, brand.yellow]}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.newsCard,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border,
                },
              ]}
              onPress={() => openInAppUrl(item.link)}
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
                <Text style={[styles.newsTag, { color: theme.accent }]}>
                  {item.category}
                </Text>
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
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  newsCard: {
    flexDirection: "row",
    borderRadius: Radius.md,
    overflow: "hidden",
    marginBottom: 14,
    borderWidth: 1,
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
