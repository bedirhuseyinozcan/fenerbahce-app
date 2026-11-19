import {
  parseAndTranslateEspnEvent,
  parseEspnCommentary,
} from "@/features/matches/parsers/espnEvents";
import { computeMatchMomentum } from "@/features/matches/parsers/momentum";
import {
  attachStatsToLineup,
  getPitchCoordinates,
  mapPositionAbbr,
  resolveLineupCollisions,
} from "@/features/matches/parsers/pitchLayout";
import {
  fetchFixtures,
  formatIstanbulDate,
  formatIstanbulTime,
  getCachedFixturesSync,
  getCachedMatchByIdSync,
  getEuroLeagueSeasonCode,
  resolveMatchStatus,
} from "@/services/fixtureService";
import {
  Lineup,
  MatchData,
  MatchDetailData,
  MatchEvent,
  MatchStat,
  Player,
} from "@/types";
import { safeFetch } from "@/utils/safeFetch";

function extractScore(
  compParticipant: any,
  cachedScore?: string | null,
): string | null {
  if (!compParticipant) return cachedScore ?? null;
  const s = compParticipant.score;
  if (s !== undefined && s !== null) {
    if (typeof s === "object") {
      if (s.displayValue !== undefined && s.displayValue !== null)
        return String(s.displayValue);
      if (s.value !== undefined && s.value !== null) return String(s.value);
    }
    return String(s);
  }
  return cachedScore ?? null;
}

const matchDetailCache = new Map<
  string,
  { data: MatchDetailData; ts: number }
>();
const MATCH_DETAIL_TTL_MS = 15 * 1000;

function getUnconfirmedLineup(): Lineup {
  return {
    formation: "Belirlenmedi",
    coach: "",
    startingXI: [],
    substitutes: [],
    isConfirmed: false,
  };
}

export function getInstantMatchPreview(
  matchId: string,
): MatchDetailData | null {
  const cachedDetail = matchDetailCache.get(matchId);
  if (cachedDetail) return cachedDetail.data;

  const match = getCachedMatchByIdSync(matchId);
  if (!match) return null;

  return {
    ...match,
    status: resolveMatchStatus(match),
    events: [],
    homeLineup: getUnconfirmedLineup(),
    awayLineup: getUnconfirmedLineup(),
    stats: [],
    commentary: [],
    momentum: null,
  };
}

export const getMatchDetail = async (
  matchId: string,
  forceRefresh: boolean = false,
): Promise<MatchDetailData> => {
  const existingDetail = matchDetailCache.get(matchId);
  if (
    !forceRefresh &&
    existingDetail &&
    Date.now() - existingDetail.ts < MATCH_DETAIL_TTL_MS &&
    existingDetail.data.status !== "live"
  ) {
    return existingDetail.data;
  }

  let fixturesList = getCachedFixturesSync() || [];
  let cachedMatch: MatchData | null = getCachedMatchByIdSync(matchId);
  if (!cachedMatch && !getCachedFixturesSync()) {
    try {
      fixturesList = await fetchFixtures();
      cachedMatch = fixturesList.find((f) => f.id === matchId) || null;
    } catch {
      // ignore
    }
  }

  try {
    if (/^\d+$/.test(matchId)) {
      try {
        const knownSlug = cachedMatch?.leagueSlug;
        const espnLeagues = knownSlug
          ? [knownSlug]
          : ["tur.1", "uefa.champions", "uefa.europa"];

        const responses = await Promise.all(
          espnLeagues.map((slug) =>
            safeFetch(
              `https://site.api.espn.com/apis/site/v2/sports/soccer/${slug}/summary?event=${matchId}`,
            ),
          ),
        );
        const res = responses.find((r) => r && r.ok) || null;

        if (res && res.ok) {
          const d = await res.json();
          const comp = d.header?.competitions?.[0];
          if (comp) {
            const homeComp = comp.competitors?.find(
              (c: any) => c.homeAway === "home",
            );
            const awayComp = comp.competitors?.find(
              (c: any) => c.homeAway === "away",
            );
            const isFBHome =
              homeComp?.team?.displayName?.toLowerCase().includes("fenerbah") ||
              (cachedMatch
                ? cachedMatch.homeTeam.toLowerCase().includes("fenerbah")
                : false);
            const isFBAway =
              awayComp?.team?.displayName?.toLowerCase().includes("fenerbah") ||
              (cachedMatch
                ? cachedMatch.awayTeam.toLowerCase().includes("fenerbah")
                : false);

            const state = comp.status?.type?.state;
            const isCompleted =
              comp.status?.type?.completed === true || state === "post";
            const isLive = state === "in";
            const hasScore = isCompleted || isLive;

            const homeScore = hasScore
              ? (extractScore(homeComp, cachedMatch?.homeScore) ?? "0")
              : null;
            const awayScore = hasScore
              ? (extractScore(awayComp, cachedMatch?.awayScore) ?? "0")
              : null;

            const status: "upcoming" | "live" | "finished" = isLive
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
            const homeRoster = d.rosters?.find(
              (r: any) => r.team?.id === homeComp?.id,
            );
            const awayRoster = d.rosters?.find(
              (r: any) => r.team?.id === awayComp?.id,
            );

            const mapLineupFromRoster = (rosterData: any): Lineup => {
              if (
                rosterData?.roster &&
                Array.isArray(rosterData.roster) &&
                rosterData.roster.length > 0
              ) {
                const starters = rosterData.roster.filter(
                  (p: any) => p.starter,
                );
                const subs = rosterData.roster.filter((p: any) => !p.starter);

                let startingXI: Player[] = starters.map(
                  (p: any, idx: number) => ({
                    id: String(p.athlete?.id || `st-${idx}`),
                    number: parseInt(p.jersey, 10) || idx + 1,
                    name:
                      p.athlete?.displayName ||
                      p.athlete?.fullName ||
                      "Futbolcu",
                    position: mapPositionAbbr(p.position?.displayName),
                    gridPosition: getPitchCoordinates(
                      p.formationPlace,
                      p.position?.displayName,
                      p.position?.abbreviation,
                      rosterData.formation,
                    ),
                  }),
                );

                startingXI = resolveLineupCollisions(startingXI);

                const substitutes = subs.map((p: any, idx: number) => ({
                  id: String(p.athlete?.id || `sub-${idx}`),
                  number: parseInt(p.jersey, 10) || idx + 12,
                  name:
                    p.athlete?.displayName || p.athlete?.fullName || "Yedek",
                  position: mapPositionAbbr(p.position?.displayName),
                }));

                const apiCoachName =
                  rosterData.coach?.[0]?.displayName ||
                  rosterData.coach?.[0]?.fullName ||
                  "";

                if (startingXI.length > 0) {
                  return {
                    formation: rosterData.formation || "4-2-3-1",
                    coach: apiCoachName,
                    startingXI,
                    substitutes,
                    isConfirmed: true,
                  };
                }
              }

              return getUnconfirmedLineup();
            };

            const homeTeamName = isFBHome
              ? "Fenerbahçe"
              : homeComp?.team?.displayName ||
                cachedMatch?.homeTeam ||
                "Ev Sahibi";
            const awayTeamName = isFBAway
              ? "Fenerbahçe"
              : awayComp?.team?.displayName ||
                cachedMatch?.awayTeam ||
                "Deplasman";

            const homeLogo = isFBHome
              ? "fener.png"
              : homeComp?.team?.logos?.[0]?.href ||
                homeComp?.team?.logo ||
                cachedMatch?.homeLogo ||
                "logos/superlig";

            const awayLogo = isFBAway
              ? "fener.png"
              : awayComp?.team?.logos?.[0]?.href ||
                awayComp?.team?.logo ||
                cachedMatch?.awayLogo ||
                "logos/superlig";

            const homeLineup = mapLineupFromRoster(homeRoster);
            const awayLineup = mapLineupFromRoster(awayRoster);

            const events: MatchEvent[] = [];
            const goalsAndAssists: {
              team: "home" | "away";
              scorer: string;
              assister?: string;
            }[] = [];

            if (Array.isArray(d.keyEvents)) {
              d.keyEvents.forEach((k: any, idx: number) => {
                const parsed = parseAndTranslateEspnEvent(
                  k,
                  homeComp,
                  awayComp,
                );
                if (!parsed) return;

                const clockText = k.clock?.displayValue || "";
                const minMatch = clockText.match(/(\d+)/);
                const minute = minMatch ? parseInt(minMatch[1], 10) : 0;

                events.push({
                  id: String(k.id || `ev-${idx}`),
                  minute,
                  type: parsed.type,
                  team: parsed.team,
                  player: parsed.player,
                  detail: parsed.detail,
                });

                if (parsed.type === "goal") {
                  goalsAndAssists.push({
                    team: parsed.team,
                    scorer: parsed.player,
                    assister: parsed.assister,
                  });
                }
              });
              events.sort((a, b) => a.minute - b.minute);
            }

            attachStatsToLineup(homeLineup, "home", goalsAndAssists);
            attachStatsToLineup(awayLineup, "away", goalsAndAssists);

            const stats: MatchStat[] = [];
            const t0 = d.boxscore?.teams?.find(
              (t: any) => t.team?.id === homeComp?.id,
            );
            const t1 = d.boxscore?.teams?.find(
              (t: any) => t.team?.id === awayComp?.id,
            );

            const statNameMap: { [key: string]: string } = {
              possession: "Topla Oynama (%)",
              shots: "Toplam Şut",
              onGoal: "İsabetli Şut",
              cornerKicks: "Korner",
              foulsCommitted: "Fauller",
              yellowCards: "Sarı Kartlar",
              redCards: "Kırmızı Kartlar",
              offsides: "Ofsayt",
              saves: "Kurtarışlar",
            };

            if (t0 && t1 && Array.isArray(t0.statistics)) {
              t0.statistics.forEach((s0: any) => {
                const turkishLabel = statNameMap[s0.name];
                if (turkishLabel) {
                  const s1 = t1.statistics?.find(
                    (x: any) => x.name === s0.name,
                  );
                  const hVal = s0.displayValue || "0";
                  const aVal = s1?.displayValue || "0";
                  const hNum = parseFloat(hVal) || 0;
                  const aNum = parseFloat(aVal) || 0;
                  const total = hNum + aNum;
                  const homePercentage =
                    total > 0 ? Math.round((hNum / total) * 100) : 50;

                  stats.push({
                    label: turkishLabel,
                    homeValue: s0.name === "possession" ? `%${hVal}` : hVal,
                    awayValue: s0.name === "possession" ? `%${aVal}` : aVal,
                    homePercentage,
                  });
                }
              });
            }

            const commentary = parseEspnCommentary(
              d.commentary,
              homeComp,
              awayComp,
            );
            const momentum = computeMatchMomentum(stats, events);

            const refereeName =
              d.gameInfo?.officials?.[0]?.displayName ||
              d.gameInfo?.officials?.[0]?.fullName ||
              undefined;

            const leagueObj = d.header?.league || {};
            const leagueName = (
              leagueObj.name ||
              leagueObj.slug ||
              ""
            ).toLowerCase();
            const seasonName = (d.header?.season?.name || "").toLowerCase();

            let competition = "";
            if (
              leagueName.includes("champion") ||
              leagueName.includes("uefa.champions") ||
              seasonName.includes("champions league")
            ) {
              competition = "UEFA Şampiyonlar Ligi";
            } else if (
              leagueName.includes("europa") ||
              leagueName.includes("uefa.europa") ||
              seasonName.includes("europa league")
            ) {
              competition = "UEFA Avrupa Ligi";
            } else if (
              leagueName.includes("conference") ||
              leagueName.includes("uefa.conf") ||
              seasonName.includes("conference league")
            ) {
              competition = "UEFA Konferans Ligi";
            } else if (
              leagueName.includes("super lig") ||
              leagueName.includes("tur.1") ||
              leagueName.includes("süper lig") ||
              seasonName.includes("super lig")
            ) {
              competition = "Trendyol Süper Lig";
            } else if (comp.notes?.[0]?.headline) {
              competition = comp.notes[0].headline;
            } else if (
              cachedMatch?.competition &&
              cachedMatch.competition !== "Süper Lig"
            ) {
              competition = cachedMatch.competition;
            } else if (leagueObj.name) {
              competition = leagueObj.name;
            } else {
              competition = cachedMatch?.competition || "Trendyol Süper Lig";
            }

            let roundStr = "";
            const rawRound = comp.round?.displayName || "";
            if (rawRound) {
              if (/matchday\s*(\d+)/i.test(rawRound)) {
                roundStr = rawRound.replace(/matchday\s*(\d+)/i, "$1. Hafta");
              } else if (/round\s*of\s*16/i.test(rawRound)) {
                roundStr = "Son 16 Turu";
              } else if (/quarter/i.test(rawRound)) {
                roundStr = "Çeyrek Final";
              } else if (/semi/i.test(rawRound)) {
                roundStr = "Yarı Final";
              } else if (/final/i.test(rawRound)) {
                roundStr = "Final";
              } else {
                roundStr = rawRound;
              }
            } else if (
              seasonName.includes("league phase") ||
              leagueName.includes("league phase")
            ) {
              roundStr = "Lig Aşaması";
            } else if (
              seasonName.includes("group") ||
              leagueName.includes("group")
            ) {
              roundStr = "Grup Aşaması";
            } else if (cachedMatch?.round && cachedMatch.round !== "Lig Maçı") {
              roundStr = cachedMatch.round;
            } else if (comp.notes?.[0]?.headline) {
              roundStr = "";
            } else {
              roundStr = cachedMatch?.round || "Lig Maçı";
            }

            const espnDetail: MatchDetailData = {
              id: matchId,
              branch: "Futbol",
              competition,
              round: roundStr,
              homeTeam: homeTeamName,
              homeLogo,
              homeScore,
              awayTeam: awayTeamName,
              awayLogo,
              awayScore,
              date: dateStr,
              time: timeStr !== "Invalid Date" ? timeStr : "20:00",
              rawDate: comp.date || cachedMatch?.rawDate,
              stadium:
                d.gameInfo?.venue?.fullName ||
                comp.venue?.fullName ||
                cachedMatch?.stadium ||
                (isFBHome
                  ? "Ülker Stadyumu Şükrü Saracoğlu Spor Kompleksi"
                  : `${homeTeamName} Stadyumu`),
              status,
              liveClock,
              referee: refereeName,
              events,
              homeLineup,
              awayLineup,
              stats,
              commentary,
              momentum,
            };
            matchDetailCache.set(matchId, { data: espnDetail, ts: Date.now() });
            return espnDetail;
          }
        }
      } catch (err) {
        console.warn("ESPN match summary fetch failed:", err);
      }
    }

    if (matchId.startsWith("el-")) {
      const gameCode = parseInt(matchId.replace("el-", ""), 10);
      try {
        const seasonCode = getEuroLeagueSeasonCode();
        const euroRes = await safeFetch(
          `https://api-live.euroleague.net/v2/competitions/E/seasons/${seasonCode}/games`,
        );
        if (euroRes && euroRes.ok) {
          const euroData = await euroRes.json();
          const game = euroData.data?.find((g: any) => g.gameCode === gameCode);
          if (game) {
            const isFBLocal =
              game.local?.club?.code === "ULK" ||
              game.local?.club?.name?.toLowerCase().includes("fenerbah") ||
              (cachedMatch
                ? cachedMatch.homeTeam.toLowerCase().includes("fenerbah")
                : false);
            const dateObj = new Date(game.date);

            const qScores: string[] = [];
            if (game.local?.partials) {
              const p = game.local.partials;
              const rp = game.road?.partials || {};
              if (p.partials1 || rp.partials1)
                qScores.push(`1.Ç: ${p.partials1 || 0}-${rp.partials1 || 0}`);
              if (p.partials2 || rp.partials2)
                qScores.push(`2.Ç: ${p.partials2 || 0}-${rp.partials2 || 0}`);
              if (p.partials3 || rp.partials3)
                qScores.push(`3.Ç: ${p.partials3 || 0}-${rp.partials3 || 0}`);
              if (p.partials4 || rp.partials4)
                qScores.push(`4.Ç: ${p.partials4 || 0}-${rp.partials4 || 0}`);
            }

            const homeTeam = isFBLocal
              ? "Fenerbahçe Beko"
              : game.local?.club?.name || cachedMatch?.homeTeam || "Ev Sahibi";
            const awayTeam = !isFBLocal
              ? "Fenerbahçe Beko"
              : game.road?.club?.name || cachedMatch?.awayTeam || "Deplasman";

            const homeLogo = isFBLocal
              ? "fener.png"
              : game.local?.club?.images?.crest ||
                cachedMatch?.homeLogo ||
                "logos/euroleague";

            const awayLogo = !isFBLocal
              ? "fener.png"
              : game.road?.club?.images?.crest ||
                cachedMatch?.awayLogo ||
                "logos/euroleague";

            const gameState = String(
              game.gameStatus || game.status || "",
            ).toLowerCase();
            const isLive =
              gameState === "live" ||
              gameState === "playing" ||
              (!game.played &&
                ((game.local?.score ?? 0) > 0 || (game.road?.score ?? 0) > 0));
            const isCompleted = Boolean(game.played) && !isLive;
            const hasScore = isCompleted || isLive;

            const homeScore = hasScore
              ? String(game.local?.score ?? 0)
              : (cachedMatch?.homeScore ?? null);
            const awayScore = hasScore
              ? String(game.road?.score ?? 0)
              : (cachedMatch?.awayScore ?? null);

            const stadium =
              game.venue?.name ||
              cachedMatch?.stadium ||
              (isFBLocal
                ? "Ülker Spor ve Etkinlik Salonu"
                : `${homeTeam} Salonu`);

            const realBasketballStats: MatchStat[] = [];
            if (hasScore && game.local?.partials && game.road?.partials) {
              const lp = game.local.partials;
              const rp = game.road.partials;
              const quarters = [
                {
                  label: "1. Çeyrek Skoru",
                  h: lp.partials1 || 0,
                  a: rp.partials1 || 0,
                },
                {
                  label: "2. Çeyrek Skoru",
                  h: lp.partials2 || 0,
                  a: rp.partials2 || 0,
                },
                {
                  label: "3. Çeyrek Skoru",
                  h: lp.partials3 || 0,
                  a: rp.partials3 || 0,
                },
                {
                  label: "4. Çeyrek Skoru",
                  h: lp.partials4 || 0,
                  a: rp.partials4 || 0,
                },
              ];
              quarters.forEach((q) => {
                if (q.h > 0 || q.a > 0) {
                  const total = q.h + q.a;
                  realBasketballStats.push({
                    label: q.label,
                    homeValue: String(q.h),
                    awayValue: String(q.a),
                    homePercentage:
                      total > 0 ? Math.round((q.h / total) * 100) : 50,
                  });
                }
              });
            }

            const euroDetail: MatchDetailData = {
              id: matchId,
              branch: "Basketbol",
              competition: "Turkish Airlines EuroLeague",
              round: game.roundName || `Round ${game.round}`,
              homeTeam,
              homeLogo,
              homeScore,
              awayTeam,
              awayLogo,
              awayScore,
              date: formatIstanbulDate(dateObj),
              time: formatIstanbulTime(dateObj),
              rawDate: game.date || cachedMatch?.rawDate,
              stadium,
              status: isLive ? "live" : isCompleted ? "finished" : "upcoming",
              liveClock: isLive ? "CANLI" : undefined,
              quarterScores: qScores.length > 0 ? qScores : undefined,
              events: [],
              homeLineup: getUnconfirmedLineup(),
              awayLineup: getUnconfirmedLineup(),
              stats: realBasketballStats,
              commentary: [],
              momentum: computeMatchMomentum(realBasketballStats, []),
            };
            matchDetailCache.set(matchId, { data: euroDetail, ts: Date.now() });
            return euroDetail;
          }
        }
      } catch (err) {
        console.warn("EuroLeague game detail fetch error:", err);
      }
    }

    const emptyFallbackMatch: MatchData = {
      id: matchId,
      branch: "Futbol",
      competition: "Fenerbahçe Maçı",
      round: "",
      homeTeam: "Fenerbahçe",
      homeLogo: "fener.png",
      homeScore: null,
      awayTeam: "Rakip",
      awayLogo: "",
      awayScore: null,
      date: "",
      time: "",
      stadium: "Ülker Stadyumu Şükrü Saracoğlu Spor Kompleksi",
      status: "upcoming",
    };

    const match =
      cachedMatch ||
      fixturesList.find((f) => f.id === matchId) ||
      emptyFallbackMatch;
    const isFbHome = match.homeTeam.toLowerCase().includes("fenerbah");
    const resolvedStatus = resolveMatchStatus(match);

    const stadium =
      match.stadium ||
      (isFbHome
        ? "Ülker Stadyumu Şükrü Saracoğlu Spor Kompleksi"
        : `${match.homeTeam} Stadyumu`);

    return {
      id: match.id,
      branch: match.branch,
      competition: match.competition,
      round: match.round,
      homeTeam: match.homeTeam,
      homeLogo: match.homeLogo,
      homeScore: match.homeScore,
      awayTeam: match.awayTeam,
      awayLogo: match.awayLogo,
      awayScore: match.awayScore,
      date: match.date,
      time: match.time,
      rawDate: match.rawDate,
      stadium,
      status: resolvedStatus,
      liveClock: match.liveClock,
      referee: undefined,
      quarterScores: undefined,
      events: [],
      homeLineup: getUnconfirmedLineup(),
      awayLineup: getUnconfirmedLineup(),
      stats: [],
      commentary: [],
      momentum: null,
    };
  } catch {
    const fbMatch: MatchData = cachedMatch || {
      id: matchId,
      branch: "Futbol",
      competition: "Fenerbahçe Maçı",
      round: "",
      homeTeam: "Fenerbahçe",
      homeLogo: "fener.png",
      homeScore: null,
      awayTeam: "Rakip",
      awayLogo: "",
      awayScore: null,
      date: "",
      time: "",
      stadium: "Ülker Stadyumu Şükrü Saracoğlu Spor Kompleksi",
      status: "upcoming",
    };
    const isHomeFb = fbMatch.homeTeam.toLowerCase().includes("fenerbah");

    const stadium =
      fbMatch.stadium ||
      (isHomeFb
        ? "Ülker Stadyumu Şükrü Saracoğlu Spor Kompleksi"
        : `${fbMatch.homeTeam} Stadyumu`);

    return {
      id: matchId,
      branch: fbMatch.branch,
      competition: fbMatch.competition,
      round: fbMatch.round,
      homeTeam: fbMatch.homeTeam,
      homeLogo: fbMatch.homeLogo,
      homeScore: fbMatch.homeScore,
      awayTeam: fbMatch.awayTeam,
      awayLogo: fbMatch.awayLogo,
      awayScore: fbMatch.awayScore,
      date: fbMatch.date,
      time: fbMatch.time,
      rawDate: fbMatch.rawDate,
      stadium,
      status: resolveMatchStatus(fbMatch),
      liveClock: fbMatch.liveClock,
      events: [],
      homeLineup: getUnconfirmedLineup(),
      awayLineup: getUnconfirmedLineup(),
      stats: [],
      commentary: [],
      momentum: null,
    };
  }
};
