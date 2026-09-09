import React from 'react';
import { StyleSheet, View, Text, useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

export default function DahaFazlaScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Menü</Text>
      <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
        FBTV, Kadro, Tarihçe ve Ayarlar eklenecek.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});
