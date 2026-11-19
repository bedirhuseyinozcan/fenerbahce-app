import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("react-native", () => ({
  Platform: { OS: "ios" },
  Linking: { openURL: vi.fn() },
}));

import {
  computeReminderTriggers,
  DEFAULT_NOTIFICATION_PREFS,
  DEFAULT_WORKER_URL,
  generatePrivateNtfyTopic,
  getNotificationPrefs,
  getOrCreateDeviceId,
  markAutoNotificationSyncDone,
  saveNotificationPrefs,
  shouldRunAutoNotificationSync,
} from "@/services/notificationPrefs";
import { MatchData } from "@/types";
import { clearMemoryStorage } from "@/utils/storage";

describe("notificationPrefs", () => {
  beforeEach(() => {
    clearMemoryStorage();
  });

  it("persists partial preference updates cleanly and defaults to live Worker URL", () => {
    expect(DEFAULT_NOTIFICATION_PREFS.workerBaseUrl).toBe(DEFAULT_WORKER_URL);
    expect(getNotificationPrefs()).toEqual(DEFAULT_NOTIFICATION_PREFS);

    saveNotificationPrefs({ workerBaseUrl: "   " });
    expect(getNotificationPrefs().workerBaseUrl).toBe(DEFAULT_WORKER_URL);

    const updated = saveNotificationPrefs({
      remind60Min: false,
      branches: { Futbol: true, Basketbol: false, Voleybol: true },
      workerBaseUrl: " https://example.workers.dev/ ",
    });

    expect(updated.remind60Min).toBe(false);
    expect(updated.remind15Min).toBe(true);
    expect(updated.branches.Basketbol).toBe(false);
    expect(updated.events.goals).toBe(true);
    expect(updated.workerBaseUrl).toBe("https://example.workers.dev/");
  });

  it("tracks auto notification sync cadence", () => {
    const now = 1_700_000_000_000;
    expect(shouldRunAutoNotificationSync(10_000, now)).toBe(true);
    markAutoNotificationSyncDone(now);
    expect(shouldRunAutoNotificationSync(10_000, now + 5_000)).toBe(false);
    expect(shouldRunAutoNotificationSync(10_000, now + 10_000)).toBe(true);
  });

  it("keeps deviceId stable and generates private ntfy topics", () => {
    const first = getOrCreateDeviceId();
    const second = getOrCreateDeviceId();
    expect(first).toBe(second);
    expect(first.startsWith("fb-")).toBe(true);

    const topic = generatePrivateNtfyTopic();
    expect(topic).toMatch(/^fb-1907-[a-z0-9]{8}$/);
  });

  it("computes local reminder triggers respecting branches, offsets, statuses, and 20-item cap", () => {
    const now = new Date("2026-11-19T12:00:00Z").getTime();
    const matches: MatchData[] = [
      {
        id: "m-fb",
        branch: "Futbol",
        competition: "Süper Lig",
        homeTeam: "Fenerbahçe",
        awayTeam: "Beşiktaş",
        date: "",
        time: "20:00",
        stadium: "Ülker Stadyumu",
        rawDate: new Date(now + 3 * 60 * 60 * 1000).toISOString(),
        status: "upcoming",
      },
      {
        id: "m-el",
        branch: "Basketbol",
        competition: "EuroLeague",
        homeTeam: "Fenerbahçe Beko",
        awayTeam: "Real Madrid",
        date: "",
        time: "20:45",
        stadium: "Ülker Spor Salonu",
        rawDate: new Date(now + 4 * 60 * 60 * 1000).toISOString(),
        status: "upcoming",
      },
      {
        id: "m-live",
        branch: "Futbol",
        competition: "Süper Lig",
        homeTeam: "Fenerbahçe",
        awayTeam: "Alanyaspor",
        homeScore: "1",
        awayScore: "0",
        date: "",
        time: "19:00",
        stadium: "Ülker Stadyumu",
        rawDate: new Date(now + 2 * 60 * 60 * 1000).toISOString(),
        status: "live",
      },
      {
        id: "m-too-soon",
        branch: "Futbol",
        competition: "Süper Lig",
        homeTeam: "Fenerbahçe",
        awayTeam: "Kasımpaşa",
        date: "",
        time: "15:10",
        stadium: "Ülker Stadyumu",
        rawDate: new Date(now + 10 * 60 * 1000).toISOString(),
        status: "upcoming",
      },
    ];

    const prefs = {
      ...DEFAULT_NOTIFICATION_PREFS,
      branches: { Futbol: true, Basketbol: false, Voleybol: true },
    };

    const triggers = computeReminderTriggers(matches, prefs, now);
    expect(triggers).toHaveLength(2);
    expect(triggers[0]).toMatchObject({
      matchId: "m-fb",
      offsetMinutes: 60,
    });
    expect(triggers[1]).toMatchObject({
      matchId: "m-fb",
      offsetMinutes: 15,
    });

    // Verify 20-item cap with 15 upcoming matches (30 potential triggers -> capped at 20)
    const manyMatches: MatchData[] = Array.from({ length: 15 }).map((_, i) => ({
      id: `m-${i}`,
      branch: "Futbol",
      competition: "Süper Lig",
      homeTeam: "Fenerbahçe",
      awayTeam: `Rakip ${i}`,
      date: "",
      time: "20:00",
      stadium: "Kadıköy",
      rawDate: new Date(now + (i + 2) * 24 * 60 * 60 * 1000).toISOString(),
      status: "upcoming",
    }));

    const capped = computeReminderTriggers(
      manyMatches,
      DEFAULT_NOTIFICATION_PREFS,
      now,
    );
    expect(capped).toHaveLength(20);
  });
});
