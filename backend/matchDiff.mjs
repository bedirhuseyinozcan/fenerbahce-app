export function diffFootballSnapshot(prev, next) {
  if (!prev || !next) return [];

  const events = [];
  const scoreStr = `${next.homeTeam} ${next.homeScore} - ${next.awayScore} ${next.awayTeam}`;
  const clock = next.clock || "Canlı";

  if (next.state === "in" && prev.state === "pre") {
    events.push({
      eventKey: `${next.matchId}-kickoff`,
      type: "kickoff",
      matchId: next.matchId,
      title: "Fenerbahçe Maçı Başladı!",
      message: `İlk düdük çaldı! ${scoreStr}`,
      tags: "soccer,yellow_heart,blue_heart",
    });
  }

  const prevShort = String(prev.shortDetail || "").toUpperCase();
  const nextShort = String(next.shortDetail || "").toUpperCase();
  const isNowHT =
    next.state === "in" &&
    (nextShort === "HT" || nextShort.includes("HALFTIME"));
  const wasHT = prevShort === "HT" || prevShort.includes("HALFTIME");

  if (isNowHT && !wasHT) {
    events.push({
      eventKey: `${next.matchId}-ht`,
      type: "halftime",
      matchId: next.matchId,
      title: "İlk Yarı Sonucu",
      message: `Devre arası: ${scoreStr}`,
      tags: "stopwatch,yellow_heart,blue_heart",
    });
  }

  if (next.state === "in" && prev.state === "in") {
    const prevTotal = prev.homeScore + prev.awayScore;
    const nextTotal = next.homeScore + next.awayScore;

    if (nextTotal > prevTotal) {
      const scorerPart = next.latestGoalScorer
        ? `${next.latestGoalScorer}! `
        : "";
      events.push({
        eventKey: `${next.matchId}-goal-${next.homeScore}-${next.awayScore}`,
        type: "goal",
        matchId: next.matchId,
        title: next.latestGoalScorer
          ? `GOOOL! ${next.latestGoalScorer}`
          : "GOOOL! Skor Değişti!",
        message: `(${clock}) ${scorerPart}${scoreStr}`,
        tags: "soccer,yellow_heart,blue_heart",
      });
    } else if (nextTotal < prevTotal) {
      events.push({
        eventKey: `${next.matchId}-var-cancel-${prev.homeScore}-${prev.awayScore}-to-${next.homeScore}-${next.awayScore}`,
        type: "var-disallowed",
        matchId: next.matchId,
        title: "VAR İncelemesi: Gol İptal!",
        message: `(${clock}) Gol iptal edildi. Güncel skor: ${scoreStr}`,
        tags: "x,soccer,yellow_heart,blue_heart",
      });
    }
  }

  const prevCards = new Set(prev.redCardIds || []);
  for (const cardId of next.redCardIds || []) {
    if (!prevCards.has(cardId)) {
      events.push({
        eventKey: `${next.matchId}-red-${cardId}`,
        type: "red-card",
        matchId: next.matchId,
        title: "Kırmızı Kart!",
        message: `(${clock}) Kırmızı kart çıktı! ${scoreStr}`,
        tags: "red_square,soccer,yellow_heart,blue_heart",
      });
    }
  }

  if (next.state === "post" && prev.state === "in") {
    events.push({
      eventKey: `${next.matchId}-ft`,
      type: "fulltime",
      matchId: next.matchId,
      title: "Maç Sonucu!",
      message: `MS: ${scoreStr}`,
      tags: "checkered_flag,yellow_heart,blue_heart",
    });
  }

  return events;
}

export function diffEuroLeagueSnapshot(prev, next) {
  if (!prev || !next) return [];

  const events = [];
  const scoreStr = `${next.homeTeam} ${next.homeScore} - ${next.awayScore} ${next.awayTeam}`;

  if (next.state === "in" && prev.state === "pre") {
    events.push({
      eventKey: `${next.matchId}-tipoff`,
      type: "kickoff",
      matchId: next.matchId,
      title: "Fenerbahçe Beko Maçı Başladı!",
      message: `Hava atışı yapıldı! ${scoreStr}`,
      tags: "basketball,yellow_heart,blue_heart",
    });
  }

  if (
    next.state === "in" &&
    next.completedQuarters > (prev.completedQuarters || 0)
  ) {
    const q = next.completedQuarters;
    const qNote = next.lastQuarterScore ? ` (${next.lastQuarterScore})` : "";
    events.push({
      eventKey: `${next.matchId}-q${q}`,
      type: "quarter-end",
      matchId: next.matchId,
      title: `${q}. Çeyrek Sonucu`,
      message: `${scoreStr}${qNote}`,
      tags: "basketball,yellow_heart,blue_heart",
    });
  }

  if (next.state === "post" && prev.state === "in") {
    events.push({
      eventKey: `${next.matchId}-ft`,
      type: "fulltime",
      matchId: next.matchId,
      title: "EuroLeague Maç Sonucu!",
      message: `MS: ${scoreStr}`,
      tags: "checkered_flag,basketball,yellow_heart,blue_heart",
    });
  }

  return events;
}
