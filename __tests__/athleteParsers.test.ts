import { describe, expect, it } from "vitest";
import {
  attachEuroLeagueStats,
  formatPersonName,
  parseEspnFootballRoster,
  parseEuroLeagueClubPeople,
} from "@/features/squads/parsers/athleteParsers";

describe("athleteParsers", () => {
  it("parses ESPN football roster with optional stats without fabricating missing values", () => {
    const athletes = parseEspnFootballRoster({
      athletes: [
        {
          id: "99",
          jersey: "10",
          displayName: "Dusan Tadic",
          position: { displayName: "Attacking Midfielder" },
          citizenship: "Sırbistan",
          age: 35,
          displayHeight: "1.81 m",
          headshot: { href: "https://example.com/tadic.png" },
          statistics: {
            splits: {
              categories: [
                {
                  stats: [
                    { name: "appearances", value: 14 },
                    { name: "totalGoals", value: 6 },
                    { name: "goalAssists", value: 7 },
                  ],
                },
              ],
            },
          },
        },
        {
          id: "1",
          jersey: "1",
          displayName: "Dominik Livakovic",
          position: { displayName: "Goalkeeper" },
          citizenship: "Hırvatistan",
        },
      ],
    });

    expect(athletes).toHaveLength(2);
    expect(athletes[0].position).toBe("On Numara");
    expect(athletes[0].source).toBe("espn");
    expect(athletes[0].age).toBe(35);
    expect(athletes[0].stats).toEqual({
      appearances: 14,
      goals: 6,
      assists: 7,
      yellowCards: undefined,
      redCards: undefined,
      minutesPlayed: undefined,
      sourceLabel: "ESPN",
    });

    expect(athletes[1].category).toBe("Kaleci");
    expect(athletes[1].stats).toBeUndefined();
  });

  it("parses EuroLeague v2 club people, filters out coaches/inactive, and attaches v3 stats", () => {
    expect(formatPersonName("BIBEROVIC, TARIK")).toBe("Tarik Biberovic");

    const parsed = parseEuroLeagueClubPeople({
      data: [
        {
          typeName: "Coach",
          active: true,
          person: { code: "COACH1", name: "JASIKEVICIUS, SARUNAS" },
        },
        {
          typeName: "Player",
          active: false,
          positionName: "Guard",
          dorsal: "99",
          person: { code: "INACT1", name: "OLD, PLAYER" },
        },
        {
          typeName: "Player",
          active: true,
          positionName: "Forward",
          dorsal: "13",
          person: {
            code: "P010203",
            name: "BIBEROVIC, TARIK",
            height: 201,
            country: { name: "Turkey" },
          },
          images: { action: "https://example.com/tarik.png" },
        },
        {
          typeName: "Player",
          active: true,
          positionName: "Guard",
          dorsal: "2",
          person: {
            code: "P020304",
            name: "BALDWIN IV, WADE",
            height: 193,
            country: { name: "USA" },
          },
        },
      ],
    });

    expect(parsed).toHaveLength(2);
    expect(parsed[0].name).toBe("Wade Baldwin Iv");
    expect(parsed[0].category).toBe("Gard");
    expect(parsed[0].number).toBe(2);

    expect(parsed[1].name).toBe("Tarik Biberovic");
    expect(parsed[1].category).toBe("Forvet/Pivot");
    expect(parsed[1].height).toBe("201 cm");
    expect(parsed[1].source).toBe("euroleague");

    const enriched = attachEuroLeagueStats(parsed, {
      players: [
        {
          player: { code: "P010203", name: "BIBEROVIC, TARIK" },
          gamesPlayed: 12,
          pointsScored: 11.44,
          totalRebounds: 3.16,
          assists: 1.5,
          valuation: 10.82,
        },
      ],
    });

    expect(enriched[1].stats).toEqual({
      appearances: 12,
      pointsPerGame: 11.4,
      reboundsPerGame: 3.2,
      assistsPerGame: 1.5,
      pir: 10.8,
      sourceLabel: "EuroLeague",
    });
    expect(enriched[0].stats).toBeUndefined();
  });
});
