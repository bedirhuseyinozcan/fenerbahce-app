import { MatchData, MatchStat } from "@/types";

export interface TvfLeagueSpec {
  slug: "sultanlar-ligi" | "efeler-ligi";
  competitionLabel: string;
}

export const TVF_VOLLEYBALL_LEAGUES: TvfLeagueSpec[] = [
  { slug: "sultanlar-ligi", competitionLabel: "Vodafone Sultanlar Ligi" },
  { slug: "efeler-ligi", competitionLabel: "SMS Grup Efeler Ligi" },
];

export interface TvfParsedVolleyballEntry {
  match: MatchData;
  setScores: string[];
  setStats: MatchStat[];
}

const UPPERCASE_ACRONYMS = new Set(["TVF", "THY", "SK"]);
const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;
const ISTANBUL_OFFSET_MS = 3 * 60 * 60 * 1000;

function decodeHtmlAttrEntities(raw: string): string {
  return raw
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#039;|&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function formatIstanbulDateTr(dateObj: Date): string {
  if (isNaN(dateObj.getTime())) return "";
  try {
    return dateObj.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "long",
      timeZone: "Europe/Istanbul",
    });
  } catch {
    const ist = new Date(dateObj.getTime() + ISTANBUL_OFFSET_MS);
    try {
      return ist.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        weekday: "long",
        timeZone: "UTC",
      });
    } catch {
      const months = [
        "Ocak",
        "Şubat",
        "Mart",
        "Nisan",
        "Mayıs",
        "Haziran",
        "Temmuz",
        "Ağustos",
        "Eylül",
        "Ekim",
        "Kasım",
        "Aralık",
      ];
      const days = [
        "Pazar",
        "Pazartesi",
        "Salı",
        "Çarşamba",
        "Perşembe",
        "Cuma",
        "Cumartesi",
      ];
      return `${ist.getUTCDate()} ${months[ist.getUTCMonth()]} ${ist.getUTCFullYear()} ${days[ist.getUTCDay()]}`;
    }
  }
}

function formatIstanbulTimeTr(dateObj: Date): string {
  if (isNaN(dateObj.getTime())) return "18:00";
  try {
    const formatted = dateObj.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone: "Europe/Istanbul",
    });
    return formatted.replace(/^24:/, "00:");
  } catch {
    const ist = new Date(dateObj.getTime() + ISTANBUL_OFFSET_MS);
    const hh = String(ist.getUTCHours()).padStart(2, "0");
    const mm = String(ist.getUTCMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }
}

function slugPart(val: unknown, fallback: string): string {
  const cleaned = String(val ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || fallback;
}

export function unwrapLivewireValue(value: unknown): unknown {
  if (
    Array.isArray(value) &&
    value.length === 2 &&
    value[1] !== null &&
    typeof value[1] === "object" &&
    !Array.isArray(value[1]) &&
    (value[1] as { s?: unknown }).s === "arr"
  ) {
    return unwrapLivewireValue(value[0]);
  }

  if (Array.isArray(value)) {
    return value.map(unwrapLivewireValue);
  }

  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = unwrapLivewireValue(v);
    }
    return out;
  }

  return value;
}

export function parseTvfDateTimeToUtcIso(
  tarih?: string,
  saat?: string,
): string | undefined {
  const dateMatch = String(tarih || "")
    .trim()
    .match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!dateMatch) return undefined;

  const day = parseInt(dateMatch[1], 10);
  const month = parseInt(dateMatch[2], 10);
  const year = parseInt(dateMatch[3], 10);
  if (month < 1 || month > 12 || day < 1 || day > 31) return undefined;

  const rawTime = String(saat || "").trim() || "18:00";
  const timeMatch = rawTime.match(/^(\d{1,2}):(\d{2})/);
  const hour = timeMatch ? parseInt(timeMatch[1], 10) : 18;
  const minute = timeMatch ? parseInt(timeMatch[2], 10) : 0;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return undefined;

  const utcMs = Date.UTC(year, month - 1, day, hour, minute, 0) - ISTANBUL_OFFSET_MS;
  const d = new Date(utcMs);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

export function formatTvfNameTr(raw: string): string {
  const trimmed = String(raw || "").trim().replace(/\s+/g, " ");
  if (!trimmed) return "";

  if (trimmed.toLocaleLowerCase("tr-TR").includes("fenerbah")) {
    return "Fenerbahçe Medicana";
  }

  return trimmed
    .split(" ")
    .map((word) => {
      const upper = word.toLocaleUpperCase("tr-TR");
      if (UPPERCASE_ACRONYMS.has(upper)) {
        return upper;
      }
      const lower = word.toLocaleLowerCase("tr-TR");
      return lower.replace(/^([^a-zçğıöşü]*)([a-zçğıöşü])/i, (_m, lead, ch) => {
        return `${lead}${ch.toLocaleUpperCase("tr-TR")}`;
      });
    })
    .join(" ");
}

function isFenerbahceName(name: string): boolean {
  return name.toLocaleLowerCase("tr-TR").includes("fenerbah");
}

function collectFixtureRows(rawFixture: unknown): any[] {
  const unwrapped = unwrapLivewireValue(rawFixture);
  if (Array.isArray(unwrapped)) {
    return unwrapped.filter((item) => item && typeof item === "object");
  }
  if (unwrapped && typeof unwrapped === "object") {
    const rows: any[] = [];
    for (const val of Object.values(unwrapped)) {
      if (Array.isArray(val)) {
        for (const item of val) {
          if (item && typeof item === "object") rows.push(item);
        }
      }
    }
    return rows;
  }
  return [];
}

export function parseTvfLeagueFixtureHtml(
  html: string,
  competitionLabel: string,
  nowMs: number = Date.now(),
): TvfParsedVolleyballEntry[] {
  if (!html) return [];

  let fixtureRows: any[] = [];
  const snapshotRegex = /wire:snapshot="([^"]+)"/g;
  let matchExec: RegExpExecArray | null;

  while ((matchExec = snapshotRegex.exec(html)) !== null) {
    try {
      const decoded = decodeHtmlAttrEntities(matchExec[1]);
      const snap = JSON.parse(decoded);
      if (snap?.data?.leagueFixture !== undefined) {
        const rows = collectFixtureRows(snap.data.leagueFixture);
        if (rows.length > 0) {
          fixtureRows = rows;
          break;
        }
      }
    } catch {
      // ignore malformed snapshot and inspect next
    }
  }

  if (fixtureRows.length === 0) return [];

  const entries: TvfParsedVolleyballEntry[] = [];
  const seenIds = new Set<string>();

  for (let idx = 0; idx < fixtureRows.length; idx++) {
    const item = fixtureRows[idx];
    const rawHome = String(item.ATAKIMI || "").trim();
    const rawAway = String(item.BTAKIMI || "").trim();
    if (!rawHome || !rawAway) continue;

    const isFBHome = isFenerbahceName(rawHome);
    const isFBAway = isFenerbahceName(rawAway);
    if (!isFBHome && !isFBAway) continue;

    const homeSetStr = String(item.SETA ?? "").trim();
    const awaySetStr = String(item.SETB ?? "").trim();
    const hasScores = /^\d+$/.test(homeSetStr) && /^\d+$/.test(awaySetStr);

    const rawDate = parseTvfDateTimeToUtcIso(item.TARIH, item.SAAT);
    const startMs = rawDate ? Date.parse(rawDate) : NaN;

    // Geçmişte skorsuz kalmış / ertelenmiş maçları "upcoming" diye göstermemek için atla
    if (!hasScores && !isNaN(startMs) && startMs < nowMs - FOUR_HOURS_MS) {
      continue;
    }

    const dateObj = rawDate ? new Date(rawDate) : new Date(NaN);
    const dateStr = formatIstanbulDateTr(dateObj);
    const timeStr = rawDate
      ? formatIstanbulTimeTr(dateObj)
      : String(item.SAAT || "").trim().slice(0, 5) || "18:00";

    const id = `tvf-${slugPart(item.KUMEID, "lig")}-${slugPart(item.SEZON, "sezon")}-${slugPart(item.DEVRE, "1")}-${slugPart(item.MACNO ?? item.MACADET ?? idx, String(idx))}`;
    if (seenIds.has(id)) continue;
    seenIds.add(id);

    const isPostponed =
      !hasScores && String(item.MACDURUMU || "").toUpperCase() === "E";
    const hafta = String(item.HAFTA || "").trim();
    const round = hafta
      ? `${hafta}. Hafta${isPostponed ? " (Ertelendi)" : ""}`
      : isPostponed
        ? "Ertelendi"
        : "Lig Maçı";

    const stadiumRaw = String(item.YER || "").trim();
    const stadium = stadiumRaw
      ? formatTvfNameTr(stadiumRaw)
      : "TVF Burhan Felek Vestel Voleybol Salonu";

    const setScores: string[] = [];
    const setStats: MatchStat[] = [];
    if (hasScores) {
      for (let s = 1; s <= 5; s++) {
        const aRaw = String(item[`SETA${s}`] ?? "").trim();
        const bRaw = String(item[`SETB${s}`] ?? "").trim();
        if (!/^\d+$/.test(aRaw) || !/^\d+$/.test(bRaw)) continue;
        const a = parseInt(aRaw, 10);
        const b = parseInt(bRaw, 10);
        if (a <= 0 && b <= 0) continue;
        const total = a + b;
        setScores.push(`${s}.S: ${a}-${b}`);
        setStats.push({
          label: `${s}. Set Skoru`,
          homeValue: String(a),
          awayValue: String(b),
          homePercentage: total > 0 ? Math.round((a / total) * 100) : 50,
        });
      }

      const aPtsRaw = String(item.ASAYI ?? "").trim();
      const bPtsRaw = String(item.BSAYI ?? "").trim();
      if (/^\d+$/.test(aPtsRaw) && /^\d+$/.test(bPtsRaw)) {
        const aPts = parseInt(aPtsRaw, 10);
        const bPts = parseInt(bPtsRaw, 10);
        if (aPts > 0 && bPts > 0) {
          const totalPts = aPts + bPts;
          setStats.push({
            label: "Toplam Sayı",
            homeValue: String(aPts),
            awayValue: String(bPts),
            homePercentage: Math.round((aPts / totalPts) * 100),
          });
        }
      }
    }

    entries.push({
      match: {
        id,
        branch: "Voleybol",
        competition: competitionLabel,
        round,
        homeTeam: isFBHome ? "Fenerbahçe Medicana" : formatTvfNameTr(rawHome),
        homeLogo: isFBHome
          ? "fener.png"
          : String(item.ALOGONAME || "").trim() || undefined,
        homeScore: hasScores ? homeSetStr : null,
        awayTeam: isFBAway ? "Fenerbahçe Medicana" : formatTvfNameTr(rawAway),
        awayLogo: isFBAway
          ? "fener.png"
          : String(item.BLOGONAME || "").trim() || undefined,
        awayScore: hasScores ? awaySetStr : null,
        date: dateStr,
        time: timeStr,
        stadium,
        rawDate,
        status: hasScores ? "finished" : "upcoming",
      },
      setScores,
      setStats,
    });
  }

  return entries;
}
