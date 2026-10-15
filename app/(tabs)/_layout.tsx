import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import React from "react";

import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: any;
}) {
  return <FontAwesome size={26} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.placeholder,
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
          headerStyle: { backgroundColor: Colors.brand.navy },
          headerTintColor: Colors.brand.yellow,
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
          headerStyle: { backgroundColor: Colors.brand.navy },
          headerTintColor: Colors.brand.yellow,
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
          headerStyle: { backgroundColor: Colors.brand.navy },
          headerTintColor: Colors.brand.yellow,
          tabBarIcon: ({ color }) => <TabBarIcon name="bars" color={color} />,
        }}
      />
    </Tabs>
  );
}
