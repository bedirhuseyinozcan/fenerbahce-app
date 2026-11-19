import { MatchWatcher } from "./MatchWatcher";
import {
  computeRoomLeaderboard,
  normalizeNickname,
  normalizeRoomCode,
} from "./predictions";
import { sendExpoPushBatch, sendNtfyNotification } from "./push";
import type {
  DeviceRecord,
  Env,
  FinishedMatchScore,
  PredictionRecord,
  WatchTargetMeta,
} from "./types";

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

const HAS_TZ_REGEX = /(?:Z|[+-]\d{2}:?\d{2})$/i;
const NAIVE_ISO_REGEX =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/;

function resolveEuroLeagueUtcDate(game: any): string | undefined {
  if (!game) return undefined;
  if (typeof game.utcDate === "string" && game.utcDate.trim()) {
    const raw = game.utcDate.trim();
    const normalized = HAS_TZ_REGEX.test(raw) ? raw : `${raw}Z`;
    if (!isNaN(Date.parse(normalized))) return normalized;
  }
  if (
    typeof game.localDate === "string" &&
    game.localDate.trim() &&
    typeof game.localTimeZone === "number" &&
    Number.isFinite(game.localTimeZone)
  ) {
    const raw = game.localDate.trim();
    if (HAS_TZ_REGEX.test(raw) && !isNaN(Date.parse(raw))) return raw;
    const m = raw.match(NAIVE_ISO_REGEX);
    if (m) {
      const utcMs =
        Date.UTC(
          parseInt(m[1], 10),
          parseInt(m[2], 10) - 1,
          parseInt(m[3], 10),
          parseInt(m[4], 10),
          parseInt(m[5], 10),
          parseInt(m[6] || "0", 10),
        ) -
        game.localTimeZone * 3_600_000;
      return new Date(utcMs).toISOString();
    }
  }
  if (typeof game.date === "string" && game.date.trim()) {
    const raw = game.date.trim();
    if (HAS_TZ_REGEX.test(raw) && !isNaN(Date.parse(raw))) return raw;
    const m = raw.match(NAIVE_ISO_REGEX);
    if (m) {
      const guessUtcMs = Date.UTC(
        parseInt(m[1], 10),
        parseInt(m[2], 10) - 1,
        parseInt(m[3], 10),
        parseInt(m[4], 10),
        parseInt(m[5], 10),
        parseInt(m[6] || "0", 10),
      );
      try {
        const parts = new Intl.DateTimeFormat("en-CA", {
          timeZone: "Europe/Madrid",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hourCycle: "h23",
        }).formatToParts(new Date(guessUtcMs));
        const getPart = (t: string) =>
          parseInt(parts.find((p) => p.type === t)?.value || "0", 10);
        const h = getPart("hour") === 24 ? 0 : getPart("hour");
        const madridAsUtc = Date.UTC(
          getPart("year"),
          getPart("month") - 1,
          getPart("day"),
          h,
          getPart("minute"),
          getPart("second"),
        );
        return new Date(guessUtcMs - (madridAsUtc - guessUtcMs)).toISOString();
      } catch {
        return new Date(guessUtcMs - 3_600_000).toISOString();
      }
    }
  }
  return undefined;
}

async function discoverActiveMatches(): Promise<WatchTargetMeta[]> {
  const targets: WatchTargetMeta[] = [];
  const nowMs = Date.now();
  const windowMs = 60 * 60 * 1000;

  const leagues = [
    "tur.1",
    "uefa.champions",
    "uefa.europa",
    "uefa.europa.conf",
  ];
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
        const isoDate = resolveEuroLeagueUtcDate(g);
        const startMs = isoDate ? new Date(isoDate).getTime() : NaN;
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

    if (request.method === "POST" && url.pathname === "/predictions") {
      try {
        const body: any = await request.json();
        const roomCode = normalizeRoomCode(body?.roomCode);
        const nickname = normalizeNickname(body?.nickname);
        const deviceId = String(body?.deviceId || "").trim();
        const matchId = String(body?.matchId || "").trim();
        const homeScore = Number(body?.homeScore);
        const awayScore = Number(body?.awayScore);

        if (!roomCode) {
          return jsonResponse(
            { ok: false, error: "Geçerli oda kodu gerekli (en az 3 karakter)." },
            400,
          );
        }
        if (!nickname) {
          return jsonResponse(
            { ok: false, error: "Geçerli takma ad gerekli (en az 2 karakter)." },
            400,
          );
        }
        if (!deviceId || !matchId) {
          return jsonResponse(
            { ok: false, error: "deviceId ve matchId zorunludur." },
            400,
          );
        }
        if (
          !Number.isInteger(homeScore) ||
          !Number.isInteger(awayScore) ||
          homeScore < 0 ||
          awayScore < 0 ||
          homeScore > 200 ||
          awayScore > 200
        ) {
          return jsonResponse(
            { ok: false, error: "Skorlar 0-200 arasında tam sayı olmalıdır." },
            400,
          );
        }

        const createdAt = new Date().toISOString();
        await env.DB.prepare(
          `INSERT INTO predictions (room_code, device_id, nickname, match_id, home_score, away_score, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(room_code, device_id, match_id) DO UPDATE SET
             nickname = excluded.nickname,
             home_score = excluded.home_score,
             away_score = excluded.away_score,
             created_at = excluded.created_at`,
        )
          .bind(
            roomCode,
            deviceId,
            nickname,
            matchId,
            homeScore,
            awayScore,
            createdAt,
          )
          .run();

        return jsonResponse({
          ok: true,
          roomCode,
          matchId,
          homeScore,
          awayScore,
        });
      } catch {
        return jsonResponse({ ok: false, error: "Invalid JSON body" }, 400);
      }
    }

    const roomPredsMatch = url.pathname.match(/^\/rooms\/([^/]+)\/predictions$/);
    if (request.method === "GET" && roomPredsMatch) {
      const roomCode = normalizeRoomCode(decodeURIComponent(roomPredsMatch[1]));
      if (!roomCode) {
        return jsonResponse({ ok: false, error: "Invalid room code" }, 400);
      }
      const matchIdFilter = url.searchParams.get("matchId");
      const query = matchIdFilter
        ? env.DB.prepare(
            "SELECT room_code, device_id, nickname, match_id, home_score, away_score, created_at FROM predictions WHERE room_code = ? AND match_id = ? ORDER BY created_at DESC",
          ).bind(roomCode, matchIdFilter)
        : env.DB.prepare(
            "SELECT room_code, device_id, nickname, match_id, home_score, away_score, created_at FROM predictions WHERE room_code = ? ORDER BY created_at DESC LIMIT 500",
          ).bind(roomCode);

      const { results } = await query.all<PredictionRecord>();
      return jsonResponse({
        ok: true,
        roomCode,
        predictions: results || [],
      });
    }

    const roomBoardMatch = url.pathname.match(/^\/rooms\/([^/]+)\/leaderboard$/);
    if (
      (request.method === "GET" || request.method === "POST") &&
      roomBoardMatch
    ) {
      const roomCode = normalizeRoomCode(decodeURIComponent(roomBoardMatch[1]));
      if (!roomCode) {
        return jsonResponse({ ok: false, error: "Invalid room code" }, 400);
      }

      const { results } = await env.DB.prepare(
        "SELECT room_code, device_id, nickname, match_id, home_score, away_score, created_at FROM predictions WHERE room_code = ? ORDER BY created_at DESC LIMIT 500",
      )
        .bind(roomCode)
        .all<PredictionRecord>();

      const rows = results || [];
      const memberCount = new Set(rows.map((r) => r.device_id)).size;

      if (request.method === "POST") {
        let finishedMatches: FinishedMatchScore[] = [];
        try {
          const body: any = await request.json();
          if (Array.isArray(body?.finishedMatches)) {
            finishedMatches = body.finishedMatches;
          }
        } catch {
          finishedMatches = [];
        }
        const leaderboard = computeRoomLeaderboard(rows, finishedMatches);
        return jsonResponse({
          ok: true,
          roomCode,
          leaderboard,
          predictions: rows,
          memberCount,
        });
      }

      return jsonResponse({
        ok: true,
        roomCode,
        predictions: rows,
        memberCount,
      });
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
