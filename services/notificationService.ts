import {
  computeReminderTriggers,
  getNotificationPrefs,
  getTrackedMatchReminders,
  setTrackedMatchReminders,
} from "@/services/notificationPrefs";
import { MatchData, NotificationPreferences } from "@/types";

export type PermissionState = "granted" | "denied" | "undetermined";

export async function initializeNotifications(): Promise<void> {}

export async function getNotificationPermissionStatus(): Promise<PermissionState> {
  if (typeof window !== "undefined" && "Notification" in window) {
    if (window.Notification.permission === "granted") return "granted";
    if (window.Notification.permission === "denied") return "denied";
    return "undetermined";
  }
  return "undetermined";
}

export async function requestNotificationPermission(): Promise<PermissionState> {
  if (typeof window !== "undefined" && "Notification" in window) {
    try {
      const perm = await window.Notification.requestPermission();
      return perm === "granted"
        ? "granted"
        : perm === "denied"
          ? "denied"
          : "undetermined";
    } catch {
      return "denied";
    }
  }
  return "denied";
}

export async function registerExpoPushTokenAsync(): Promise<string | null> {
  return null;
}

export async function syncUpcomingMatchReminders(
  matches: MatchData[],
  prefs: NotificationPreferences = getNotificationPrefs(),
): Promise<number> {
  const specs = computeReminderTriggers(matches, prefs);
  const tracked: Record<string, string[]> = {};
  specs.forEach((s) => {
    if (!tracked[s.matchId]) tracked[s.matchId] = [];
    tracked[s.matchId].push(`web-${s.matchId}-${s.offsetMinutes}`);
  });
  setTrackedMatchReminders(tracked);
  return specs.length;
}

export function isMatchReminderScheduled(matchId: string): boolean {
  const map = getTrackedMatchReminders();
  return Array.isArray(map[matchId]) && map[matchId].length > 0;
}

export async function toggleMatchReminder(
  match: MatchData,
): Promise<{ scheduled: boolean; message: string }> {
  const map = getTrackedMatchReminders();
  if (Array.isArray(map[match.id]) && map[match.id].length > 0) {
    delete map[match.id];
    setTrackedMatchReminders(map);
    return { scheduled: false, message: "Hatırlatma kaldırıldı." };
  }

  map[match.id] = [`web-${match.id}`];
  setTrackedMatchReminders(map);
  return {
    scheduled: true,
    message:
      "Tarayıcıda yerel arka plan bildirimi kısıtlıdır; tam bildirim için mobil APK veya ntfy kanalını kullanın.",
  };
}

export async function sendInstantLocalTestNotification(): Promise<boolean> {
  if (typeof window !== "undefined" && "Notification" in window) {
    const perm = await requestNotificationPermission();
    if (perm === "granted") {
      new window.Notification("⚽ GOOOL! Fenerbahçe 2 - 1", {
        body: "Web tarayıcı bildirimi çalışıyor!",
      });
      return true;
    }
  }
  return false;
}

export function subscribeToNotificationResponses(
  _onRoute: (route: string) => void,
): () => void {
  return () => {};
}
