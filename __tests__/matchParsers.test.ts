import { describe, expect, it } from "vitest";

import {
  parseAndTranslateEspnEvent,
  parseEspnCommentary,
} from "@/features/matches/parsers/espnEvents";
import { computeMatchMomentum } from "@/features/matches/parsers/momentum";
import { resolveLineupCollisions } from "@/features/matches/parsers/pitchLayout";
import { Player } from "@/types";

const homeComp = { id: "436", team: { displayName: "Fenerbahçe" } };
const awayComp = { id: "999", team: { displayName: "Galatasaray" } };

describe("parseAndTranslateEspnEvent", () => {
  it("parses goal with assister and shot description", () => {
    const res = parseAndTranslateEspnEvent(
      {
        type: { text: "Goal" },
        team: { id: "436" },
        text: "Goal! Fenerbahçe 2, Galatasaray 0. Kerem Aktürkoğlu (Fenerbahçe) left footed shot from the centre of the box. Assisted by Marco Asensio.",
      },
      homeComp,
      awayComp,
    );

    expect(res).toEqual({
      type: "goal",
      team: "home",
      player: "Kerem Aktürkoğlu",
      assister: "Marco Asensio",
      detail: "Gol! (Sol Ayakla Şut, Ceza Sahası İçi) • Asist: Marco Asensio",
    });
  });

  it("parses penalty goal, own goal, yellow/red card, injury sub, and VAR no-goal", () => {
    expect(
      parseAndTranslateEspnEvent(
        {
          type: { text: "Penalty - Scored" },
          team: { id: "436" },
          text: "Goal! Fenerbahçe 1, Galatasaray 0. Marco Asensio (Fenerbahçe) converts the penalty.",
        },
        homeComp,
        awayComp,
      ),
    ).toMatchObject({
      type: "goal",
      team: "home",
      player: "Marco Asensio",
      detail: "Penaltı Golü! ⚽",
    });

    expect(
      parseAndTranslateEspnEvent(
        {
          type: { text: "Own Goal" },
          team: { id: "436" },
          text: "Own Goal by Rakip Stoper, Galatasaray.",
        },
        homeComp,
        awayComp,
      ),
    ).toMatchObject({
      type: "goal",
      detail: "Kendi Kalesine Gol",
    });

    expect(
      parseAndTranslateEspnEvent(
        {
          type: { text: "Yellow Card" },
          team: { id: "999" },
          text: "Player X (Galatasaray) is shown the yellow card for bad foul.",
        },
        homeComp,
        awayComp,
      ),
    ).toMatchObject({
      type: "yellow-card",
      team: "away",
      player: "Player X",
      detail: "Sarı Kart (Sert faul)",
    });

    expect(
      parseAndTranslateEspnEvent(
        {
          type: { text: "Red Card" },
          team: { id: "999" },
          text: "Player Y (Galatasaray) is shown the red card.",
        },
        homeComp,
        awayComp,
      ),
    ).toMatchObject({
      type: "red-card",
      team: "away",
      player: "Player Y",
      detail: "Kırmızı Kart!",
    });

    expect(
      parseAndTranslateEspnEvent(
        {
          type: { text: "Substitution" },
          team: { id: "436" },
          text: "Substitution, Fenerbahçe. İsmail Yüksek replaces Mert Hakan because of an injury.",
        },
        homeComp,
        awayComp,
      ),
    ).toMatchObject({
      type: "substitution",
      team: "home",
      player: "İsmail Yüksek",
      detail: "Oyuna Girdi (Çıkan: Mert Hakan) [Sakatlık]",
    });

    expect(
      parseAndTranslateEspnEvent(
        {
          type: { text: "VAR" },
          team: { id: "999" },
          text: "VAR Decision: No Goal Galatasaray.",
        },
        homeComp,
        awayComp,
      ),
    ).toMatchObject({
      type: "var",
      team: "away",
      detail: "Gol İptal Edildi",
    });
  });
});

describe("parseEspnCommentary", () => {
  it("translates commentary to Turkish, classifies importance, and handles empty input", () => {
    expect(parseEspnCommentary(undefined, homeComp, awayComp)).toEqual([]);

    const list = parseEspnCommentary(
      [
        {
          id: "c1",
          time: { displayValue: "1'" },
          text: "First Half begins.",
        },
        {
          id: "c2",
          time: { displayValue: "22'" },
          team: { id: "999" },
          text: "Player X is shown the yellow card for time wasting.",
        },
        {
          id: "c3",
          time: { displayValue: "45'+1'" },
          team: { id: "436" },
          text: "Attempt missed. Kerem Aktürkoğlu right footed shot from outside the box.",
        },
        {
          id: "c4",
          time: { displayValue: "67'" },
          team: { id: "436" },
          play: { scoringPlay: true },
          text: "Goal! Fenerbahçe 1, Galatasaray 0.",
        },
      ],
      homeComp,
      awayComp,
    );

    expect(list).toHaveLength(4);
    expect(list[0]).toMatchObject({
      id: "c4",
      minute: 67,
      importance: "goal",
      team: "home",
    });
    expect(list[0].text).toContain("GOOOL!");
    expect(list[1].importance).toBe("chance");
    expect(list[1].text).toContain("Şut auta gitti:");
    expect(list[2].importance).toBe("card");
    expect(list[3]).toMatchObject({
      importance: "whistle",
      text: "İlk yarı başladı.",
    });
  });
});

describe("computeMatchMomentum", () => {
  it("returns null when both stats and events are empty", () => {
    expect(computeMatchMomentum([], [])).toBeNull();
  });

  it("computes normalized dominance summing to 100 from real stats & events", () => {
    const momentum = computeMatchMomentum(
      [
        {
          label: "Topla Oynama (%)",
          homeValue: "%65",
          awayValue: "%35",
          homePercentage: 65,
        },
        {
          label: "İsabetli Şut",
          homeValue: "7",
          awayValue: "1",
          homePercentage: 88,
        },
      ],
      [
        {
          id: "g1",
          minute: 30,
          type: "goal",
          team: "home",
          player: "Kerem",
        },
      ],
    );

    expect(momentum).not.toBeNull();
    expect(momentum!.homeScore + momentum!.awayScore).toBe(100);
    expect(momentum!.homeScore).toBeGreaterThan(58);
    expect(momentum!.label).toBe("Ev Sahibi Baskın");
  });
});

describe("resolveLineupCollisions", () => {
  it("separates overlapping midfielders horizontally on the same row", () => {
    const players: Player[] = [
      {
        id: "1",
        number: 6,
        name: "Midfielder A",
        position: "OS",
        gridPosition: { x: 50, y: 46 },
      },
      {
        id: "2",
        number: 8,
        name: "Midfielder B",
        position: "OS",
        gridPosition: { x: 50, y: 46 },
      },
    ];

    const resolved = resolveLineupCollisions(players);
    expect(resolved[0].gridPosition.x).not.toBe(resolved[1].gridPosition.x);
  });
});
