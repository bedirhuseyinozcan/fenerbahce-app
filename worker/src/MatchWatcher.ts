import { DurableObject } from "cloudflare:workers";
import { diffEuroLeagueSnapshot, diffFootballSnapshot } from "./matchDiff";
import { broadcastEventToSubscribers } from "./push";
import type {
  DiffNotificationEvent,
  Env,
  EuroLeagueSnapshot,
  FootballSnapshot,
  WatchTargetMeta,
} from "./types";

export class MatchWatcher extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.ctx.blockConcurrencyWhile(async () => {
      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS watcher_state (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          meta_json TEXT NOT NULL,
          snapshot_json TEXT,
          updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS sent_events (
          event_key TEXT PRIMARY KEY,
          sent_at TEXT NOT NULL
        );
      `);
    });
  }

  async watchMatch(meta: WatchTargetMeta): Promise<void> {
    this.ctx.storage.sql.exec(
      `INSERT INTO watcher_state (id, meta_json, updated_at)
       VALUES (1, ?, ?)
       ON CONFLICT(id) DO UPDATE SET meta_json = excluded.meta_json, updated_at = excluded.updated_at`,
      JSON.stringify(meta),
      new Date().toISOString(),
    );

    const existingAlarm = await this.ctx.storage.getAlarm();
    if (existingAlarm === null) {
      await this.ctx.storage.setAlarm(Date.now() + 1000);
    }
  }

  private getStateRow(): {
    meta: WatchTargetMeta;
    snapshot: FootballSnapshot | EuroLeagueSnapshot | null;
  } | null {
    const rows = this.ctx.storage.sql
      .exec<{ meta_json: string; snapshot_json: string | null }>(
        "SELECT meta_json, snapshot_json FROM watcher_state WHERE id = 1",
      )
      .toArray();

    if (rows.length === 0) return null;
    const meta = JSON.parse(rows[0].meta_json) as WatchTargetMeta;
    const snapshot = rows[0].snapshot_json
      ? JSON.parse(rows[0].snapshot_json)
      : null;
    return { meta, snapshot };
  }

  private saveSnapshot(snapshot: FootballSnapshot | EuroLeagueSnapshot): void {
    this.ctx.storage.sql.exec(
      "UPDATE watcher_state SET snapshot_json = ?, updated_at = ? WHERE id = 1",
      JSON.stringify(snapshot),
      new Date().toISOString(),
    );
  }

  private hasSentEvent(eventKey: string): boolean {
    const rows = this.ctx.storage.sql
      .exec<{ event_key: string }>(
        "SELECT event_key FROM sent_events WHERE event_key = ?",
        eventKey,
      )
      .toArray();
    return rows.length > 0;
  }

  private markEventSent(evt: DiffNotificationEvent): void {
    this.ctx.storage.sql.exec(
      "INSERT OR IGNORE INTO sent_events (event_key, sent_at) VALUES (?, ?)",
      evt.eventKey,
      new Date().toISOString(),
    );
  }

  private async fetchFootballSnapshot(
    meta: WatchTargetMeta,
  ): Promise<FootballSnapshot | null> {
    const slug = meta.leagueSlug || "tur.1";
    const res = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/${slug}/summary?event=${meta.matchId}`,
    );
    if (!res.ok) return null;
    const data: any = await res.json();
    const comp = data.header?.competitions?.[0];
    if (!comp) return null;

    const home = comp.competitors?.find((c: any) => c.homeAway === "home");
    const away = comp.competitors?.find((c: any) => c.homeAway === "away");
    if (!home || !away) return null;

    const stateRaw = comp.status?.type?.state;
    const state: "pre" | "in" | "post" =
      stateRaw === "in" ? "in" : stateRaw === "post" ? "post" : "pre";

    const keyEvents = Array.isArray(data.keyEvents) ? data.keyEvents : [];
    const redCardIds: string[] = [];
    let latestGoalScorer: string | undefined;

    for (const k of keyEvents) {
      const typeText = String(k.type?.text || "").toLowerCase();
      if (typeText.includes("red card") || /\bred\b/.test(typeText)) {
        redCardIds.push(
          String(k.id || k.clock?.displayValue || redCardIds.length),
        );
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

    return {
      matchId: meta.matchId,
      homeTeam: home.team?.displayName || "Ev Sahibi",
      awayTeam: away.team?.displayName || "Deplasman",
      state,
      homeScore:
        parseInt(String(home.score?.displayValue ?? home.score ?? "0"), 10) ||
        0,
      awayScore:
        parseInt(String(away.score?.displayValue ?? away.score ?? "0"), 10) ||
        0,
      clock: comp.status?.displayClock || "Canlı",
      shortDetail: comp.status?.type?.shortDetail || "",
      redCardIds,
      latestGoalScorer,
    };
  }

  private async fetchEuroLeagueSnapshot(
    meta: WatchTargetMeta,
  ): Promise<EuroLeagueSnapshot | null> {
    const seasonCode = meta.seasonCode || "E2026";
    const gameCode = parseInt(meta.matchId.replace("el-", ""), 10);
    const res = await fetch(
      `https://api-live.euroleague.net/v2/competitions/E/seasons/${seasonCode}/games`,
    );
    if (!res.ok) return null;
    const json: any = await res.json();
    const game = json.data?.find((g: any) => g.gameCode === gameCode);
    if (!game) return null;

    const gameState = String(game.gameStatus || game.status || "").toLowerCase();
    const isLive =
      gameState === "live" ||
      gameState === "playing" ||
      (!game.played &&
        ((game.local?.score ?? 0) > 0 || (game.road?.score ?? 0) > 0));
    const state: "pre" | "in" | "post" = isLive
      ? "in"
      : game.played
        ? "post"
        : "pre";

    const lp = game.local?.partials || {};
    const rp = game.road?.partials || {};
    let completedQuarters = 0;
    let lastQuarterScore: string | undefined;

    for (const q of [1, 2, 3, 4]) {
      const lh = lp[`partials${q}`] || 0;
      const ra = rp[`partials${q}`] || 0;
      if (lh > 0 || ra > 0) {
        completedQuarters = q;
        lastQuarterScore = `${q}.Ç: ${lh}-${ra}`;
      }
    }

    return {
      matchId: meta.matchId,
      homeTeam:
        game.local?.club?.code === "ULK"
          ? "Fenerbahçe Beko"
          : game.local?.club?.name || "Ev Sahibi",
      awayTeam:
        game.road?.club?.code === "ULK"
          ? "Fenerbahçe Beko"
          : game.road?.club?.name || "Deplasman",
      state,
      homeScore: Number(game.local?.score ?? 0),
      awayScore: Number(game.road?.score ?? 0),
      completedQuarters,
      lastQuarterScore,
    };
  }

  async alarm(): Promise<void> {
    const stateRow = this.getStateRow();
    if (!stateRow) return;

    const { meta, snapshot: prevSnapshot } = stateRow;
    let nextState: "pre" | "in" | "post" = "pre";
    let events: DiffNotificationEvent[] = [];

    if (meta.branch === "Futbol") {
      const next = await this.fetchFootballSnapshot(meta);
      if (next) {
        nextState = next.state;
        events = diffFootballSnapshot(
          prevSnapshot as FootballSnapshot | null,
          next,
        );
        this.saveSnapshot(next);
      }
    } else {
      const next = await this.fetchEuroLeagueSnapshot(meta);
      if (next) {
        nextState = next.state;
        events = diffEuroLeagueSnapshot(
          prevSnapshot as EuroLeagueSnapshot | null,
          next,
        );
        this.saveSnapshot(next);
      }
    }

    for (const evt of events) {
      if (this.hasSentEvent(evt.eventKey)) continue;
      this.markEventSent(evt);

      await this.env.DB.prepare(
        `INSERT OR IGNORE INTO match_events_log (event_key, match_id, branch, event_type, title, message, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(
          evt.eventKey,
          evt.matchId,
          evt.branch,
          evt.type,
          evt.title,
          evt.message,
          new Date().toISOString(),
        )
        .run();

      await broadcastEventToSubscribers(this.env, evt);
    }

    if (nextState !== "post") {
      const delayMs = nextState === "in" ? 15_000 : 60_000;
      await this.ctx.storage.setAlarm(Date.now() + delayMs);
    }
  }
}
