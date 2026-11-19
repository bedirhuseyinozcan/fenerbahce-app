import { describe, expect, it } from "vitest";
import {
  formatTvfNameTr,
  parseTvfDateTimeToUtcIso,
  parseTvfLeagueFixtureHtml,
} from "@/features/matches/parsers/tvfVolleyball";

function buildTvfSnapshotHtml(leagueFixture: unknown): string {
  const snapshotJson = JSON.stringify({
    data: {
      slug: "sultanlar-ligi",
      activeTab: "fikstur",
      leagueFixture: [leagueFixture, { s: "arr" }],
    },
    memo: { name: "league-detail" },
  });
  const encoded = snapshotJson.replace(/"/g, "&quot;").replace(/&/g, "&amp;");
  // Note: replace & before " or carefully encode in one pass:
  const safeEncoded = snapshotJson
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;");
  void encoded;
  return `<!doctype html><html><body><div wire:snapshot="${safeEncoded}"></div></body></html>`;
}

describe("tvfVolleyball parser", () => {
  it("parses Sultanlar Ligi finished matches with set scores and total points from Livewire HTML", () => {
    const html = buildTvfSnapshotHtml({
      "1": [
        [
          {
            SEZON: "2026-2027",
            TARIH: "04.10.2026",
            SAAT: "13:00",
            MACDURUMU: "O",
            YER: "TVF BURHAN FELEK VESTEL VOLEYBOL SALONU",
            KUMEID: "SULTANLAR",
            DEVRE: "1",
            HAFTA: "1",
            MACNO: "3",
            ATAKIMI: "FENERBAHÇE MEDICANA",
            BTAKIMI: "MANİSA BÜYÜKŞEHİR BELEDİYE SPOR",
            SETA: "3",
            SETB: "0",
            ASAYI: "75",
            BSAYI: "43",
            SETA1: "25",
            SETB1: "12",
            SETA2: "25",
            SETB2: "17",
            SETA3: "25",
            SETB3: "14",
            SETA4: "",
            SETB4: "",
            SETA5: "",
            SETB5: "",
            ALOGONAME: "https://tvfportal.com/TakimLogo/7682957.png",
            BLOGONAME: "https://tvfportal.com/TakimLogo/7682958.png",
          },
          { s: "arr" },
        ],
      ],
    });

    const entries = parseTvfLeagueFixtureHtml(
      html,
      "Vodafone Sultanlar Ligi",
      Date.parse("2026-11-19T12:00:00Z"),
    );

    expect(entries).toHaveLength(1);
    const { match, setScores, setStats } = entries[0];
    expect(match.id).toBe("tvf-sultanlar-2026-2027-1-3");
    expect(match.branch).toBe("Voleybol");
    expect(match.competition).toBe("Vodafone Sultanlar Ligi");
    expect(match.round).toBe("1. Hafta");
    expect(match.homeTeam).toBe("Fenerbahçe Medicana");
    expect(match.homeLogo).toBe("fener.png");
    expect(match.awayTeam).toBe("Manisa Büyükşehir Belediye Spor");
    expect(match.awayLogo).toBe("https://tvfportal.com/TakimLogo/7682958.png");
    expect(match.homeScore).toBe("3");
    expect(match.awayScore).toBe("0");
    expect(match.time).toBe("13:00");
    expect(match.rawDate).toBe("2026-10-04T10:00:00.000Z");
    expect(match.status).toBe("finished");

    expect(setScores).toEqual(["1.S: 25-12", "2.S: 25-17", "3.S: 25-14"]);
    expect(setStats).toHaveLength(4);
    expect(setStats[0]).toMatchObject({
      label: "1. Set Skoru",
      homeValue: "25",
      awayValue: "12",
    });
    expect(setStats[3]).toMatchObject({
      label: "Toplam Sayı",
      homeValue: "75",
      awayValue: "43",
    });
  });

  it("parses Efeler Ligi upcoming match with TSİ to UTC conversion", () => {
    const html = buildTvfSnapshotHtml({
      "7": [
        [
          {
            SEZON: "2026-2027",
            TARIH: "21.11.2026",
            SAAT: "19:00",
            MACDURUMU: "O",
            YER: "TVF BURHAN FELEK VESTEL VOLEYBOL SALONU",
            KUMEID: "EFELER",
            DEVRE: "1",
            HAFTA: "7",
            MACNO: "44",
            ATAKIMI: "FENERBAHÇE MEDICANA",
            BTAKIMI: "SPOR TOTO",
            SETA: "",
            SETB: "",
            ALOGONAME: "https://tvfportal.com/TakimLogo/7692976.png",
            BLOGONAME: "https://tvfportal.com/TakimLogo/7692980.png",
          },
          { s: "arr" },
        ],
      ],
    });

    const entries = parseTvfLeagueFixtureHtml(
      html,
      "SMS Grup Efeler Ligi",
      Date.parse("2026-11-19T12:00:00Z"),
    );

    expect(entries).toHaveLength(1);
    const { match, setScores, setStats } = entries[0];
    expect(match.status).toBe("upcoming");
    expect(match.homeScore).toBeNull();
    expect(match.awayScore).toBeNull();
    expect(match.time).toBe("19:00");
    expect(match.rawDate).toBe("2026-11-21T16:00:00.000Z");
    expect(match.stadium).toBe("TVF Burhan Felek Vestel Voleybol Salonu");
    expect(setScores).toEqual([]);
    expect(setStats).toEqual([]);
  });

  it("skips past unscored postponed matches while keeping future postponed ones labeled", () => {
    const html = buildTvfSnapshotHtml({
      "3": [
        [
          {
            SEZON: "2026-2027",
            TARIH: "14.10.2026",
            SAAT: "19:00",
            MACDURUMU: "E",
            KUMEID: "SULTANLAR",
            DEVRE: "1",
            HAFTA: "3",
            MACNO: "18",
            ATAKIMI: "FENERBAHÇE MEDICANA",
            BTAKIMI: "GÖZTEPE YUPPO",
            SETA: "",
            SETB: "",
          },
          { s: "arr" },
        ],
      ],
      "10": [
        [
          {
            SEZON: "2026-2027",
            TARIH: "21.11.2026",
            SAAT: "15:00",
            MACDURUMU: "E",
            KUMEID: "SULTANLAR",
            DEVRE: "1",
            HAFTA: "10",
            MACNO: "66",
            ATAKIMI: "ARAS KARGO",
            BTAKIMI: "FENERBAHÇE MEDICANA",
            SETA: "",
            SETB: "",
          },
          { s: "arr" },
        ],
      ],
    });

    const entries = parseTvfLeagueFixtureHtml(
      html,
      "Vodafone Sultanlar Ligi",
      Date.parse("2026-11-19T12:00:00Z"),
    );

    expect(entries).toHaveLength(1);
    expect(entries[0].match.id).toBe("tvf-sultanlar-2026-2027-1-66");
    expect(entries[0].match.round).toBe("10. Hafta (Ertelendi)");
    expect(entries[0].match.status).toBe("upcoming");
  });

  it("filters out non-Fenerbahçe matches and formats Turkish names and TSİ dates accurately", () => {
    expect(parseTvfDateTimeToUtcIso("21.11.2026", "19:00")).toBe(
      "2026-11-21T16:00:00.000Z",
    );
    expect(formatTvfNameTr("TVF BURHAN FELEK VESTEL VOLEYBOL SALONU")).toBe(
      "TVF Burhan Felek Vestel Voleybol Salonu",
    );

    const html = buildTvfSnapshotHtml({
      "1": [
        [
          {
            SEZON: "2026-2027",
            TARIH: "03.10.2026",
            SAAT: "16:00",
            MACDURUMU: "O",
            KUMEID: "SULTANLAR",
            DEVRE: "1",
            HAFTA: "1",
            MACNO: "1",
            ATAKIMI: "NİLÜFER BELEDİYESPOR EKER",
            BTAKIMI: "ECZACIBAŞI PERON İSTANBUL",
            SETA: "2",
            SETB: "3",
          },
          { s: "arr" },
        ],
      ],
    });

    expect(parseTvfLeagueFixtureHtml(html, "Vodafone Sultanlar Ligi")).toEqual(
      [],
    );
  });
});
