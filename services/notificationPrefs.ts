import { getNtfyTopic } from "@/services/fanEngagementService";
import { resolveMatchStatus } from "@/services/fixtureService";
import {
  MatchData,
  NotificationPreferences,
  ScheduledReminderSpec,
} from "@/types";
import { getJson, getString, setJson, setString } from "@/utils/storage";

const PREFS_KEY = "fb_notification_prefs_v1";
const DEVICE_ID_KEY = "fb_device_id_v1";
const MATCH_REMINDERS_KEY = "fb_match_reminders_v1";
const NOTIF_PROMPTED_KEY = "fb_notif_prompted_v1";
const AUTO_SYNC_TS_KEY = "fb_auto_notif_sync_ts_v1";
const DEFAULT_AUTO_SYNC_INTERVAL_MS = 6 * 60 * 60 * 1000;

export const DEFAULT_WORKER_URL =
  "https://fenerbahce-match-engine.fb-bedir.workers.dev";

export const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  enabled: true,
  remind60Min: true,
  remind15Min: true,
  branches: {
    Futbol: true,
    Basketbol: true,
    Voleybol: true,
  },
  events: {
    goals: true,
    cards: true,
    kickoffAndFullTime: true,
    lineups: true,
    quarterAndSetEnds: true,
  },
  workerBaseUrl: DEFAULT_WORKER_URL,
};

export function getNotificationPrefs(): NotificationPreferences {
  const stored = getJson<Partial<NotificationPreferences>>(PREFS_KEY);
  if (!stored) {
    return {
      ...DEFAULT_NOTIFICATION_PREFS,
      branches: { ...DEFAULT_NOTIFICATION_PREFS.branches },
      events: { ...DEFAULT_NOTIFICATION_PREFS.events },
    };
  }

  const rawUrl =
    typeof stored.workerBaseUrl === "string" ? stored.workerBaseUrl.trim() : "";

  return {
    ...DEFAULT_NOTIFICATION_PREFS,
    ...stored,
    branches: {
      ...DEFAULT_NOTIFICATION_PREFS.branches,
      ...(stored.branches || {}),
    },
    events: {
      ...DEFAULT_NOTIFICATION_PREFS.events,
      ...(stored.events || {}),
    },
    workerBaseUrl: rawUrl || DEFAULT_WORKER_URL,
  };
}

export function saveNotificationPrefs(
  patch: Partial<NotificationPreferences>,
): NotificationPreferences {
  const current = getNotificationPrefs();
  const next: NotificationPreferences = {
    ...current,
    ...patch,
    branches: {
      ...current.branches,
      ...(patch.branches || {}),
    },
    events: {
      ...current.events,
      ...(patch.events || {}),
    },
    workerBaseUrl:
      patch.workerBaseUrl !== undefined
        ? patch.workerBaseUrl.trim()
        : current.workerBaseUrl,
  };
  setJson(PREFS_KEY, next);
  return next;
}

export function getOrCreateDeviceId(): string {
  const existing = getString(DEVICE_ID_KEY);
  if (existing) return existing;
  const generated = `fb-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
  setString(DEVICE_ID_KEY, generated);
  return generated;
}

export function generatePrivateNtfyTopic(): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let suffix = "";
  for (let i = 0; i < 8; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `fb-1907-${suffix}`;
}

export function getTrackedMatchReminders(): Record<string, string[]> {
  return getJson<Record<string, string[]>>(MATCH_REMINDERS_KEY) || {};
}

export function setTrackedMatchReminders(map: Record<string, string[]>): void {
  setJson(MATCH_REMINDERS_KEY, map);
}

export function hasPromptedNotificationPermission(): boolean {
  return getString(NOTIF_PROMPTED_KEY) === "1";
}

export function markNotificationPermissionPrompted(): void {
  setString(NOTIF_PROMPTED_KEY, "1");
}

export function shouldRunAutoNotificationSync(
  minIntervalMs: number = DEFAULT_AUTO_SYNC_INTERVAL_MS,
  nowMs: number = Date.now(),
): boolean {
  const raw = getString(AUTO_SYNC_TS_KEY);
  if (!raw) return true;
  const lastMs = parseInt(raw, 10);
  if (!Number.isFinite(lastMs)) return true;
  return nowMs - lastMs >= minIntervalMs;
}

export function markAutoNotificationSyncDone(
  nowMs: number = Date.now(),
): void {
  setString(AUTO_SYNC_TS_KEY, String(nowMs));
}

function isBranchEnabled(
  branch: string,
  prefs: NotificationPreferences,
): boolean {
  if (branch === "Futbol") return prefs.branches.Futbol;
  if (branch === "Basketbol") return prefs.branches.Basketbol;
  if (branch === "Voleybol") return prefs.branches.Voleybol;
  return true;
}

export function computeReminderTriggers(
  matches: MatchData[],
  prefs: NotificationPreferences,
  nowMs: number = Date.now(),
): ScheduledReminderSpec[] {
  if (!prefs.enabled || (!prefs.remind60Min && !prefs.remind15Min)) {
    return [];
  }

  const specs: ScheduledReminderSpec[] = [];
  const offsets: (60 | 15)[] = [];
  if (prefs.remind60Min) offsets.push(60);
  if (prefs.remind15Min) offsets.push(15);

  for (const match of matches) {
    if (resolveMatchStatus(match) !== "upcoming") continue;
    if (!match.rawDate || !isBranchEnabled(match.branch, prefs)) continue;

    const startMs = new Date(match.rawDate).getTime();
    if (isNaN(startMs)) continue;

    for (const offset of offsets) {
      const fireAtMs = startMs - offset * 60 * 1000;
      if (fireAtMs <= nowMs + 60 * 1000) continue;

      specs.push({
        matchId: match.id,
        offsetMinutes: offset,
        fireAtMs,
        title:
          offset === 60
            ? "⏰ Fenerbahçe Maçı 1 Saat Sonra!"
            : "🔥 Maç Başlamak Üzere (15 Dk)",
        body: `${match.homeTeam} - ${match.awayTeam} • ${match.competition}${match.stadium ? ` (${match.stadium})` : ""}`,
      });
    }
  }

  specs.sort((a, b) => a.fireAtMs - b.fireAtMs);
  return specs.slice(0, 20);
}

function normalizeWorkerUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, "");
}

export async function checkWorkerHealth(
  baseUrl: string,
): Promise<{ ok: boolean; message: string }> {
  const cleanUrl = normalizeWorkerUrl(baseUrl);
  if (!cleanUrl) {
    return { ok: false, message: "Worker URL girilmedi." };
  }
  try {
    const res = await fetch(`${cleanUrl}/health`);
    if (!res.ok) {
      return { ok: false, message: `Sunucu HTTP ${res.status} döndü.` };
    }
    const json = await res.json();
    return {
      ok: true,
      message: `✅ Maç Motoru aktif (${json.service || "fenerbahce-match-engine"})`,
    };
  } catch (err: any) {
    return {
      ok: false,
      message: `❌ Bağlantı kurulamadı: ${err?.message || "Ağ hatası"}`,
    };
  }
}

export async function registerDeviceWithWorker(
  prefs: NotificationPreferences,
  expoPushToken?: string | null,
): Promise<{ ok: boolean; message: string }> {
  const cleanUrl = normalizeWorkerUrl(prefs.workerBaseUrl);
  if (!cleanUrl) {
    return { ok: false, message: "Worker URL girilmedi." };
  }

  try {
    const res = await fetch(`${cleanUrl}/devices/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId: getOrCreateDeviceId(),
        expoPushToken: expoPushToken || null,
        ntfyTopic: getNtfyTopic(),
        prefs,
      }),
    });

    if (!res.ok) {
      return { ok: false, message: `Kayıt başarısız (HTTP ${res.status}).` };
    }

    return {
      ok: true,
      message: "✅ Cihaz ve bildirim tercihleri Maç Motoruna kaydedildi!",
    };
  } catch (err: any) {
    return {
      ok: false,
      message: `❌ Kayıt hatası: ${err?.message || "Ağ hatası"}`,
    };
  }
}
