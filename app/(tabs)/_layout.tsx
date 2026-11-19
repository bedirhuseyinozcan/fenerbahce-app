import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useAppTheme } from "@/context/ThemeContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import React from "react";
import { ColorValue } from "react-native";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: ColorValue;
}) {
  return (
    <FontAwesome
      size={24}
      style={{ marginBottom: -3 }}
      name={props.name}
      color={props.color as string}
    />
  );
}

export default function TabLayout() {
  const { theme, brand } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          backgroundColor: theme.tabBarBg,
          borderTopColor: theme.border,
        },
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ana Sayfa",
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="fikstur"
        options={{
          title: "Fikstür",
          headerTitle: "Maç Takvimi",
          headerStyle: { backgroundColor: brand.navy },
          headerTintColor: brand.yellow,
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="calendar" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="marslar"
        options={{
          title: "Marşlar",
          headerTitle: "Marşlar & Besteler",
          headerStyle: { backgroundColor: brand.navy },
          headerTintColor: brand.yellow,
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="music" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="daha"
        options={{
          title: "Daha Fazla",
          headerTitle: "Menü",
          headerStyle: { backgroundColor: brand.navy },
          headerTintColor: brand.yellow,
          tabBarIcon: ({ color }) => <TabBarIcon name="bars" color={color} />,
        }}
      />
    </Tabs>
  );
}
