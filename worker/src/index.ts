import { MatchWatcher } from "./MatchWatcher";
import { sendExpoPushBatch, sendNtfyNotification } from "./push";
import type { DeviceRecord, Env, WatchTargetMeta } from "./types";

export { MatchWatcher };

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...CORS_HEADERS,
    },
  });
}

function getEuroLeagueSeasonCode(now = new Date()): string {
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return `E${month >= 8 ? year : year - 1}`;
}

async function discoverActiveMatches(): Promise<WatchTargetMeta[]> {
  const targets: WatchTargetMeta[] = [];
  const nowMs = Date.now();
  const windowMs = 60 * 60 * 1000;

  const leagues = ["tur.1", "uefa.champions", "uefa.europa"];
  await Promise.all(
    leagues.map(async (slug) => {
      try {
        const res = await fetch(
          `https://site.web.api.espn.com/apis/site/v2/sports/soccer/${slug}/teams/436/schedule`,
        );
        if (!res.ok) return;
        const json: any = await res.json();
        const events = Array.isArray(json.events) ? json.events : [];
        for (const ev of events) {
          const comp = ev.competitions?.[0];
          if (!comp) continue;
          const state = comp.status?.type?.state;
          const startMs = new Date(comp.date).getTime();
          if (
            state === "in" ||
            (state === "pre" &&
              !isNaN(startMs) &&
              startMs - nowMs <= windowMs &&
              startMs - nowMs >= -windowMs * 3)
          ) {
            targets.push({
              matchId: String(ev.id),
              branch: "Futbol",
              leagueSlug: slug,
            });
          }
        }
      } catch {}
    }),
  );

  try {
    const seasonCode = getEuroLeagueSeasonCode();
    const res = await fetch(
      `https://api-live.euroleague.net/v2/competitions/E/seasons/${seasonCode}/games`,
    );
    if (res.ok) {
      const json: any = await res.json();
      const games = Array.isArray(json.data) ? json.data : [];
      for (const g of games) {
        if (g.local?.club?.code !== "ULK" && g.road?.club?.code !== "ULK") {
          continue;
        }
        const gameState = String(g.gameStatus || g.status || "").toLowerCase();
        const isLive =
          gameState === "live" ||
          gameState === "playing" ||
          (!g.played &&
            ((g.local?.score ?? 0) > 0 || (g.road?.score ?? 0) > 0));
        const startMs = new Date(g.date).getTime();
        if (
          isLive ||
          (!g.played &&
            !isNaN(startMs) &&
            startMs - nowMs <= windowMs &&
            startMs - nowMs >= -windowMs * 3)
        ) {
          targets.push({
            matchId: `el-${g.gameCode}`,
            branch: "Basketbol",
            seasonCode,
          });
        }
      }
    }
  } catch {}

  return targets;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/health") {
      return jsonResponse({
        ok: true,
        service: "fenerbahce-match-engine",
        timestamp: new Date().toISOString(),
      });
    }

    if (request.method === "GET" && url.pathname === "/live") {
      const { results } = await env.DB.prepare(
        "SELECT event_key, match_id, branch, event_type, title, message, created_at FROM match_events_log ORDER BY created_at DESC LIMIT 30",
      ).all();
      return jsonResponse({ ok: true, recentEvents: results || [] });
    }

    if (request.method === "POST" && url.pathname === "/devices/register") {
      try {
        const body: any = await request.json();
        const deviceId = String(body?.deviceId || "").trim();
        if (!deviceId) {
          return jsonResponse({ ok: false, error: "deviceId required" }, 400);
        }
        const expoPushToken = body.expoPushToken
          ? String(body.expoPushToken)
          : null;
        const ntfyTopic = body.ntfyTopic ? String(body.ntfyTopic) : null;
        const prefsJson = JSON.stringify(body.prefs || {});

        await env.DB.prepare(
          `INSERT INTO devices (device_id, expo_push_token, ntfy_topic, prefs_json, updated_at)
           VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(device_id) DO UPDATE SET
             expo_push_token = excluded.expo_push_token,
             ntfy_topic = excluded.ntfy_topic,
             prefs_json = excluded.prefs_json,
             updated_at = excluded.updated_at`,
        )
          .bind(
            deviceId,
            expoPushToken,
            ntfyTopic,
            prefsJson,
            new Date().toISOString(),
          )
          .run();

        return jsonResponse({ ok: true, deviceId });
      } catch {
        return jsonResponse({ ok: false, error: "Invalid JSON body" }, 400);
      }
    }

    if (request.method === "GET" && url.pathname.startsWith("/devices/")) {
      const deviceId = decodeURIComponent(
        url.pathname.replace("/devices/", ""),
      );
      const row = await env.DB.prepare(
        "SELECT device_id, expo_push_token, ntfy_topic, prefs_json, updated_at FROM devices WHERE device_id = ?",
      )
        .bind(deviceId)
        .first<DeviceRecord>();

      if (!row) {
        return jsonResponse({ ok: false, error: "Device not found" }, 404);
      }
      return jsonResponse({ ok: true, device: row });
    }

    if (request.method === "POST" && url.pathname === "/test-push") {
      try {
        const body: any = await request.json();
        const ntfyTopic = body?.ntfyTopic ? String(body.ntfyTopic) : "";
        const expoPushToken = body?.expoPushToken
          ? String(body.expoPushToken)
          : "";
        const testEvt = {
          matchId: "test",
          title: "⚽ Fenerbahçe Maç Motoru Testi",
          message: "Cloudflare Worker + Push bağlantısı sorunsuz çalışıyor!",
          tags: "soccer,yellow_heart,blue_heart",
          type: "goal" as const,
        };
        await Promise.all([
          ntfyTopic
            ? sendNtfyNotification(ntfyTopic, testEvt)
            : Promise.resolve(),
          expoPushToken
            ? sendExpoPushBatch([expoPushToken], testEvt)
            : Promise.resolve(),
        ]);
        return jsonResponse({ ok: true });
      } catch {
        return jsonResponse({ ok: false, error: "Invalid request" }, 400);
      }
    }

    return jsonResponse({ ok: false, error: "Not found" }, 404);
  },

  async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
    const activeTargets = await discoverActiveMatches();
    await Promise.all(
      activeTargets.map(async (meta) => {
        const id = env.MATCH_WATCHER.idFromName(meta.matchId);
        const stub = env.MATCH_WATCHER.get(id);
        await stub.watchMatch(meta);
      }),
    );
  },
};
