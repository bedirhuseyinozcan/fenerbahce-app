import { describe, expect, it } from "vitest";

import {
  diffEuroLeagueSnapshot,
  diffFootballSnapshot,
} from "../backend/matchDiff.mjs";

describe("backend/matchDiff", () => {
  it("emits kickoff, goal with scorer, VAR disallowed goal, red card, halftime, and fulltime for football", () => {
    const pre = {
      matchId: "1001",
      homeTeam: "Fenerbahçe",
      awayTeam: "Galatasaray",
      state: "pre",
      homeScore: 0,
      awayScore: 0,
      redCardIds: [],
    };

    const kick = { ...pre, state: "in", clock: "1'" };
    expect(diffFootballSnapshot(pre, kick)).toMatchObject([
      { eventKey: "1001-kickoff", type: "kickoff" },
    ]);

    const goal = {
      ...kick,
      homeScore: 1,
      clock: "23'",
      latestGoalScorer: "Kerem Aktürkoğlu",
    };
    const goalEvents = diffFootballSnapshot(kick, goal);
    expect(goalEvents).toHaveLength(1);
    expect(goalEvents[0]).toMatchObject({
      eventKey: "1001-goal-1-0",
      type: "goal",
      title: "GOOOL! Kerem Aktürkoğlu",
    });

    const varCancel = { ...goal, homeScore: 0, clock: "25'" };
    expect(diffFootballSnapshot(goal, varCancel)).toMatchObject([
      { eventKey: "1001-var-cancel-1-0-to-0-0", type: "var-disallowed" },
    ]);

    const red = { ...varCancel, clock: "40'", redCardIds: ["rc-9"] };
    expect(diffFootballSnapshot(varCancel, red)).toMatchObject([
      { eventKey: "1001-red-rc-9", type: "red-card" },
    ]);

    // Same red card should not emit again
    expect(diffFootballSnapshot(red, { ...red, clock: "41'" })).toEqual([]);

    const ht = { ...red, clock: "45'", shortDetail: "HT" };
    expect(diffFootballSnapshot(red, ht)).toMatchObject([
      { eventKey: "1001-ht", type: "halftime" },
    ]);

    const ft = { ...ht, state: "post", homeScore: 2, awayScore: 0 };
    expect(diffFootballSnapshot(ht, ft)).toMatchObject([
      { eventKey: "1001-ft", type: "fulltime" },
    ]);
  });

  it("emits tipoff, quarter-end, and fulltime for EuroLeague games", () => {
    const pre = {
      matchId: "el-42",
      homeTeam: "Fenerbahçe Beko",
      awayTeam: "Olympiacos",
      state: "pre",
      homeScore: 0,
      awayScore: 0,
      completedQuarters: 0,
    };

    const tip = { ...pre, state: "in" };
    expect(diffEuroLeagueSnapshot(pre, tip)).toMatchObject([
      { eventKey: "el-42-tipoff", type: "kickoff" },
    ]);

    const q1 = {
      ...tip,
      homeScore: 24,
      awayScore: 18,
      completedQuarters: 1,
      lastQuarterScore: "1.Ç: 24-18",
    };
    expect(diffEuroLeagueSnapshot(tip, q1)).toMatchObject([
      {
        eventKey: "el-42-q1",
        type: "quarter-end",
        title: "1. Çeyrek Sonucu",
      },
    ]);

    const ft = { ...q1, state: "post", homeScore: 86, awayScore: 79 };
    expect(diffEuroLeagueSnapshot(q1, ft)).toMatchObject([
      { eventKey: "el-42-ft", type: "fulltime" },
    ]);
  });
});
