import "@/utils/installStorage";

import { AnthemPlayerProvider } from "@/context/AnthemPlayerContext";
import { AppThemeProvider, useAppTheme } from "@/context/ThemeContext";
import { MiniAnthemPlayer } from "@/features/anthems/components/MiniAnthemPlayer";
import { useFixturesQuery } from "@/hooks/useSportsQueries";
import { queryClient, setupQueryFocusManager } from "@/lib/queryClient";
import {
  getNotificationPrefs,
  hasPromptedNotificationPermission,
  markAutoNotificationSyncDone,
  markNotificationPermissionPrompted,
  registerDeviceWithWorker,
  shouldRunAutoNotificationSync,
} from "@/services/notificationPrefs";
import {
  getNotificationPermissionStatus,
  initializeNotifications,
  registerExpoPushTokenAsync,
  requestNotificationPermission,
  subscribeToNotificationResponses,
  syncUpcomingMatchReminders,
} from "@/services/notificationService";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "expo-router/react-navigation";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef } from "react";
import { Platform, View } from "react-native";
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
    initializeNotifications().catch(() => {});
    return setupQueryFocusManager();
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <AnthemPlayerProvider>
          <RootLayoutNav />
        </AnthemPlayerProvider>
      </AppThemeProvider>
    </QueryClientProvider>
  );
}

function AutoNotificationSync() {
  const { data: matches = [] } = useFixturesQuery();
  const syncedRef = useRef(false);

  useEffect(() => {
    if (Platform.OS === "web") return;
    if (syncedRef.current || matches.length === 0) return;
    if (!shouldRunAutoNotificationSync()) {
      syncedRef.current = true;
      return;
    }

    const prefs = getNotificationPrefs();
    if (!prefs.enabled) {
      syncedRef.current = true;
      return;
    }

    syncedRef.current = true;
    (async () => {
      try {
        let perm = await getNotificationPermissionStatus();
        if (perm === "undetermined" && !hasPromptedNotificationPermission()) {
          markNotificationPermissionPrompted();
          perm = await requestNotificationPermission();
        }
        if (perm === "granted") {
          await syncUpcomingMatchReminders(matches, prefs);
          const token = await registerExpoPushTokenAsync();
          await registerDeviceWithWorker(prefs, token);
          markAutoNotificationSyncDone();
        }
      } catch {
        // non-blocking auto sync
      }
    })();
  }, [matches]);

  return null;
}

function RootLayoutNav() {
  const { isDark, theme } = useAppTheme();
  const router = useRouter();

  useEffect(() => {
    return subscribeToNotificationResponses((route) => {
      router.push(route as any);
    });
  }, [router]);

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
      <View style={{ flex: 1 }}>
        <AutoNotificationSync />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="mac/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="sporcular" options={{ headerShown: true }} />
          <Stack.Screen name="haberler" options={{ headerShown: true }} />
          <Stack.Screen name="puan-durumu" options={{ headerShown: true }} />
          <Stack.Screen name="derbi-merkezi" options={{ headerShown: true }} />
          <Stack.Screen name="bildirimler" options={{ headerShown: true }} />
          <Stack.Screen name="tahmin-ligi" options={{ headerShown: true }} />
          <Stack.Screen name="tarih-arsivi" options={{ headerShown: true }} />
        </Stack>
        <MiniAnthemPlayer />
      </View>
    </ThemeProvider>
  );
}
