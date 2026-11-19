import type {
  DeviceRecord,
  DiffNotificationEvent,
  Env,
  StoredPrefs,
  WorkerDiffEventType,
} from "./types";

export function shouldNotifyDevice(
  prefs: StoredPrefs | null,
  branch: "Futbol" | "Basketbol",
  eventType: WorkerDiffEventType,
): boolean {
  if (!prefs) return true;
  if (!prefs.enabled) return false;
  if (branch === "Futbol" && !prefs.branches?.Futbol) return false;
  if (branch === "Basketbol" && !prefs.branches?.Basketbol) return false;

  switch (eventType) {
    case "goal":
    case "var-disallowed":
      return prefs.events?.goals !== false;
    case "red-card":
      return prefs.events?.cards !== false;
    case "kickoff":
    case "halftime":
    case "fulltime":
      return prefs.events?.kickoffAndFullTime !== false;
    case "quarter-end":
      return prefs.events?.quarterAndSetEnds !== false;
    default:
      return true;
  }
}

export async function sendNtfyNotification(
  topic: string,
  evt: Pick<DiffNotificationEvent, "title" | "message" | "tags" | "type">,
): Promise<void> {
  if (!topic) return;
  try {
    await fetch(`https://ntfy.sh/${encodeURIComponent(topic)}`, {
      method: "POST",
      headers: {
        Title: evt.title,
        Priority: evt.type === "goal" ? "urgent" : "high",
        Tags: evt.tags || "yellow_heart,blue_heart",
      },
      body: evt.message,
    });
  } catch {}
}

export async function sendExpoPushBatch(
  tokens: string[],
  evt: Pick<DiffNotificationEvent, "title" | "message" | "matchId">,
): Promise<void> {
  if (tokens.length === 0) return;
  const chunkSize = 100;

  for (let i = 0; i < tokens.length; i += chunkSize) {
    const slice = tokens.slice(i, i + chunkSize);
    const messages = slice.map((to) => ({
      to,
      sound: "default",
      title: evt.title,
      body: evt.message,
      data: {
        matchId: evt.matchId,
        route: `/mac/${evt.matchId}`,
      },
    }));

    try {
      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(messages),
      });
    } catch {}
  }
}

export async function broadcastEventToSubscribers(
  env: Env,
  evt: DiffNotificationEvent,
): Promise<void> {
  const { results } = await env.DB.prepare(
    "SELECT device_id, expo_push_token, ntfy_topic, prefs_json, updated_at FROM devices",
  ).all<DeviceRecord>();

  const expoTokens: string[] = [];
  const ntfyTopics = new Set<string>();

  if (env.DEFAULT_NTFY_TOPIC) {
    ntfyTopics.add(env.DEFAULT_NTFY_TOPIC);
  }

  for (const row of results || []) {
    let parsedPrefs: StoredPrefs | null = null;
    try {
      parsedPrefs = JSON.parse(row.prefs_json) as StoredPrefs;
    } catch {
      parsedPrefs = null;
    }

    if (!shouldNotifyDevice(parsedPrefs, evt.branch, evt.type)) continue;

    if (row.expo_push_token) {
      expoTokens.push(row.expo_push_token);
    }
    if (row.ntfy_topic) {
      ntfyTopics.add(row.ntfy_topic);
    }
  }

  await Promise.all([
    sendExpoPushBatch(expoTokens, evt),
    ...Array.from(ntfyTopics).map((topic) => sendNtfyNotification(topic, evt)),
  ]);
}
