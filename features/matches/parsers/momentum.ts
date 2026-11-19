import { MatchEvent, MatchMomentum, MatchStat } from "@/types";

function parseStatNumber(val: string | number): number {
  const cleaned = String(val).replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : 0;
}

export function computeMatchMomentum(
  stats: MatchStat[],
  events: MatchEvent[],
): MatchMomentum | null {
  if (stats.length === 0 && events.length === 0) {
    return null;
  }

  let homeWeight = 0;
  let awayWeight = 0;

  for (const stat of stats) {
    const label = stat.label.toLowerCase();
    const hVal = parseStatNumber(stat.homeValue);
    const aVal = parseStatNumber(stat.awayValue);
    if (hVal === 0 && aVal === 0) continue;

    let multiplier = 1;
    if (label.includes("topla oynama")) multiplier = 0.45;
    else if (label.includes("isabetli şut")) multiplier = 6;
    else if (label.includes("toplam şut")) multiplier = 2.5;
    else if (label.includes("korner")) multiplier = 2;
    else if (label.includes("çeyrek")) multiplier = 1.5;
    else continue;

    homeWeight += hVal * multiplier;
    awayWeight += aVal * multiplier;
  }

  for (const ev of events) {
    if (ev.type === "goal") {
      if (ev.team === "home") homeWeight += 12;
      else awayWeight += 12;
    } else if (ev.type === "red-card") {
      if (ev.team === "home") awayWeight += 8;
      else homeWeight += 8;
    }
  }

  const total = homeWeight + awayWeight;
  if (total <= 0) {
    return null;
  }

  const homePercentage = Math.min(
    90,
    Math.max(10, Math.round((homeWeight / total) * 100)),
  );
  const awayPercentage = 100 - homePercentage;

  let label = "Dengeli Mücadele";
  if (homePercentage >= 58) label = "Ev Sahibi Baskın";
  else if (awayPercentage >= 58) label = "Deplasman Baskın";

  return {
    homeScore: homePercentage,
    awayScore: awayPercentage,
    homePercentage,
    label,
  };
}
