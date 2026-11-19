import { Radius } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  FadeInDown,
  FadeOutUp,
} from "react-native-reanimated";

interface GoalAlertBannerProps {
  visible: boolean;
  scoreText: string;
  onDismiss: () => void;
}

export function GoalAlertBanner({
  visible,
  scoreText,
  onDismiss,
}: GoalAlertBannerProps) {
  const { brand } = useAppTheme();

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onDismiss, 6000);
    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(350)}
      exiting={FadeOutUp.duration(250)}
      style={styles.wrapper}
    >
      <LinearGradient
        colors={[brand.yellow, brand.gold]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.card, { borderColor: brand.navy }]}
      >
        <View style={styles.leftRow}>
          <Text style={styles.emoji}>⚽</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: brand.navy }]}>
              GOOOL! FENERBAHÇE ATTI!
            </Text>
            <Text style={[styles.subtitle, { color: brand.navy }]}>
              {scoreText}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={onDismiss}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={20} color={brand.navy} />
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  card: {
    borderRadius: Radius.md,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  emoji: {
    fontSize: 22,
  },
  title: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 1,
  },
});
