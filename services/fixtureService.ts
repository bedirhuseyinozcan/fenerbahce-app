import { MatchData, MatchStatus } from "@/types";
import { safeFetch } from "@/utils/safeFetch";
import { getJson, setJson } from "@/utils/storage";

const FIXTURES_CACHE_TTL_MS = 60 * 1000;
const PERSISTENT_FIXTURES_KEY = "fb_persisted_live_fixtures_v6";
let cachedFixtures: MatchData[] | null = null;
let lastFetchTimestamp = 0;
let inFlightFixturesPromise: Promise<MatchData[]> | null = null;
const lastGoodByBranch = new Map<string, MatchData[]>();

function loadPersistedFixtures(): MatchData[] | null {
  const parsed = getJson<MatchData[]>(PERSISTENT_FIXTURES_KEY);
  return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
}

function savePersistedFixtures(list: MatchData[]): void {
  if (!Array.isArray(list) || list.length === 0) return;
  setJson(PERSISTENT_FIXTURES_KEY, list);
}

export function isSameIstanbulCalendarDay(
  rawDate?: string,
  now: Date = new Date(),
): boolean {
  if (!rawDate) return false;
  const target = new Date(rawDate);
  if (isNaN(target.getTime())) return false;

  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Istanbul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(target) === formatter.format(now);
  } catch {
    return (
      target.getFullYear() === now.getFullYear() &&
      target.getMonth() === now.getMonth() &&
      target.getDate() === now.getDate()
    );
  }
}

export function isHomeIstanbulMatch(
  match: MatchData | null | undefined,
): boolean {
  if (!match) return false;
  const home = (match.homeTeam || "").toLowerCase();
  const stadium = (match.stadium || "").toLowerCase();
  if (home.includes("fenerbah")) return true;
  return (
    stadium.includes("saracoğlu") ||
    stadium.includes("saracoglu") ||
    stadium.includes("ülker") ||
    stadium.includes("ulker") ||
    stadium.includes("burhan felek") ||
    stadium.includes("kadıköy") ||
    stadium.includes("kadikoy") ||
    stadium.includes("ataşehir") ||
    stadium.includes("atasehir")
  );
}

export function resolveMatchStatus(
  match: Pick<MatchData, "status" | "homeScore" | "awayScore">,
): MatchStatus {
  if (match.status === "live") return "live";
  if (match.status === "finished") return "finished";

  const hasHome =
    match.homeScore !== null &&
    match.homeScore !== undefined &&
    match.homeScore !== "";
  const hasAway =
    match.awayScore !== null &&
    match.awayScore !== undefined &&
    match.awayScore !== "";

  if (hasHome && hasAway) return "finished";
  return "upcoming";
}

export function getCachedFixturesSync(): MatchData[] | null {
  if (cachedFixtures && cachedFixtures.length > 0) return cachedFixtures;
  const persisted = loadPersistedFixtures();
  if (persisted && persisted.length > 0) {
    cachedFixtures = persisted;
    return persisted;
  }
  return null;
}

export function getCachedMatchByIdSync(matchId: string): MatchData | null {
  const list = getCachedFixturesSync();
  if (!list) return null;
  return list.find((m) => m.id === matchId) || null;
}

export function getEuroLeagueSeasonCode(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const seasonStartYear = month >= 8 ? year : year - 1;
  return `E${seasonStartYear}`;
}

export function formatIstanbulDate(dateObj: Date): string {
  try {
    return dateObj.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "long",
      timeZone: "Europe/Istanbul",
    });
  } catch {
    return dateObj.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "long",
    });
  }
}

export function formatIstanbulTime(dateObj: Date): string {
  try {
    return dateObj.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Istanbul",
    });
  } catch {
    return dateObj.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

const ESPN_FOOTBALL_COMPETITIONS: { slug: string; label: string }[] = [
  { slug: "tur.1", label: "Trendyol Süper Lig" },
  { slug: "uefa.champions", label: "UEFA Şampiyonlar Ligi" },
  { slug: "uefa.europa", label: "UEFA Avrupa Ligi" },
  { slug: "uefa.europa.conf", label: "UEFA Konferans Ligi" },
];

export const fetchFixtures = async (
  forceRefresh: boolean = false,
): Promise<MatchData[]> => {
  const nowMs = Date.now();
  if (
    !forceRefresh &&
    cachedFixtures &&
    cachedFixtures.length > 0 &&
    nowMs - lastFetchTimestamp < FIXTURES_CACHE_TTL_MS
  ) {
    return cachedFixtures;
  }

  if (inFlightFixturesPromise) {
    return inFlightFixturesPromise;
  }

  inFlightFixturesPromise = (async (): Promise<MatchData[]> => {
    try {
      const matchMap = new Map<string, MatchData>();

      // 1. FUTBOL: ESPN canlı + geçmiş + gelecek fikstür
      try {
        const requests: Promise<{
          res: Response | null;
          label: string;
          slug: string;
        }>[] = [];
        for (const comp of ESPN_FOOTBALL_COMPETITIONS) {
          const base = `https://site.api.espn.com/apis/site/v2/sports/soccer/${comp.slug}/teams/436/schedule`;
          requests.push(
            safeFetch(base).then((res) => ({
              res,
              label: comp.label,
              slug: comp.slug,
            })),
          );
          requests.push(
            safeFetch(`${base}?fixture=true`).then((res) => ({
              res,
              label: comp.label,
              slug: comp.slug,
            })),
          );
        }

        const responses = await Promise.all(requests);

        const parseEspnEvents = async (
          res: Response | null,
          compFallback: string,
          leagueSlug: string,
        ) => {
          if (!res || !res.ok) return;
          const data = await res.json();
          if (!Array.isArray(data.events)) return;

          data.events.forEach((event: any) => {
            const comp = event.competitions?.[0];
            if (!comp) return;

            const homeComp = comp.competitors?.find(
              (c: any) => c.homeAway === "home",
            );
            const awayComp = comp.competitors?.find(
              (c: any) => c.homeAway === "away",
            );
            if (!homeComp || !awayComp) return;

            const homeName = homeComp.team?.displayName || "Ev Sahibi";
            const awayName = awayComp.team?.displayName || "Deplasman";
            const isFBHome = homeName.toLowerCase().includes("fenerbah");
            const isFBAway = awayName.toLowerCase().includes("fenerbah");

            const state = comp.status?.type?.state;
            const isCompleted =
              comp.status?.type?.completed === true || state === "post";
            const isLive = state === "in";
            const hasScore = isCompleted || isLive;

            const status: MatchStatus = isLive
              ? "live"
              : isCompleted
                ? "finished"
                : "upcoming";

            const liveClock = isLive
              ? comp.status?.type?.shortDetail ||
                comp.status?.displayClock ||
                "CANLI"
              : undefined;

            const dateObj = new Date(comp.date);
            const dateStr = formatIstanbulDate(dateObj);
            const timeStr = formatIstanbulTime(dateObj);

            const compName = comp.notes?.[0]?.headline || compFallback;

            let roundStr = "";
            if (comp.round?.displayName) {
              const raw = comp.round.displayName;
              if (/matchday\s*(\d+)/i.test(raw)) {
                roundStr = raw.replace(/matchday\s*(\d+)/i, "$1. Hafta");
              } else if (/round\s*of\s*16/i.test(raw)) {
                roundStr = "Son 16 Turu";
              } else if (/quarter/i.test(raw)) {
                roundStr = "Çeyrek Final";
              } else if (/semi/i.test(raw)) {
                roundStr = "Yarı Final";
              } else if (/final/i.test(raw)) {
                roundStr = "Final";
              } else {
                roundStr = raw;
              }
            } else if (compFallback.includes("UEFA")) {
              roundStr = "Lig Aşaması";
            } else if (comp.notes?.[0]?.headline) {
              roundStr = "";
            } else {
              roundStr = "Lig Maçı";
            }

            const extractTeamScore = (c: any): string => {
              if (c?.score?.displayValue !== undefined) {
                return String(c.score.displayValue);
              }
              if (
                typeof c?.score === "number" ||
                typeof c?.score === "string"
              ) {
                return String(c.score);
              }
              return "0";
            };

            let homeLogoUrl = isFBHome
              ? "fener.png"
              : homeComp.team?.logo || homeComp.team?.logos?.[0]?.href;
            let awayLogoUrl = isFBAway
              ? "fener.png"
              : awayComp.team?.logo || awayComp.team?.logos?.[0]?.href;

            const matchId = String(event.id);
            matchMap.set(matchId, {
              id: matchId,
              branch: "Futbol",
              competition: compName,
              round: roundStr,
              homeTeam: isFBHome ? "Fenerbahçe" : homeName,
              homeLogo: homeLogoUrl,
              homeScore: hasScore ? extractTeamScore(homeComp) : null,
              awayTeam: isFBAway ? "Fenerbahçe" : awayName,
              awayLogo: awayLogoUrl,
              awayScore: hasScore ? extractTeamScore(awayComp) : null,
              date: dateStr,
              time: timeStr !== "Invalid Date" ? timeStr : "20:00",
              stadium:
                comp.venue?.fullName ||
                (isFBHome
                  ? "Ülker Stadyumu Şükrü Saracoğlu Spor Kompleksi"
                  : `${homeName} Stadyumu`),
              rawDate: comp.date,
              status,
              liveClock,
              leagueSlug,
            });
          });
        };

        await Promise.all(
          responses.map((item) =>
            parseEspnEvents(item.res, item.label, item.slug),
          ),
        );
      } catch (err) {
        console.warn("ESPN futbol maç takvimi çekilemedi:", err);
      }

      // 2. BASKETBOL: EuroLeague v2 Live API (dinamik sezon kodu)
      try {
        const seasonCode = getEuroLeagueSeasonCode();
        const euroRes = await safeFetch(
          `https://api-live.euroleague.net/v2/competitions/E/seasons/${seasonCode}/games`,
        );
        if (euroRes && euroRes.ok) {
          const euroData = await euroRes.json();
          if (Array.isArray(euroData.data)) {
            const fbGames = euroData.data.filter(
              (g: any) =>
                g.local?.club?.code === "ULK" || g.road?.club?.code === "ULK",
            );

            fbGames.forEach((g: any) => {
              const isFBLocal = g.local?.club?.code === "ULK";
              const isFBRoad = g.road?.club?.code === "ULK";
              const dateObj = new Date(g.date);

              const dateStr = formatIstanbulDate(dateObj);
              const timeStr = formatIstanbulTime(dateObj);

              const gameState = String(
                g.gameStatus || g.status || "",
              ).toLowerCase();
              const isLive =
                gameState === "live" ||
                gameState === "playing" ||
                (!g.played &&
                  ((g.local?.score ?? 0) > 0 || (g.road?.score ?? 0) > 0));
              const isFinished = Boolean(g.played) && !isLive;
              const hasScore = isFinished || isLive;

              const status: MatchStatus = isLive
                ? "live"
                : isFinished
                  ? "finished"
                  : "upcoming";

              const matchId = `el-${g.gameCode}`;
              matchMap.set(matchId, {
                id: matchId,
                branch: "Basketbol",
                competition: "Turkish Airlines EuroLeague",
                round: g.roundName || `Round ${g.round}`,
                homeTeam: isFBLocal
                  ? "Fenerbahçe Beko"
                  : g.local?.club?.name || "Ev Sahibi",
                homeLogo: isFBLocal
                  ? "fener.png"
                  : g.local?.club?.images?.crest,
                homeScore: hasScore ? String(g.local?.score ?? 0) : null,
                awayTeam: isFBRoad
                  ? "Fenerbahçe Beko"
                  : g.road?.club?.name || "Deplasman",
                awayLogo: isFBRoad ? "fener.png" : g.road?.club?.images?.crest,
                awayScore: hasScore ? String(g.road?.score ?? 0) : null,
                date: dateStr,
                time: timeStr !== "Invalid Date" ? timeStr : "20:45",
                stadium:
                  g.venue?.name ||
                  (isFBLocal
                    ? "Ülker Spor ve Etkinlik Salonu"
                    : `${g.local?.club?.name || "Rakip"} Salonu`),
                rawDate: g.date,
                status,
                liveClock: isLive ? "CANLI" : undefined,
              });
            });
          }
        }
      } catch (err) {
        console.warn("EuroLeague maç takvimi çekilemedi:", err);
      }

      // 3. VOLEYBOL: TheSportsDB (Kadın Voleybol 136619)
      try {
        const [vLastRes, vNextRes] = await Promise.all([
          safeFetch(
            "https://www.thesportsdb.com/api/v1/json/3/eventslast.php?id=136619",
          ),
          safeFetch(
            "https://www.thesportsdb.com/api/v1/json/3/eventsnext.php?id=136619",
          ),
        ]);

        const parseTsdbVolley = async (res: Response | null) => {
          if (!res || !res.ok) return;
          const data = await res.json();
          const events = [...(data.results || []), ...(data.events || [])];

          events.forEach((item: any) => {
            const isFBHome = item.strHomeTeam?.includes("Fenerbah");
            const isFBAway = item.strAwayTeam?.includes("Fenerbah");
            const matchId = `tsdb-${item.idEvent}`;

            const rawDateStr = item.dateEvent
              ? `${item.dateEvent}T${item.strTime || "16:00:00"}Z`
              : undefined;
            const dateObj = rawDateStr
              ? new Date(rawDateStr)
              : new Date(item.dateEvent);

            const hasScores =
              item.intHomeScore !== null &&
              item.intHomeScore !== undefined &&
              item.intHomeScore !== "" &&
              item.intAwayScore !== null &&
              item.intAwayScore !== undefined &&
              item.intAwayScore !== "";

            const isPastWithoutScore =
              !hasScores &&
              rawDateStr &&
              new Date(rawDateStr).getTime() < Date.now() - 4 * 60 * 60 * 1000;

            if (isPastWithoutScore) {
              return;
            }

            matchMap.set(matchId, {
              id: matchId,
              branch: "Voleybol",
              competition: item.strLeague || "Vodafone Sultanlar Ligi",
              round: item.intRound ? `${item.intRound}. Hafta` : "Lig Maçı",
              homeTeam: isFBHome ? "Fenerbahçe Medicana" : item.strHomeTeam,
              homeLogo: isFBHome ? "fener.png" : item.strHomeTeamBadge,
              homeScore: hasScores ? String(item.intHomeScore) : null,
              awayTeam: isFBAway ? "Fenerbahçe Medicana" : item.strAwayTeam,
              awayLogo: isFBAway ? "fener.png" : item.strAwayTeamBadge,
              awayScore: hasScores ? String(item.intAwayScore) : null,
              date: formatIstanbulDate(dateObj),
              time: item.strTimeLocal
                ? item.strTimeLocal.substring(0, 5)
                : formatIstanbulTime(dateObj),
              stadium: item.strVenue || "Burhan Felek Vestel Voleybol Salonu",
              rawDate: rawDateStr,
              status: hasScores ? "finished" : "upcoming",
            });
          });
        };

        await Promise.all([
          parseTsdbVolley(vLastRes),
          parseTsdbVolley(vNextRes),
        ]);
      } catch {
        // Voleybol API ulaşılamadığında sadece önceki gerçek voleybol verisi varsa korunur
      }

      const allMatches = Array.from(matchMap.values());
      const persisted = loadPersistedFixtures();

      // Eğer bir branş bu istekte geçici ağ hatası yaşadıysa sadece daha önce API'den çekilmiş GERÇEK veriyi koru (sahte maç ekleme!)
      const branches = ["Futbol", "Basketbol", "Voleybol"] as const;
      for (const br of branches) {
        const freshForBranch = allMatches.filter((m) => m.branch === br);
        if (freshForBranch.length > 0) {
          lastGoodByBranch.set(br, freshForBranch);
        } else {
          const prevReal =
            lastGoodByBranch.get(br) ||
            persisted?.filter((m) => m.branch === br);
          if (prevReal && prevReal.length > 0) {
            allMatches.push(...prevReal);
          }
        }
      }

      const now = Date.now();
      const liveMatches = allMatches.filter((m) => m.status === "live");

      const upcoming = allMatches
        .filter(
          (m) =>
            m.status !== "live" &&
            m.status !== "finished" &&
            m.homeScore === null &&
            m.awayScore === null,
        )
        .sort((a, b) => {
          const timeA = a.rawDate
            ? new Date(a.rawDate).getTime()
            : now + 999999999;
          const timeB = b.rawDate
            ? new Date(b.rawDate).getTime()
            : now + 999999999;
          return timeA - timeB;
        });

      const past = allMatches
        .filter(
          (m) =>
            m.status === "finished" ||
            (m.status !== "live" &&
              (m.homeScore !== null || m.awayScore !== null)),
        )
        .sort((a, b) => {
          const timeA = a.rawDate ? new Date(a.rawDate).getTime() : 0;
          const timeB = b.rawDate ? new Date(b.rawDate).getTime() : 0;
          return timeB - timeA;
        });

      const result = [...liveMatches, ...upcoming, ...past];
      if (result.length > 0) {
        cachedFixtures = result;
        lastFetchTimestamp = Date.now();
        savePersistedFixtures(result);
      }
      return result;
    } catch {
      return cachedFixtures || loadPersistedFixtures() || [];
    } finally {
      inFlightFixturesPromise = null;
    }
  })();

  return inFlightFixturesPromise;
};
