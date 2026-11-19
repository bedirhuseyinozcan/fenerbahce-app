import { describe, expect, it, vi } from "vitest";

vi.mock("react-native", () => ({
  Platform: { OS: "ios" },
  Linking: { openURL: vi.fn() },
}));

import {
  getEuroLeagueSeasonCode,
  isHomeIstanbulMatch,
  isSameIstanbulCalendarDay,
  resolveMatchStatus,
} from "@/services/fixtureService";

describe("resolveMatchStatus", () => {
  it("keeps live matches as 'live' even when scores are present", () => {
    expect(
      resolveMatchStatus({ status: "live", homeScore: "1", awayScore: "0" }),
    ).toBe("live");
  });

  it("returns 'upcoming' when no scores exist and status is upcoming", () => {
    expect(
      resolveMatchStatus({
        status: "upcoming",
        homeScore: null,
        awayScore: null,
      }),
    ).toBe("upcoming");
  });

  it("infers 'finished' when both scores exist and status is omitted", () => {
    expect(
      resolveMatchStatus({ status: undefined, homeScore: "3", awayScore: "1" }),
    ).toBe("finished");
  });
});

describe("getEuroLeagueSeasonCode", () => {
  it("uses previous year before August", () => {
    expect(getEuroLeagueSeasonCode(new Date("2026-03-15T12:00:00Z"))).toBe(
      "E2025",
    );
  });

  it("uses current year from August onwards", () => {
    expect(getEuroLeagueSeasonCode(new Date("2026-10-10T12:00:00Z"))).toBe(
      "E2026",
    );
  });
});

describe("isSameIstanbulCalendarDay", () => {
  it("evaluates day boundaries in Europe/Istanbul (+03:00)", () => {
    const matchUtc = "2026-11-18T22:30:00Z"; // 2026-11-19 01:30 Istanbul
    const istanbulDay = new Date("2026-11-19T08:00:00Z"); // 2026-11-19 11:00 Istanbul
    const prevDay = new Date("2026-11-18T12:00:00Z"); // 2026-11-18 15:00 Istanbul

    expect(isSameIstanbulCalendarDay(matchUtc, istanbulDay)).toBe(true);
    expect(isSameIstanbulCalendarDay(matchUtc, prevDay)).toBe(false);
  });
});

describe("isHomeIstanbulMatch", () => {
  it("returns true for Fenerbahçe home matches or Istanbul venues", () => {
    expect(
      isHomeIstanbulMatch({
        id: "1",
        branch: "Futbol",
        competition: "Süper Lig",
        homeTeam: "Fenerbahçe",
        awayTeam: "Galatasaray",
        date: "",
        time: "",
        stadium: "Ülker Stadyumu",
      }),
    ).toBe(true);

    expect(
      isHomeIstanbulMatch({
        id: "2",
        branch: "Basketbol",
        competition: "EuroLeague",
        homeTeam: "FC Barcelona",
        awayTeam: "Fenerbahçe Beko",
        date: "",
        time: "",
        stadium: "Palau Blaugrana",
      }),
    ).toBe(false);
  });
});
