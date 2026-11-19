import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("react-native", () => ({
  Platform: { OS: "ios" },
  Linking: { openURL: vi.fn() },
}));

import {
  calculatePredictionStats,
  getPredictionForMatch,
  savePredictionForMatch,
} from "@/services/fanEngagementService";
import { MatchData } from "@/types";
import {
  clearMemoryStorage,
  getJson,
  removeKey,
  setJson,
} from "@/utils/storage";

describe("storage utility", () => {
  beforeEach(() => {
    clearMemoryStorage();
  });

  it("writes, reads, and removes JSON values", () => {
    setJson("test_obj", { points: 1907 });
    expect(getJson<{ points: number }>("test_obj")).toEqual({ points: 1907 });
    removeKey("test_obj");
    expect(getJson("test_obj")).toBeNull();
  });
});

describe("fanEngagementService predictions", () => {
  beforeEach(() => {
    clearMemoryStorage();
  });

  it("persists predictions and scores only finished matches", () => {
    savePredictionForMatch("m-exact", 2, 1);
    savePredictionForMatch("m-outcome", 3, 0);
    savePredictionForMatch("m-wrong", 0, 2);
    savePredictionForMatch("m-live", 1, 1);
    savePredictionForMatch("m-upcoming", 1, 0);

    expect(getPredictionForMatch("m-exact")).toMatchObject({
      matchId: "m-exact",
      homeScore: 2,
      awayScore: 1,
    });

    const matches: MatchData[] = [
      {
        id: "m-exact",
        branch: "Futbol",
        competition: "Süper Lig",
        homeTeam: "Fenerbahçe",
        awayTeam: "Rizespor",
        homeScore: "2",
        awayScore: "1",
        status: "finished",
        date: "",
        time: "",
        stadium: "",
      },
      {
        id: "m-outcome",
        branch: "Futbol",
        competition: "Süper Lig",
        homeTeam: "Fenerbahçe",
        awayTeam: "Kasımpaşa",
        homeScore: "2",
        awayScore: "0",
        status: "finished",
        date: "",
        time: "",
        stadium: "",
      },
      {
        id: "m-wrong",
        branch: "Futbol",
        competition: "Süper Lig",
        homeTeam: "Beşiktaş",
        awayTeam: "Fenerbahçe",
        homeScore: "1",
        awayScore: "0",
        status: "finished",
        date: "",
        time: "",
        stadium: "",
      },
      {
        id: "m-live",
        branch: "Futbol",
        competition: "Süper Lig",
        homeTeam: "Fenerbahçe",
        awayTeam: "Trabzonspor",
        homeScore: "1",
        awayScore: "1",
        status: "live",
        date: "",
        time: "",
        stadium: "",
      },
      {
        id: "m-upcoming",
        branch: "Futbol",
        competition: "Süper Lig",
        homeTeam: "Fenerbahçe",
        awayTeam: "Alanyaspor",
        homeScore: null,
        awayScore: null,
        status: "upcoming",
        date: "",
        time: "",
        stadium: "",
      },
    ];

    const stats = calculatePredictionStats(matches);
    expect(stats).toEqual({
      totalPredictions: 5,
      exactHits: 1,
      correctOutcomes: 1,
      totalPoints: 4,
    });
  });
});
