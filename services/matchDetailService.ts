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
  EventType,
  Lineup,
  MatchData,
  MatchDetailData,
  MatchEvent,
  MatchStat,
  Player,
} from "@/types";
import { safeFetch } from "@/utils/safeFetch";

function getPitchCoordinates(
  formationPlace?: number | string,
  posName?: string,
  posAbbr?: string,
  formation?: string,
): { x: number; y: number } {
  const pNum =
    formationPlace !== undefined && formationPlace !== null
      ? parseInt(String(formationPlace), 10)
      : NaN;

  if (!isNaN(pNum) && pNum >= 1 && pNum <= 11) {
    if (formation === "4-1-4-1") {
      switch (pNum) {
        case 1:
          return { x: 50, y: 88 };
        case 2:
          return { x: 86, y: 70 };
        case 5:
          return { x: 62, y: 72 };
        case 6:
          return { x: 38, y: 72 };
        case 3:
          return { x: 14, y: 70 };
        case 4:
          return { x: 50, y: 55 };
        case 8:
          return { x: 62, y: 38 };
        case 10:
          return { x: 38, y: 38 };
        case 7:
          return { x: 84, y: 35 };
        case 11:
          return { x: 16, y: 35 };
        case 9:
          return { x: 50, y: 15 };
      }
    } else if (formation === "4-3-3") {
      switch (pNum) {
        case 1:
          return { x: 50, y: 88 };
        case 2:
          return { x: 86, y: 70 };
        case 5:
          return { x: 62, y: 72 };
        case 6:
          return { x: 38, y: 72 };
        case 3:
          return { x: 14, y: 70 };
        case 4:
          return { x: 50, y: 54 };
        case 7:
          return { x: 68, y: 44 };
        case 8:
          return { x: 32, y: 44 };
        case 10:
          return { x: 82, y: 22 };
        case 11:
          return { x: 18, y: 22 };
        case 9:
          return { x: 50, y: 15 };
      }
    } else if (formation === "4-4-2") {
      switch (pNum) {
        case 1:
          return { x: 50, y: 88 };
        case 2:
          return { x: 86, y: 70 };
        case 5:
          return { x: 62, y: 72 };
        case 6:
          return { x: 38, y: 72 };
        case 3:
          return { x: 14, y: 70 };
        case 7:
          return { x: 84, y: 46 };
        case 8:
          return { x: 62, y: 48 };
        case 4:
          return { x: 38, y: 48 };
        case 11:
          return { x: 16, y: 46 };
        case 10:
          return { x: 64, y: 16 };
        case 9:
          return { x: 36, y: 16 };
      }
    } else if (formation === "3-5-2") {
      switch (pNum) {
        case 1:
          return { x: 50, y: 88 };
        case 2:
          return { x: 74, y: 72 };
        case 5:
          return { x: 50, y: 74 };
        case 6:
          return { x: 26, y: 72 };
        case 7:
          return { x: 86, y: 46 };
        case 8:
          return { x: 64, y: 50 };
        case 4:
          return { x: 50, y: 56 };
        case 10:
          return { x: 36, y: 50 };
        case 3:
          return { x: 14, y: 46 };
        case 11:
          return { x: 64, y: 16 };
        case 9:
          return { x: 36, y: 16 };
      }
    } else {
      // 4-2-3-1 & standard
      switch (pNum) {
        case 1:
          return { x: 50, y: 88 };
        case 2:
          return { x: 86, y: 70 };
        case 5:
          return { x: 62, y: 72 };
        case 6:
          return { x: 38, y: 72 };
        case 3:
          return { x: 14, y: 70 };
        case 4:
          return { x: 35, y: 53 };
        case 8:
          return { x: 65, y: 53 };
        case 7:
          return { x: 84, y: 33 };
        case 10:
          return { x: 50, y: 33 };
        case 11:
          return { x: 16, y: 33 };
        case 9:
          return { x: 50, y: 15 };
      }
    }
  }

  const a = (posAbbr || "").toUpperCase().trim();
  const p = (posName || "").toLowerCase().trim();

  if (a === "G" || a === "GK" || p.includes("goal")) return { x: 50, y: 88 };

  if (a === "RB" || p.includes("right back")) return { x: 86, y: 70 };
  if (a === "LB" || p.includes("left back")) return { x: 14, y: 70 };
  if (a === "RWB" || p.includes("right wing back")) return { x: 88, y: 62 };
  if (a === "LWB" || p.includes("left wing back")) return { x: 12, y: 62 };
  if (
    a === "CD-R" ||
    a === "CB-R" ||
    a === "RCB" ||
    p.includes("center right defender")
  )
    return { x: 62, y: 72 };
  if (
    a === "CD-L" ||
    a === "CB-L" ||
    a === "LCB" ||
    p.includes("center left defender")
  )
    return { x: 38, y: 72 };
  if (a === "CD" || a === "CB" || p.includes("center back"))
    return { x: 50, y: 72 };
  if (p.includes("defender") || p.includes("back")) return { x: 50, y: 72 };

  if (a === "DM-R" || a === "RDM") return { x: 65, y: 54 };
  if (a === "DM-L" || a === "LDM") return { x: 35, y: 54 };
  if (a === "DM" || a === "CDM" || p.includes("defensive mid"))
    return { x: 50, y: 55 };
  if (a === "AM-R" || a === "RAM" || p.includes("attacking midfielder right"))
    return { x: 82, y: 33 };
  if (a === "AM-L" || a === "LAM" || p.includes("attacking midfielder left"))
    return { x: 18, y: 33 };
  if (a === "AM" || a === "CAM" || p.includes("attacking mid"))
    return { x: 50, y: 33 };
  if (a === "CM-R" || a === "RCM" || p.includes("center right mid"))
    return { x: 64, y: 44 };
  if (a === "CM-L" || a === "LCM" || p.includes("center left mid"))
    return { x: 36, y: 44 };
  if (a === "RM" || p.includes("right mid")) return { x: 84, y: 40 };
  if (a === "LM" || p.includes("left mid")) return { x: 16, y: 40 };
  if (a === "CM" || a === "M" || p.includes("midfield"))
    return { x: 50, y: 46 };

  if (
    a === "RW" ||
    a === "RF" ||
    p.includes("right wing") ||
    p.includes("right forward")
  )
    return { x: 82, y: 20 };
  if (
    a === "LW" ||
    a === "LF" ||
    p.includes("left wing") ||
    p.includes("left forward")
  )
    return { x: 18, y: 20 };
  if (
    a === "ST" ||
    a === "CF" ||
    a === "F" ||
    p.includes("striker") ||
    p.includes("forward")
  )
    return { x: 50, y: 15 };

  return { x: 50, y: 50 };
}

function resolveLineupCollisions(players: Player[]): Player[] {
  if (players.length <= 1) return players;

  const spreadRow = (row: Player[], defaultY: number) => {
    if (row.length === 0) return;
    const count = row.length;
    const hasOverlap =
      row.length > 1 &&
      row.some((p1, idx1) =>
        row.some(
          (p2, idx2) =>
            idx1 !== idx2 &&
            Math.abs(p1.gridPosition.x - p2.gridPosition.x) < 8 &&
            Math.abs(p1.gridPosition.y - p2.gridPosition.y) < 8,
        ),
      );

    if (hasOverlap || row.every((p) => p.gridPosition.x === 50)) {
      const sorted = [...row].sort(
        (a, b) => a.gridPosition.x - b.gridPosition.x,
      );
      sorted.forEach((p, i) => {
        const x = count === 1 ? 50 : Math.round(15 + (i * 70) / (count - 1));
        p.gridPosition = {
          x,
          y: p.gridPosition.y || defaultY,
        };
      });
    }
  };

  const gks = players.filter((p) => p.gridPosition.y >= 82);
  const dfs = players.filter(
    (p) => p.gridPosition.y >= 60 && p.gridPosition.y < 82,
  );
  const mfs = players.filter(
    (p) => p.gridPosition.y >= 26 && p.gridPosition.y < 60,
  );
  const fws = players.filter((p) => p.gridPosition.y < 26);

  spreadRow(gks, 88);
  spreadRow(dfs, 71);

  const dms = mfs.filter((p) => p.gridPosition.y >= 45);
  const ams = mfs.filter((p) => p.gridPosition.y < 45);
  if (dms.length > 0 && ams.length > 0) {
    spreadRow(dms, 53);
    spreadRow(ams, 33);
  } else {
    spreadRow(mfs, 46);
  }

  spreadRow(fws, 16);

  return players;
}

function mapPositionAbbr(pos: string = ""): string {
  const p = pos.toLowerCase();
  if (p.includes("goalkeeper")) return "KL";
  if (p.includes("defender") || p.includes("back")) return "DF";
  if (p.includes("midfield")) return "OS";
  if (p.includes("forward") || p.includes("striker") || p.includes("winger"))
    return "FV";
  return "OY";
}

function isSamePlayer(nameA: string, nameB: string): boolean {
  if (!nameA || !nameB) return false;
  const clean = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim();

  const a = clean(nameA);
  const b = clean(nameB);
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;

  const partsA = a.split(/\s+/).filter(Boolean);
  const partsB = b.split(/\s+/).filter(Boolean);
  const lastA = partsA[partsA.length - 1];
  const lastB = partsB[partsB.length - 1];
  if (lastA && lastB && lastA === lastB && lastA.length > 2) return true;

  return false;
}

function attachStatsToLineup(
  lineup: Lineup,
  teamKey: "home" | "away",
  goalsAndAssists: {
    team: "home" | "away";
    scorer: string;
    assister?: string;
  }[],
) {
  if (!lineup) return;
  const teamEvents = goalsAndAssists.filter((e) => e.team === teamKey);

  const tallyPlayer = (p: {
    name: string;
    goals?: number;
    assists?: number;
  }) => {
    let goals = 0;
    let assists = 0;
    teamEvents.forEach((ev) => {
      if (isSamePlayer(p.name, ev.scorer)) {
        goals++;
      }
      if (ev.assister && isSamePlayer(p.name, ev.assister)) {
        assists++;
      }
    });
    if (goals > 0) {
      p.goals = goals;
    } else {
      delete p.goals;
    }
    if (assists > 0) {
      p.assists = assists;
    } else {
      delete p.assists;
    }
  };

  if (Array.isArray(lineup.startingXI)) {
    lineup.startingXI.forEach(tallyPlayer);
  }
  if (Array.isArray(lineup.substitutes)) {
    lineup.substitutes.forEach(tallyPlayer);
  }
}

function parseAndTranslateEspnEvent(
  k: any,
  homeComp: any,
  awayComp: any,
): {
  type: EventType;
  team: "home" | "away";
  player: string;
  detail: string;
  assister?: string;
} | null {
  const text = (k.text || "").trim();
  const typeText = (k.type?.text || "").toLowerCase();

  const isAction =
    typeText.includes("goal") ||
    typeText.includes("card") ||
    typeText.includes("substitution") ||
    typeText.includes("penalty") ||
    typeText.includes("var") ||
    text.toLowerCase().startsWith("goal!");

  if (!isAction) return null;

  let type: EventType = "goal";
  if (typeText.includes("yellow")) {
    type = "yellow-card";
  } else if (typeText.includes("red card") || /\bred\b/.test(typeText)) {
    type = "red-card";
  } else if (typeText.includes("substitution")) {
    type = "substitution";
  } else if (typeText.includes("var")) {
    type = "var";
  }

  let team: "home" | "away" = "home";
  if (k.team?.id) {
    team = k.team.id === homeComp?.id ? "home" : "away";
  } else if (text) {
    const homeName = (homeComp?.team?.displayName || "").toLowerCase();
    const awayName = (awayComp?.team?.displayName || "").toLowerCase();
    if (homeName && text.toLowerCase().includes(homeName)) team = "home";
    else if (awayName && text.toLowerCase().includes(awayName)) team = "away";
  }

  const getParticipant = () => {
    const p = k.participants?.[0];
    if (!p) return "";
    if (typeof p.athlete === "string") return p.athlete;
    if (p.athlete?.displayName) return p.athlete.displayName;
    if (p.displayName) return p.displayName;
    return "";
  };
  if (type === "substitution") {
    const subDetailed = text.match(
      /Substitution,\s*[^.]*\.\s*([^(]+?)\s+replaces\s+([^(.]+)/i,
    );
    if (subDetailed) {
      const player = subDetailed[1].trim();
      const outPlayer = subDetailed[2]
        .replace(/\s*because of an injury/i, "")
        .trim();
      const isInjury = text.toLowerCase().includes("injury");
      const detail =
        "Oyuna Girdi (Çıkan: " +
        outPlayer +
        ")" +
        (isInjury ? " [Sakatlık]" : "");
      return { type, team, player, detail };
    } else {
      const subShort = text.match(/^([^(]+?)\s*\([^)]*\)\s*Substitution/i);
      const player = subShort?.[1]?.trim() || getParticipant() || "Oyuncu";
      return { type, team, player, detail: "Oyuncu Değişikliği" };
    }
  }

  if (type === "yellow-card") {
    const cardDetailed = text.match(
      /^([^(]+?)\s*\([^)]*\)\s*is shown the yellow card(?: for (.+))?/i,
    );
    const cardShort = text.match(/^([^(]+?)\s*\([^)]*\)\s*Yellow Card/i);
    const player =
      cardDetailed?.[1]?.trim() ||
      cardShort?.[1]?.trim() ||
      getParticipant() ||
      "Oyuncu";

    let reason = cardDetailed?.[2]
      ? cardDetailed[2].replace(/\.$/, "").trim().toLowerCase()
      : "";
    let trReason = "";
    if (reason.includes("bad foul") || reason.includes("roughing"))
      trReason = "Sert faul";
    else if (reason.includes("handball")) trReason = "Elle oynama";
    else if (reason.includes("time wasting")) trReason = "Zaman geçirme";
    else if (reason.includes("argument") || reason.includes("dissent"))
      trReason = "Hakeme itiraz";
    else if (reason.includes("unsporting"))
      trReason = "Sportmenlik dışı hareket";

    const detail = trReason ? `Sarı Kart (${trReason})` : "Sarı Kart";
    return { type, team, player, detail };
  }

  if (type === "red-card") {
    const cardMatch = text.match(
      /^([^(]+?)\s*\([^)]*\)\s*(?:is shown the red card|Red Card)/i,
    );
    const player = cardMatch?.[1]?.trim() || getParticipant() || "Oyuncu";
    return { type, team, player, detail: "Kırmızı Kart!" };
  }

  if (
    typeText.includes("penalty - scored") ||
    (typeText.includes("goal") && text.includes("converts the penalty")) ||
    text.includes("converts the penalty")
  ) {
    const penMatch = text.match(
      /Goal!.*?\.\s*([^(]+?)\s*\([^)]*\)\s*converts the penalty/i,
    );
    const player = penMatch?.[1]?.trim() || getParticipant() || "Oyuncu";
    return { type: "goal", team, player, detail: "Penaltı Golü! ⚽" };
  }

  if (typeText.includes("own goal") || text.includes("Own Goal")) {
    const ogMatch = text.match(/Own Goal by\s*([^(]+)/i);
    const player = ogMatch?.[1]?.trim() || getParticipant() || "Oyuncu";
    return { type: "goal", team, player, detail: "Kendi Kalesine Gol" };
  }

  if (
    type === "goal" ||
    typeText.includes("goal") ||
    text.toLowerCase().startsWith("goal!")
  ) {
    const scorerDetailed = text.match(/Goal!\s*[^.]*?\.\s*([^(]+?)\s*\(/i);
    const scorerShort = text.match(/^([^(]+?)\s*\([^)]*\)\s*Goal/i);
    const player =
      scorerDetailed?.[1]?.trim() ||
      scorerShort?.[1]?.trim() ||
      getParticipant() ||
      "Oyuncu";

    let assister: string | undefined = undefined;
    const p1 = k.participants?.[1];
    if (p1) {
      assister =
        (typeof p1.athlete === "string"
          ? p1.athlete
          : p1.athlete?.displayName) || p1.displayName;
    }
    if (!assister) {
      const assistMatch = text.match(/Assisted by\s*([^.]+)/i);
      if (assistMatch) {
        assister = assistMatch[1].trim();
      }
    }

    let shotType = "";
    const lower = text.toLowerCase();
    if (lower.includes("header")) shotType = "Kafa Vuruşu";
    else if (lower.includes("left footed shot")) shotType = "Sol Ayakla Şut";
    else if (lower.includes("right footed shot")) shotType = "Sağ Ayakla Şut";
    else if (lower.includes("free kick")) shotType = "Frikik";
    else if (lower.includes("volley")) shotType = "Vole";

    if (lower.includes("outside the box"))
      shotType += (shotType ? ", " : "") + "Ceza Sahası Dışı";
    else if (lower.includes("centre of the box"))
      shotType += (shotType ? ", " : "") + "Ceza Sahası İçi";
    else if (lower.includes("very close range"))
      shotType += (shotType ? ", " : "") + "Altıpas";

    let detail = "Gol!";
    if (shotType) detail = `Gol! (${shotType})`;
    if (assister) detail += ` • Asist: ${assister}`;

    return { type: "goal", team, player, detail, assister };
  }

  if (type === "var") {
    const player = "VAR İncelemesi";
    const detail = text.toLowerCase().includes("no goal")
      ? "Gol İptal Edildi"
      : "Gol Onaylandı";
    return { type, team, player, detail };
  }

  return null;
}

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

  const homeLineup = getUnconfirmedLineup();
  const awayLineup = getUnconfirmedLineup();

  return {
    ...match,
    status: resolveMatchStatus(match),
    events: [],
    homeLineup,
    awayLineup,
    stats: [],
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

            const mapLineupFromRoster = (
              rosterData: any,
              isTeamFB: boolean,
              teamName: string,
            ): Lineup => {
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

            const homeLineup = mapLineupFromRoster(
              homeRoster,
              isFBHome,
              homeTeamName,
            );
            const awayLineup = mapLineupFromRoster(
              awayRoster,
              isFBAway,
              awayTeamName,
            );

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
              // K4 düzeltmesi: Gerçek istatistik yoksa sahte veri üretme, boş dizi dön
              stats,
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

            // K4 düzeltmesi: Gerçek çeyrek skorlarından anlamlı istatistik üret, uydurma oyuncu olayı ekleme
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
    };
  }
};
