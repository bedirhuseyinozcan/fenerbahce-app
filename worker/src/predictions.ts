import type {
  FinishedMatchScore,
  PredictionRecord,
  WorkerLeaderboardEntry,
} from "./types";

export function normalizeRoomCode(raw: string): string {
  const cleaned = String(raw || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 16);
  return cleaned.length >= 3 ? cleaned : "";
}

export function normalizeNickname(raw: string): string {
  const cleaned = String(raw || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 24);
  return cleaned.length >= 2 ? cleaned : "";
}

export function evaluateScore(
  predHome: number,
  predAway: number,
  actualHome: number,
  actualAway: number,
): { status: "exact" | "outcome" | "miss"; points: 0 | 1 | 3 } {
  if (predHome === actualHome && predAway === actualAway) {
    return { status: "exact", points: 3 };
  }
  if (Math.sign(predHome - predAway) === Math.sign(actualHome - actualAway)) {
    return { status: "outcome", points: 1 };
  }
  return { status: "miss", points: 0 };
}

export function computeRoomLeaderboard(
  rows: PredictionRecord[],
  finishedMatches: FinishedMatchScore[],
): WorkerLeaderboardEntry[] {
  const scoreMap = new Map<string, FinishedMatchScore>();
  for (const m of finishedMatches) {
    if (
      m.matchId &&
      Number.isFinite(m.homeScore) &&
      Number.isFinite(m.awayScore)
    ) {
      scoreMap.set(String(m.matchId), m);
    }
  }

  const byDevice = new Map<
    string,
    WorkerLeaderboardEntry & { latestAt: string }
  >();

  for (const row of rows) {
    let entry = byDevice.get(row.device_id);
    if (!entry) {
      entry = {
        deviceId: row.device_id,
        nickname: row.nickname,
        totalPoints: 0,
        exactHits: 0,
        correctOutcomes: 0,
        totalPredictions: 0,
        scoredPredictions: 0,
        latestAt: row.created_at,
      };
      byDevice.set(row.device_id, entry);
    }

    if (row.created_at >= entry.latestAt && row.nickname) {
      entry.nickname = row.nickname;
      entry.latestAt = row.created_at;
    }

    entry.totalPredictions += 1;

    const finalScore = scoreMap.get(row.match_id);
    if (finalScore) {
      entry.scoredPredictions += 1;
      const evaluated = evaluateScore(
        row.home_score,
        row.away_score,
        finalScore.homeScore,
        finalScore.awayScore,
      );
      entry.totalPoints += evaluated.points;
      if (evaluated.status === "exact") {
        entry.exactHits += 1;
      } else if (evaluated.status === "outcome") {
        entry.correctOutcomes += 1;
      }
    }
  }

  return Array.from(byDevice.values())
    .map(({ latestAt: _ignored, ...rest }) => rest)
    .sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.exactHits !== a.exactHits) return b.exactHits - a.exactHits;
      if (b.correctOutcomes !== a.correctOutcomes) {
        return b.correctOutcomes - a.correctOutcomes;
      }
      return a.nickname.localeCompare(b.nickname, "tr");
    });
}
