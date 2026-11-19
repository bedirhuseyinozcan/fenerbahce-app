/**
 * 💛💙 Fenerbahçe Çok Branşlı Sıfır Maliyetli Canlı Maç & Gol Bildirim Motoru
 *
 * Kullanım:
 *   NTFY_TOPIC=fb-1907-ozelkod node backend/liveWatcher.mjs
 *
 * İsteğe bağlı Expo Push Token listesi:
 *   EXPO_PUSH_TOKENS=ExponentPushToken[xxx],ExponentPushToken[yyy] node backend/liveWatcher.mjs
 */

import { diffEuroLeagueSnapshot, diffFootballSnapshot } from "./matchDiff.mjs";

const NTFY_TOPIC = process.env.NTFY_TOPIC || "fenerbahce-canli-1907";
const EXPO_PUSH_TOKENS = (process.env.EXPO_PUSH_TOKENS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const MAX_NOTIFIED_EVENTS = 500;
const notifiedEvents = new Set();
const matchStates = new Map();

function rememberEvent(key) {
  if (notifiedEvents.has(key)) return false;
  if (notifiedEvents.size >= MAX_NOTIFIED_EVENTS) {
    const oldest = notifiedEvents.values().next().value;
    if (oldest) notifiedEvents.delete(oldest);
  }
  notifiedEvents.add(key);
  return true;
}

function getEuroLeagueSeasonCode(now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return `E${month >= 8 ? year : year - 1}`;
}

async function dispatchNotifications(evt) {
  if (!rememberEvent(evt.eventKey)) return;

  try {
    const res = await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: "POST",
      headers: {
        Title: evt.title,
        Priority: evt.type === "goal" ? "urgent" : "high",
        Tags: evt.tags || "yellow_heart,blue_heart",
      },
      body: evt.message,
    });
    console.log(
      `[NTFY -> ${NTFY_TOPIC}] ${evt.title}: ${evt.message} (HTTP ${res.status})`,
    );
  } catch (err) {
    console.warn("[NTFY HATASI]:", err.message);
  }

  if (EXPO_PUSH_TOKENS.length > 0) {
    try {
      const payload = EXPO_PUSH_TOKENS.map((to) => ({
        to,
        sound: "default",
        title: evt.title,
        body: evt.message,
        data: { route: `/mac/${evt.matchId}`, matchId: evt.matchId },
      }));
      const res = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      console.log(
        `[EXPO PUSH x${EXPO_PUSH_TOKENS.length}] ${evt.title} (HTTP ${res.status})`,
      );
    } catch (err) {
      console.warn("[EXPO PUSH HATASI]:", err.message);
    }
  }
}

async function fetchFootballLiveDetails(slug, matchId) {
  try {
    const res = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/${slug}/summary?event=${matchId}`,
    );
    if (!res.ok) return { redCardIds: [], latestGoalScorer: undefined };
    const data = await res.json();
    const keyEvents = Array.isArray(data.keyEvents) ? data.keyEvents : [];

    const redCardIds = [];
    let latestGoalScorer;

    for (const k of keyEvents) {
      const typeText = String(k.type?.text || "").toLowerCase();
      if (typeText.includes("red card") || /\bred\b/.test(typeText)) {
        redCardIds.push(String(k.id || k.clock?.displayValue || redCardIds.length));
      }
      if (typeText.includes("goal")) {
        const p = k.participants?.[0];
        const scorer =
          (typeof p?.athlete === "string"
            ? p.athlete
            : p?.athlete?.displayName) || p?.displayName;
        if (scorer) latestGoalScorer = scorer;
      }
    }

    return { redCardIds, latestGoalScorer };
  } catch {
    return { redCardIds: [], latestGoalScorer: undefined };
  }
}

async function checkFootballMatches() {
  const leagues = ["tur.1", "uefa.champions", "uefa.europa"];
  let hasLive = false;
  let hasTodayMatch = false;
  const todayStr = new Date().toISOString().slice(0, 10);

  for (const slug of leagues) {
    try {
      const res = await fetch(
        `https://site.web.api.espn.com/apis/site/v2/sports/soccer/${slug}/teams/436/schedule`,
      );
      if (!res.ok) continue;
      const data = await res.json();
      const events = Array.isArray(data.events) ? data.events : [];

      for (const ev of events) {
        const comp = ev.competitions?.[0];
        if (!comp) continue;

        const state = comp.status?.type?.state || "pre";
        if (state === "in") hasLive = true;
        if (String(comp.date || "").startsWith(todayStr)) hasTodayMatch = true;

        const matchId = String(ev.id);
        const home = comp.competitors?.find((c) => c.homeAway === "home");
        const away = comp.competitors?.find((c) => c.homeAway === "away");
        if (!home || !away) continue;

        const homeScore =
          parseInt(String(home.score?.displayValue ?? home.score ?? "0"), 10) ||
          0;
        const awayScore =
          parseInt(String(away.score?.displayValue ?? away.score ?? "0"), 10) ||
          0;

        let extra = { redCardIds: [], latestGoalScorer: undefined };
        if (state === "in") {
          extra = await fetchFootballLiveDetails(slug, matchId);
        }

        const nextSnapshot = {
          matchId,
          homeTeam: home.team?.displayName || "Ev Sahibi",
          awayTeam: away.team?.displayName || "Deplasman",
          state,
          homeScore,
          awayScore,
          clock: comp.status?.displayClock || "Canlı",
          shortDetail: comp.status?.type?.shortDetail || "",
          redCardIds: extra.redCardIds,
          latestGoalScorer: extra.latestGoalScorer,
        };

        const prevSnapshot = matchStates.get(matchId);
        if (prevSnapshot) {
          const diffs = diffFootballSnapshot(prevSnapshot, nextSnapshot);
          for (const d of diffs) {
            await dispatchNotifications(d);
          }
        }
        matchStates.set(matchId, nextSnapshot);
      }
    } catch (err) {
      console.warn(`[ESPN ${slug} kontrol hatası]:`, err.message);
    }
  }

  return { hasLive, hasTodayMatch };
}

async function checkEuroLeagueMatches() {
  let hasLive = false;
  let hasTodayMatch = false;
  const todayStr = new Date().toISOString().slice(0, 10);

  try {
    const seasonCode = getEuroLeagueSeasonCode();
    const res = await fetch(
      `https://api-live.euroleague.net/v2/competitions/E/seasons/${seasonCode}/games`,
    );
    if (!res.ok) return { hasLive, hasTodayMatch };
    const json = await res.json();
    const games = Array.isArray(json.data) ? json.data : [];

    for (const g of games) {
      if (g.local?.club?.code !== "ULK" && g.road?.club?.code !== "ULK") {
        continue;
      }

      if (String(g.date || "").startsWith(todayStr)) hasTodayMatch = true;

      const gameState = String(g.gameStatus || g.status || "").toLowerCase();
      const isLive =
        gameState === "live" ||
        gameState === "playing" ||
        (!g.played &&
          ((g.local?.score ?? 0) > 0 || (g.road?.score ?? 0) > 0));
      const state = isLive ? "in" : g.played ? "post" : "pre";
      if (state === "in") hasLive = true;

      const lp = g.local?.partials || {};
      const rp = g.road?.partials || {};
      let completedQuarters = 0;
      let lastQuarterScore;
      for (const q of [1, 2, 3, 4]) {
        const lh = lp[`partials${q}`] || 0;
        const ra = rp[`partials${q}`] || 0;
        if (lh > 0 || ra > 0) {
          completedQuarters = q;
          lastQuarterScore = `${q}.Ç: ${lh}-${ra}`;
        }
      }

      const matchId = `el-${g.gameCode}`;
      const nextSnapshot = {
        matchId,
        homeTeam:
          g.local?.club?.code === "ULK"
            ? "Fenerbahçe Beko"
            : g.local?.club?.name || "Ev Sahibi",
        awayTeam:
          g.road?.club?.code === "ULK"
            ? "Fenerbahçe Beko"
            : g.road?.club?.name || "Deplasman",
        state,
        homeScore: Number(g.local?.score ?? 0),
        awayScore: Number(g.road?.score ?? 0),
        completedQuarters,
        lastQuarterScore,
      };

      const prevSnapshot = matchStates.get(matchId);
      if (prevSnapshot) {
        const diffs = diffEuroLeagueSnapshot(prevSnapshot, nextSnapshot);
        for (const d of diffs) {
          await dispatchNotifications(d);
        }
      }
      matchStates.set(matchId, nextSnapshot);
    }
  } catch (err) {
    console.warn("[EuroLeague kontrol hatası]:", err.message);
  }

  return { hasLive, hasTodayMatch };
}

async function runCycle() {
  const [fb, el] = await Promise.all([
    checkFootballMatches(),
    checkEuroLeagueMatches(),
  ]);

  const hasLive = fb.hasLive || el.hasLive;
  const hasToday = fb.hasTodayMatch || el.hasTodayMatch;
  const nextDelayMs = hasLive ? 15_000 : hasToday ? 60_000 : 300_000;

  setTimeout(runCycle, nextDelayMs);
}

console.log(
  `💛💙 Fenerbahçe Çok Branşlı Canlı Maç Motoru Başlatıldı! Kanal: https://ntfy.sh/${NTFY_TOPIC}`,
);
if (EXPO_PUSH_TOKENS.length > 0) {
  console.log(`📱 Expo Push hedefleri: ${EXPO_PUSH_TOKENS.length} cihaz`);
}
runCycle();
