import { Athlete, AthleteSeasonStats } from "@/types";

function extractEspnFootballStats(athleteObj: any): AthleteSeasonStats | undefined {
  const categories = athleteObj?.statistics?.splits?.categories;
  if (!Array.isArray(categories) || categories.length === 0) return undefined;

  const flat = new Map<string, number>();
  for (const cat of categories) {
    const statsArr = Array.isArray(cat?.stats) ? cat.stats : [];
    for (const st of statsArr) {
      const name = String(st?.name || "").trim();
      const val =
        typeof st?.value === "number"
          ? st.value
          : typeof st?.displayValue === "string"
            ? parseFloat(st.displayValue)
            : NaN;
      if (name && Number.isFinite(val)) {
        flat.set(name, val);
      }
    }
  }

  if (flat.size === 0) return undefined;

  const appearances = flat.get("appearances");
  const goals = flat.get("totalGoals") ?? flat.get("goals");
  const assists = flat.get("goalAssists") ?? flat.get("assists");
  const yellowCards = flat.get("yellowCards");
  const redCards = flat.get("redCards");
  const minutesPlayed = flat.get("minutes");

  const hasAny =
    appearances !== undefined ||
    goals !== undefined ||
    assists !== undefined ||
    yellowCards !== undefined ||
    redCards !== undefined;

  if (!hasAny) return undefined;

  return {
    appearances,
    goals,
    assists,
    yellowCards,
    redCards,
    minutesPlayed,
    sourceLabel: "ESPN",
  };
}

export function parseEspnFootballRoster(data: any): Athlete[] {
  if (!Array.isArray(data?.athletes) || data.athletes.length === 0) {
    return [];
  }

  return data.athletes.map((a: any) => {
    const posRaw = a.position?.displayName?.toLowerCase() || "";
    let category: Athlete["category"] = "Orta Saha";
    let posTr = "Orta Saha";

    if (posRaw.includes("goalkeeper")) {
      category = "Kaleci";
      posTr = "Kaleci";
    } else if (posRaw.includes("defender") || posRaw.includes("back")) {
      category = "Defans";
      if (posRaw.includes("right")) posTr = "Sağ Bek";
      else if (posRaw.includes("left")) posTr = "Sol Bek";
      else posTr = "Stoper";
    } else if (posRaw.includes("midfield")) {
      category = "Orta Saha";
      if (posRaw.includes("attacking")) posTr = "On Numara";
      else if (posRaw.includes("defensive")) posTr = "Ön Libero";
      else posTr = "Merkez Orta Saha";
    } else if (
      posRaw.includes("forward") ||
      posRaw.includes("striker") ||
      posRaw.includes("winger")
    ) {
      category = "Forvet";
      if (posRaw.includes("right")) posTr = "Sağ Kanat";
      else if (posRaw.includes("left")) posTr = "Sol Kanat";
      else posTr = "Santrafor";
    }

    const stats = extractEspnFootballStats(a);
    const ageVal = typeof a.age === "number" && a.age > 14 && a.age < 55 ? a.age : undefined;

    return {
      id: `espn-fb-${a.id}`,
      number: a.jersey ? parseInt(String(a.jersey), 10) || 0 : 0,
      name: a.displayName || a.fullName || "Futbolcu",
      position: posTr,
      category,
      country: a.citizenship || undefined,
      branch: "Futbol",
      image: a.headshot?.href || undefined,
      age: ageVal,
      height: typeof a.displayHeight === "string" ? a.displayHeight : undefined,
      weight: typeof a.displayWeight === "string" ? a.displayWeight : undefined,
      source: "espn",
      stats,
    };
  });
}

function toTitleCaseWord(word: string): string {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function formatPersonName(rawName: string): string {
  const cleaned = String(rawName || "").trim();
  if (!cleaned) return "Sporcu";
  if (cleaned.includes(",")) {
    const parts = cleaned.split(",").map((p) => p.trim()).filter(Boolean);
    const reordered =
      parts.length >= 2 ? `${parts[1]} ${parts[0]}` : cleaned.replace(",", " ");
    return reordered
      .split(/\s+/)
      .map(toTitleCaseWord)
      .join(" ");
  }
  const hasLower = /[a-zçğıöşü]/.test(cleaned);
  return hasLower ? cleaned : cleaned.split(/\s+/).map(toTitleCaseWord).join(" ");
}

function computeAgeFromBirthDate(birthDate?: string): number | undefined {
  if (!birthDate) return undefined;
  const dob = new Date(birthDate);
  if (isNaN(dob.getTime())) return undefined;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age > 14 && age < 55 ? age : undefined;
}

export function normalizePlayerLookupName(name: string): string {
  return formatPersonName(name)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function parseEuroLeagueClubPeople(data: any): Athlete[] {
  const rawList = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : [];

  const players: Athlete[] = [];
  const seenIds = new Set<string>();

  for (const item of rawList) {
    if (item?.active === false) continue;

    const typeName = String(item?.typeName || item?.type || "").toLowerCase();
    const isPlayer =
      typeName === "j" ||
      typeName.includes("player") ||
      item?.positionName != null;
    if (!isPlayer || typeName.includes("coach") || typeName.includes("staff")) {
      continue;
    }

    const person = item?.person || {};
    const rawName =
      person?.name ||
      item?.name ||
      [person?.firstName, person?.lastName].filter(Boolean).join(" ");
    if (!rawName) continue;

    const name = formatPersonName(rawName);
    const code = String(person?.code || item?.code || name);
    if (seenIds.has(code)) continue;
    seenIds.add(code);

    const posRaw = String(item?.positionName || item?.position || "").toLowerCase();
    let category: Athlete["category"] = "Gard";
    let position = "Gard";

    if (posRaw.includes("guard") || posRaw.includes("point")) {
      category = "Gard";
      position = "Gard";
    } else if (posRaw.includes("center") || posRaw.includes("pivot")) {
      category = "Forvet/Pivot";
      position = "Pivot";
    } else if (posRaw.includes("forward")) {
      category = "Forvet/Pivot";
      position = "Forvet";
    }

    const dorsalVal = item?.dorsal ?? item?.dorsalRaw;
    const num = dorsalVal !== undefined && dorsalVal !== null
      ? parseInt(String(dorsalVal), 10) || 0
      : 0;

    const rawHeight = Number(person?.height);
    const height =
      Number.isFinite(rawHeight) && rawHeight > 100
        ? `${rawHeight} cm`
        : Number.isFinite(rawHeight) && rawHeight > 1 && rawHeight < 3
          ? `${Math.round(rawHeight * 100)} cm`
          : undefined;

    const images = item?.images || person?.images || {};
    const image =
      images?.action || images?.headshot || images?.photo || undefined;

    players.push({
      id: `el-bb-${code}`,
      number: num,
      name,
      position,
      category,
      country: person?.country?.name || undefined,
      branch: "Basketbol",
      image,
      age: computeAgeFromBirthDate(person?.birthDate),
      height,
      source: "euroleague",
    });
  }

  return players.sort((a, b) => a.number - b.number);
}

export function attachEuroLeagueStats(
  athletes: Athlete[],
  statsJson: any,
): Athlete[] {
  const rows = Array.isArray(statsJson?.players)
    ? statsJson.players
    : Array.isArray(statsJson?.data)
      ? statsJson.data
      : Array.isArray(statsJson)
        ? statsJson
        : [];

  if (rows.length === 0) return athletes;

  const byCode = new Map<string, any>();
  const byName = new Map<string, any>();

  for (const row of rows) {
    const pObj = row?.player || row;
    const code = pObj?.code || pObj?.person?.code;
    const name = pObj?.name || pObj?.person?.name;
    if (code) byCode.set(String(code), row);
    if (name) byName.set(normalizePlayerLookupName(String(name)), row);
  }

  return athletes.map((athlete) => {
    const rawCode = athlete.id.replace(/^el-bb-/, "");
    const match =
      byCode.get(rawCode) || byName.get(normalizePlayerLookupName(athlete.name));
    if (!match) return athlete;

    const appearances = Number(match.gamesPlayed ?? match.played);
    const ppg = Number(match.pointsScored ?? match.points);
    const rpg = Number(match.totalRebounds ?? match.rebounds);
    const apg = Number(match.assists);
    const pir = Number(match.valuation ?? match.pir);

    const round1 = (n: number) => Math.round(n * 10) / 10;
    const stats: AthleteSeasonStats = {
      appearances: Number.isFinite(appearances) ? appearances : undefined,
      pointsPerGame: Number.isFinite(ppg) ? round1(ppg) : undefined,
      reboundsPerGame: Number.isFinite(rpg) ? round1(rpg) : undefined,
      assistsPerGame: Number.isFinite(apg) ? round1(apg) : undefined,
      pir: Number.isFinite(pir) ? round1(pir) : undefined,
      sourceLabel: "EuroLeague",
    };

    const hasNumeric =
      stats.appearances !== undefined ||
      stats.pointsPerGame !== undefined ||
      stats.reboundsPerGame !== undefined ||
      stats.assistsPerGame !== undefined ||
      stats.pir !== undefined;

    return hasNumeric ? { ...athlete, stats } : athlete;
  });
}
