import { NewsCardSkeleton } from "@/components/ui/Skeleton";
import { Radius } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";
import { NewsData } from "@/types";
import { openInAppUrl } from "@/utils/browser";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface HomeNewsSectionProps {
  news: NewsData[];
  loading: boolean;
  onPressSeeAll: () => void;
}

export function HomeNewsSection({
  news,
  loading,
  onPressSeeAll,
}: HomeNewsSectionProps) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          HABERLER
        </Text>
        <TouchableOpacity onPress={onPressSeeAll}>
          <Text style={[styles.sectionLink, { color: theme.accent }]}>
            + Tüm Haberler
          </Text>
        </TouchableOpacity>
      </View>

      {loading && news.length === 0 ? (
        <View style={styles.newsList}>
          <NewsCardSkeleton />
          <NewsCardSkeleton />
        </View>
      ) : news.length > 0 ? (
        <View style={styles.newsList}>
          <TouchableOpacity
            style={[
              styles.featuredNewsCard,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
              },
            ]}
            onPress={() => openInAppUrl(news[0].link)}
            activeOpacity={0.85}
          >
            <View style={styles.featuredImageWrap}>
              <Image
                source={{ uri: news[0].image }}
                style={styles.featuredNewsImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={["transparent", "rgba(4, 21, 46, 0.92)"]}
                style={styles.featuredOverlay}
              >
                <View style={styles.newsTag}>
                  <Text style={styles.newsTagText}>{news[0].category}</Text>
                </View>
                <Text style={styles.featuredNewsTitle} numberOfLines={3}>
                  {news[0].title}
                </Text>
                <Text style={styles.newsDate}>{news[0].date}</Text>
              </LinearGradient>
            </View>
          </TouchableOpacity>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.newsGridRow}
          >
            {news.slice(1).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.smallNewsCard,
                  {
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() => openInAppUrl(item.link)}
                activeOpacity={0.85}
              >
                {item.image ? (
                  <Image
                    source={{ uri: item.image }}
                    style={styles.smallNewsImagePlaceholder}
                  />
                ) : (
                  <View
                    style={[
                      styles.smallNewsImagePlaceholder,
                      { backgroundColor: theme.placeholder },
                    ]}
                  />
                )}
                <View style={styles.smallNewsContent}>
                  <Text
                    style={[styles.smallNewsTagText, { color: theme.accent }]}
                    numberOfLines={1}
                  >
                    {item.category}
                  </Text>
                  <Text
                    style={[styles.smallNewsTitle, { color: theme.text }]}
                    numberOfLines={3}
                  >
                    {item.title}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : (
        <Text style={{ color: theme.secondaryText, paddingHorizontal: 16 }}>
          Haber bulunamadı.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 17,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: "bold",
  },
  newsList: {
    paddingHorizontal: 16,
  },
  featuredNewsCard: {
    borderRadius: Radius.md,
    overflow: "hidden",
    marginBottom: 14,
    borderWidth: 1,
  },
  featuredImageWrap: {
    position: "relative",
    width: "100%",
    height: 220,
  },
  featuredNewsImage: {
    width: "100%",
    height: "100%",
  },
  featuredOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 15,
    paddingVertical: 14,
    paddingTop: 48,
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
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  featuredNewsTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
    lineHeight: 22,
  },
  newsDate: {
    color: "rgba(255, 255, 255, 0.78)",
    fontSize: 11,
  },
  newsGridRow: {
    flexDirection: "row",
    paddingRight: 16,
    paddingBottom: 8,
  },
  smallNewsCard: {
    width: 164,
    marginRight: 12,
    borderRadius: Radius.md,
    overflow: "hidden",
    borderWidth: 1,
  },
  smallNewsImagePlaceholder: {
    width: "100%",
    height: 100,
  },
  smallNewsContent: {
    padding: 12,
  },
  smallNewsTagText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  smallNewsTitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
});
