import Colors from "@/constants/Colors";
import React from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

export default function FeneriumScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Çok Yakında!</Text>
      <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
        Yeni sezon formaları ve ürünleri burada olacak.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
});
