import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { fetchSuperLigStandings } from '@/services/standingsService';
import { TeamStanding } from '@/types';
import Colors from '@/constants/Colors';
import CloudinaryImage from '@/components/CloudinaryImage';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function PuanDurumuScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuperLigStandings().then(data => {
      setStandings(data);
      setLoading(false);
    });
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Puan Durumu', headerBackTitle: 'Geri' }} />
      
      {loading ? (
        <ActivityIndicator size="large" color={Colors.brand.navy} style={{ marginTop: 50 }} />
      ) : (
        <View style={[styles.tableContainer, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerText, { flex: 0.5 }]}>#</Text>
            <Text style={[styles.headerText, { flex: 3 }]}>TAKIM</Text>
            <Text style={[styles.headerText, { flex: 1, textAlign: 'center' }]}>O</Text>
            <Text style={[styles.headerText, { flex: 1, textAlign: 'center' }]}>G</Text>
            <Text style={[styles.headerText, { flex: 1, textAlign: 'center' }]}>B</Text>
            <Text style={[styles.headerText, { flex: 1, textAlign: 'center' }]}>M</Text>
            <Text style={[styles.headerText, { flex: 1, textAlign: 'center' }]}>AV</Text>
            <Text style={[styles.headerText, { flex: 1, textAlign: 'center' }]}>P</Text>
          </View>
          
          <FlatList
            data={standings}
            keyExtractor={(item) => item.teamId}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={[styles.row, item.teamName.includes('Fenerbahçe') && { backgroundColor: 'rgba(255, 237, 0, 0.15)' }]}>
                <Text style={[styles.cellText, { flex: 0.5, fontWeight: 'bold', color: theme.text }]}>{item.rank}</Text>
                <View style={{ flex: 3, flexDirection: 'row', alignItems: 'center' }}>
                  <CloudinaryImage publicId={item.badge} style={{ width: 20, height: 20, marginRight: 8 }} contentFit="contain" />
                  <Text style={[styles.cellText, { color: theme.text, fontWeight: item.teamName.includes('Fenerbahçe') ? 'bold' : 'normal' }]} numberOfLines={1}>{item.teamName}</Text>
                </View>
                <Text style={[styles.cellText, { flex: 1, textAlign: 'center', color: theme.secondaryText }]}>{item.played}</Text>
                <Text style={[styles.cellText, { flex: 1, textAlign: 'center', color: theme.secondaryText }]}>{item.win}</Text>
                <Text style={[styles.cellText, { flex: 1, textAlign: 'center', color: theme.secondaryText }]}>{item.draw}</Text>
                <Text style={[styles.cellText, { flex: 1, textAlign: 'center', color: theme.secondaryText }]}>{item.loss}</Text>
                <Text style={[styles.cellText, { flex: 1, textAlign: 'center', color: theme.secondaryText }]}>{item.goalDifference > 0 ? `+${item.goalDifference}` : item.goalDifference}</Text>
                <Text style={[styles.cellText, { flex: 1, textAlign: 'center', fontWeight: 'bold', color: theme.text }]}>{item.points}</Text>
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  tableContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    backgroundColor: 'rgba(0,0,0,0.02)'
  },
  headerText: {
    color: Colors.light.secondaryText,
    fontSize: 11,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.02)",
  },
  cellText: {
    fontSize: 12,
  },
});
