import {
  CommentaryImportance,
  CommentaryItem,
  EventType,
} from "@/types";

export function parseAndTranslateEspnEvent(
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
  const text = (k?.text || "").trim();
  const typeText = (k?.type?.text || "").toLowerCase();

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
  if (k?.team?.id) {
    team = k.team.id === homeComp?.id ? "home" : "away";
  } else if (text) {
    const homeName = (homeComp?.team?.displayName || "").toLowerCase();
    const awayName = (awayComp?.team?.displayName || "").toLowerCase();
    if (homeName && text.toLowerCase().includes(homeName)) team = "home";
    else if (awayName && text.toLowerCase().includes(awayName)) team = "away";
  }

  const getParticipant = () => {
    const p = k?.participants?.[0];
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

    const reason = cardDetailed?.[2]
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

    let assister: string | undefined;
    const p1 = k?.participants?.[1];
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

/**
 * Translates common English ESPN play-by-play commentary phrases into Turkish.
 */
export function translateCommentaryText(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const exactPairs: [RegExp, string][] = [
    [/^First Half begins\.?$/i, "İlk yarı başladı."],
    [/^Second Half begins/i, "İkinci yarı başladı"],
    [/^First Half ends/i, "İlk yarı sona erdi"],
    [/^Second Half ends/i, "İkinci yarı sona erdi"],
    [/^Match ends/i, "Karşılaşma sona erdi"],
    [/^Lineups are announced/i, "İlk 11'ler açıklandı"],
    [/^Delay in match/i, "Maçta duraklama"],
    [/^Delay over\.?\s*They are ready to continue\.?/i, "Oyun yeniden başladı."],
  ];

  for (const [pattern, replacement] of exactPairs) {
    if (pattern.test(trimmed)) {
      return trimmed.replace(pattern, replacement);
    }
  }

  return trimmed
    .replace(/^Goal!/i, "GOOOL!")
    .replace(/^Attempt saved\./i, "Şut kalecide kaldı:")
    .replace(/^Attempt missed\./i, "Şut auta gitti:")
    .replace(/^Attempt blocked\./i, "Şut savunmadan döndü:")
    .replace(/^Corner,/i, "Korner:")
    .replace(/^Offside,/i, "Ofsayt:")
    .replace(/^Foul by\s+/i, "Faul: ")
    .replace(/wins a free kick in the attacking half/gi, "hücum yarı alanında serbest vuruş kazandı")
    .replace(/wins a free kick in the defensive half/gi, "savunma yarı alanında serbest vuruş kazandı")
    .replace(/wins a free kick on the (left|right) wing/gi, "kanatta serbest vuruş kazandı")
    .replace(/is shown the yellow card for ([^.]+)\.?/gi, "sarı kart gördü ($1).")
    .replace(/is shown the yellow card\.?/gi, "sarı kart gördü.")
    .replace(/is shown the red card\.?/gi, "kırmızı kart gördü!")
    .replace(/converts the penalty with a/gi, "penaltıyı gole çevirdi:")
    .replace(/header from the centre of the box/gi, "ceza sahası içinden kafa vuruşu")
    .replace(/right footed shot from outside the box/gi, "ceza sahası dışından sağ ayak şut")
    .replace(/left footed shot from outside the box/gi, "ceza sahası dışından sol ayak şut")
    .replace(/right footed shot from the centre of the box/gi, "ceza sahası içinden sağ ayak şut")
    .replace(/left footed shot from the centre of the box/gi, "ceza sahası içinden sol ayak şut")
    .replace(/Assisted by/gi, "Asist:")
    .replace(/Substitution,\s*/gi, "Değişiklik: ")
    .replace(/\s+replaces\s+/gi, " oyuna girdi, çıkan: ")
    .replace(/\s+because of an injury/gi, " (sakatlık)")
    .replace(/Penalty conceded by/gi, "Penaltıya sebebiyet veren:")
    .replace(/VAR Decision:/gi, "VAR Kararı:")
    .replace(/Goal Disallowed/gi, "Gol İptal Edildi")
    .replace(/Goal Confirmed/gi, "Gol Onaylandı");
}

function classifyImportance(raw: string, item: any): CommentaryImportance {
  const lower = raw.toLowerCase();
  const typeText = String(item?.play?.type?.text || item?.type?.text || "").toLowerCase();

  if (
    item?.play?.scoringPlay ||
    lower.startsWith("goal!") ||
    typeText.includes("goal")
  ) {
    return "goal";
  }
  if (lower.includes("yellow card") || lower.includes("red card") || typeText.includes("card")) {
    return "card";
  }
  if (
    lower.includes("attempt") ||
    lower.includes("corner") ||
    lower.includes("penalty") ||
    lower.includes("hits the post") ||
    lower.includes("crossbar") ||
    lower.includes("var decision")
  ) {
    return "chance";
  }
  if (lower.includes("substitution") || typeText.includes("substitution")) {
    return "sub";
  }
  if (
    lower.includes("half begins") ||
    lower.includes("half ends") ||
    lower.includes("match ends")
  ) {
    return "whistle";
  }
  return "info";
}

/**
 * Parses ESPN match commentary entries into Turkish timeline items (newest first).
 */
export function parseEspnCommentary(
  rawCommentary: any[] | undefined,
  homeComp?: any,
  awayComp?: any,
): CommentaryItem[] {
  if (!Array.isArray(rawCommentary) || rawCommentary.length === 0) return [];

  const homeId = homeComp?.id ? String(homeComp.id) : "";
  const awayId = awayComp?.id ? String(awayComp.id) : "";

  const items: CommentaryItem[] = [];

  rawCommentary.forEach((entry: any, idx: number) => {
    const rawText = String(entry?.text || "").trim();
    if (!rawText) return;

    const clock = String(
      entry?.time?.displayValue || entry?.clock?.displayValue || "",
    ).trim();
    const minMatch = clock.match(/(\d+)/);
    const minute = minMatch ? parseInt(minMatch[1], 10) : 0;

    let team: "home" | "away" | undefined;
    const teamId = entry?.team?.id ? String(entry.team.id) : "";
    if (teamId && homeId && teamId === homeId) team = "home";
    else if (teamId && awayId && teamId === awayId) team = "away";

    items.push({
      id: String(entry?.id || `comm-${idx}`),
      clock: clock || (minute > 0 ? `${minute}'` : "•"),
      minute,
      text: translateCommentaryText(rawText),
      importance: classifyImportance(rawText, entry),
      team,
    });
  });

  return items.sort((a, b) => b.minute - a.minute);
}
