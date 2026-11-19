import { describe, expect, it, vi } from "vitest";

vi.mock("react-native", () => ({
  Platform: { OS: "ios" },
  Linking: { openURL: vi.fn() },
}));

import {
  formatIstanbulDate,
  formatIstanbulTime,
  getEuroLeagueSeasonCode,
  isHomeIstanbulMatch,
  isSameIstanbulCalendarDay,
  resolveEuroLeagueUtcDate,
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

describe("resolveEuroLeagueUtcDate and Istanbul formatting", () => {
  it("converts today's Milan vs Fenerbahçe EuroLeague game (20:30 CET) to 22:30 TSİ via utcDate", () => {
    const iso = resolveEuroLeagueUtcDate({
      date: "2026-11-19T20:30:00",
      utcDate: "2026-11-19T19:30:00Z",
      localDate: "2026-11-19T20:30:00",
      localTimeZone: 1,
    });
    expect(iso).toBe("2026-11-19T19:30:00Z");
    expect(formatIstanbulTime(new Date(iso!))).toBe("22:30");
  });

  it("formats CEST Istanbul home game (17:45 UTC) as 20:45 TSİ", () => {
    const iso = resolveEuroLeagueUtcDate({
      date: "2027-04-06T19:45:00",
      utcDate: "2027-04-06T17:45:00Z",
      localDate: "2027-04-06T20:45:00",
      localTimeZone: 3,
    });
    expect(iso).toBe("2027-04-06T17:45:00Z");
    expect(formatIstanbulTime(new Date(iso!))).toBe("20:45");
  });

  it("falls back to localDate and localTimeZone when utcDate is absent", () => {
    const iso = resolveEuroLeagueUtcDate({
      localDate: "2026-11-19T20:30:00",
      localTimeZone: 1,
    });
    expect(iso).toBe("2026-11-19T19:30:00.000Z");
    expect(formatIstanbulTime(new Date(iso!))).toBe("22:30");
  });

  it("falls back to Europe/Madrid offset for naive date strings in CET and CEST", () => {
    const winterIso = resolveEuroLeagueUtcDate({
      date: "2026-11-19T20:30:00",
    });
    expect(winterIso).toBe("2026-11-19T19:30:00.000Z");
    expect(formatIstanbulTime(new Date(winterIso!))).toBe("22:30");

    const summerIso = resolveEuroLeagueUtcDate({
      date: "2027-04-15T19:00:00",
    });
    expect(summerIso).toBe("2027-04-15T17:00:00.000Z");
    expect(formatIstanbulTime(new Date(summerIso!))).toBe("20:00");
  });

  it("handles midnight crossover in Europe/Istanbul without returning 24:xx", () => {
    const d = new Date("2026-11-19T21:30:00Z");
    expect(formatIstanbulTime(d)).toBe("00:30");
    expect(formatIstanbulDate(d)).toContain("20 Kasım 2026");
  });
});
