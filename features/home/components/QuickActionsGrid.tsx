import { Radius } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";
import { triggerSelectionHaptic } from "@/utils/haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface QuickActionItem {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconColor: string;
  bgColor: string;
  route: string;
}

export function QuickActionsGrid({
  onNavigate,
}: {
  onNavigate: (route: string) => void;
}) {
  const { theme } = useAppTheme();

  const actions: QuickActionItem[] = [
    {
      id: "kadrolar",
      label: "Kadrolar",
      icon: "people",
      iconColor: theme.accent,
      bgColor: theme.accentSoft,
      route: "/sporcular",
    },
    {
      id: "puan-durumu",
      label: "Puan Cetveli",
      icon: "trophy",
      iconColor: "#F59E0B",
      bgColor: "rgba(245, 158, 11, 0.16)",
      route: "/puan-durumu",
    },
    {
      id: "haberler",
      label: "Haberler",
      icon: "newspaper",
      iconColor: "#3B82F6",
      bgColor: "rgba(59, 130, 246, 0.16)",
      route: "/haberler",
    },
    {
      id: "derbi",
      label: "Derbi & H2H",
      icon: "flame",
      iconColor: "#EF4444",
      bgColor: "rgba(239, 68, 68, 0.16)",
      route: "/derbi-merkezi",
    },
  ];

  return (
    <View style={styles.quickActionsContainer}>
      {actions.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.quickActionBtn,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
          onPress={() => {
            triggerSelectionHaptic();
            onNavigate(item.route);
          }}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.quickActionIconBox,
              { backgroundColor: item.bgColor },
            ]}
          >
            <Ionicons name={item.icon} size={19} color={item.iconColor} />
          </View>
          <Text style={[styles.quickActionText, { color: theme.text }]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    gap: 10,
  },
  quickActionBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: 4,
    borderRadius: Radius.md,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  quickActionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
});
