import {
  computeReminderTriggers,
  getNotificationPrefs,
  getTrackedMatchReminders,
  setTrackedMatchReminders,
} from "@/services/notificationPrefs";
import { MatchData, NotificationPreferences } from "@/types";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export type PermissionState = "granted" | "denied" | "undetermined";

const CHANNEL_GOALS = "match-goals";
const CHANNEL_REMINDERS = "match-reminders";

let initialized = false;

export async function initializeNotifications(): Promise<void> {
  if (!initialized) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    initialized = true;
  }

  if (Platform.OS === "android") {
    try {
      await Notifications.setNotificationChannelAsync(CHANNEL_GOALS, {
        name: "Canlı Skor & Gol Bildirimleri",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 150, 250],
        lightColor: "#FFED00",
      });
      await Notifications.setNotificationChannelAsync(CHANNEL_REMINDERS, {
        name: "Maç Başlangıç Hatırlatmaları",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 200, 120, 200],
        lightColor: "#072146",
      });
    } catch {}
  }
}

export async function getNotificationPermissionStatus(): Promise<PermissionState> {
  try {
    const res = await Notifications.getPermissionsAsync();
    if (res.status === "granted") return "granted";
    if (res.status === "denied") return "denied";
    return "undetermined";
  } catch {
    return "undetermined";
  }
}

export async function requestNotificationPermission(): Promise<PermissionState> {
  try {
    await initializeNotifications();
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === "granted") return "granted";
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === "granted") return "granted";
    if (status === "denied") return "denied";
    return "undetermined";
  } catch {
    return "denied";
  }
}

export async function registerExpoPushTokenAsync(): Promise<string | null> {
  try {
    const perm = await getNotificationPermissionStatus();
    if (perm !== "granted") return null;

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    const res = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    return res.data || null;
  } catch {
    return null;
  }
}

export async function syncUpcomingMatchReminders(
  matches: MatchData[],
  prefs: NotificationPreferences = getNotificationPrefs(),
): Promise<number> {
  try {
    const perm = await getNotificationPermissionStatus();
    if (perm !== "granted") return 0;

    await Notifications.cancelAllScheduledNotificationsAsync();
    const specs = computeReminderTriggers(matches, prefs);
    const tracked: Record<string, string[]> = {};

    for (const spec of specs) {
      const notifId = await Notifications.scheduleNotificationAsync({
        content: {
          title: spec.title,
          body: spec.body,
          sound: "default",
          data: { matchId: spec.matchId, route: `/mac/${spec.matchId}` },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(spec.fireAtMs),
          channelId: Platform.OS === "android" ? CHANNEL_REMINDERS : undefined,
        },
      });
      if (!tracked[spec.matchId]) tracked[spec.matchId] = [];
      tracked[spec.matchId].push(notifId);
    }

    setTrackedMatchReminders(tracked);
    return specs.length;
  } catch {
    return 0;
  }
}

export function isMatchReminderScheduled(matchId: string): boolean {
  const map = getTrackedMatchReminders();
  return Array.isArray(map[matchId]) && map[matchId].length > 0;
}

export async function toggleMatchReminder(
  match: MatchData,
): Promise<{ scheduled: boolean; message: string }> {
  const map = getTrackedMatchReminders();
  const existingIds = map[match.id];

  if (Array.isArray(existingIds) && existingIds.length > 0) {
    for (const nid of existingIds) {
      try {
        await Notifications.cancelScheduledNotificationAsync(nid);
      } catch {}
    }
    delete map[match.id];
    setTrackedMatchReminders(map);
    return { scheduled: false, message: "Maç hatırlatması iptal edildi." };
  }

  const perm = await requestNotificationPermission();
  if (perm !== "granted") {
    return {
      scheduled: false,
      message: "Bildirim izni verilmediği için hatırlatma kurulamadı.",
    };
  }

  const prefs = getNotificationPrefs();
  const specs = computeReminderTriggers([match], {
    ...prefs,
    enabled: true,
    branches: { Futbol: true, Basketbol: true, Voleybol: true },
  });

  if (specs.length === 0) {
    return {
      scheduled: false,
      message:
        "Maç saati çok yakın veya geçmiş olduğu için hatırlatma kurulamadı.",
    };
  }

  const createdIds: string[] = [];
  for (const spec of specs) {
    const notifId = await Notifications.scheduleNotificationAsync({
      content: {
        title: spec.title,
        body: spec.body,
        sound: "default",
        data: { matchId: spec.matchId, route: `/mac/${spec.matchId}` },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(spec.fireAtMs),
        channelId: Platform.OS === "android" ? CHANNEL_REMINDERS : undefined,
      },
    });
    createdIds.push(notifId);
  }

  map[match.id] = createdIds;
  setTrackedMatchReminders(map);
  return {
    scheduled: true,
    message: `🔔 ${createdIds.length} hatırlatma kuruldu!`,
  };
}

export async function sendInstantLocalTestNotification(): Promise<boolean> {
  try {
    const perm = await requestNotificationPermission();
    if (perm !== "granted") return false;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⚽ GOOOL! Fenerbahçe 2 - 1",
        body: "Bildirim sistemi cihazında aktif! Goller ve maç hatırlatmaları hazır.",
        sound: "default",
        data: { route: "/(tabs)" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
        channelId: Platform.OS === "android" ? CHANNEL_GOALS : undefined,
      },
    });
    return true;
  } catch {
    return false;
  }
}

export function subscribeToNotificationResponses(
  onRoute: (route: string) => void,
): () => void {
  Notifications.getLastNotificationResponseAsync()
    .then((response) => {
      const route = response?.notification?.request?.content?.data?.route;
      if (typeof route === "string" && route.startsWith("/")) {
        onRoute(route);
      }
    })
    .catch(() => {});

  const sub = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const route = response?.notification?.request?.content?.data?.route;
      if (typeof route === "string" && route.startsWith("/")) {
        onRoute(route);
      }
    },
  );

  return () => {
    sub.remove();
  };
}
