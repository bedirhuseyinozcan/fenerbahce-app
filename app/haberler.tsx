import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Linking, useColorScheme } from 'react-native';
import React, { useEffect, useState } from 'react';
import { fetchNews } from '@/services/newsService';
import { NewsData } from '@/types';
import Colors from '@/constants/Colors';
import { Stack } from 'expo-router';
import { Image } from 'expo-image';

export default function HaberlerScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const [news, setNews] = useState<NewsData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews().then(data => {
      setNews(data);
      setLoading(false);
    });
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Tüm Haberler', headerBackTitle: 'Geri' }} />
      
      {loading ? (
        <ActivityIndicator size="large" color={Colors.brand.navy} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={news}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.newsCard, { backgroundColor: theme.cardBackground }]}
              onPress={() => Linking.openURL(item.link)}
            >
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.newsImage} contentFit="cover" />
              ) : (
                <View style={[styles.newsImage, { backgroundColor: theme.placeholder }]} />
              )}
              <View style={styles.newsContent}>
                <Text style={styles.newsTag}>{item.category}</Text>
                <Text style={[styles.newsTitle, { color: theme.text }]} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.newsDate}>{item.date}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  newsCard: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  newsImage: {
    width: 100,
    height: 100,
  },
  newsContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  newsTag: {
    color: Colors.brand.navy,
    fontSize: 10,
    fontWeight: 'bold',
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  newsDate: {
    color: Colors.light.secondaryText,
    fontSize: 12,
  },
});
