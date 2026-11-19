import "@/utils/installStorage";

import { AppThemeProvider, useAppTheme } from "@/context/ThemeContext";
import { queryClient, setupQueryFocusManager } from "@/lib/queryClient";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "expo-router/react-navigation";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo } from "react";
import "react-native-reanimated";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    return setupQueryFocusManager();
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <RootLayoutNav />
      </AppThemeProvider>
    </QueryClientProvider>
  );
}

function RootLayoutNav() {
  const { isDark, theme } = useAppTheme();

  const navigationTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: theme.background,
        card: theme.tabBarBg,
        text: theme.text,
        border: theme.border,
        primary: theme.accent,
      },
    };
  }, [isDark, theme]);

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="mac/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="sporcular" options={{ headerShown: true }} />
        <Stack.Screen name="haberler" options={{ headerShown: true }} />
        <Stack.Screen name="puan-durumu" options={{ headerShown: true }} />
        <Stack.Screen name="derbi-merkezi" options={{ headerShown: true }} />
      </Stack>
    </ThemeProvider>
  );
}
