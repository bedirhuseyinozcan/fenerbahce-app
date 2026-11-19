import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("react-native", () => ({
  Platform: { OS: "ios" },
  Linking: { openURL: vi.fn() },
}));

import { savePredictionForMatch } from "@/services/fanEngagementService";
import {
  buildRoomLeaderboard,
  formatLeagueShareText,
  generateRoomCode,
  normalizeRoomCode,
} from "@/services/predictionLeagueService";
import { MatchData } from "@/types";
import { clearMemoryStorage } from "@/utils/storage";

const finishedDerby: MatchData = {
  id: "match-101",
  branch: "Futbol",
  competition: "Trendyol Süper Lig",
  homeTeam: "Fenerbahçe",
  awayTeam: "Galatasaray",
  homeScore: "2",
  awayScore: "1",
  date: "19 Kasım 2026",
  time: "20:00",
  stadium: "Ülker Stadyumu",
  status: "finished",
};

const upcomingMatch: MatchData = {
  id: "match-102",
  branch: "Futbol",
  competition: "UEFA Avrupa Ligi",
  homeTeam: "Fenerbahçe",
  awayTeam: "Porto",
  homeScore: null,
  awayScore: null,
  date: "26 Kasım 2026",
  time: "23:00",
  stadium: "Ülker Stadyumu",
  status: "upcoming",
};

describe("predictionLeagueService", () => {
  beforeEach(() => {
    clearMemoryStorage();
  });

  it("normalizes and generates valid room codes", () => {
    expect(normalizeRoomCode(" fb-1907! ")).toBe("FB1907");
    const generated = generateRoomCode();
    expect(generated).toMatch(/^FB[A-Z0-9]{4}$/);
  });

  it("scores remote participants cleanly and sorts by points then exact hits", () => {
    const board = buildRoomLeaderboard(
      [
        {
          roomCode: "FB1907",
          deviceId: "dev-2",
          nickname: "Efe",
          matchId: "match-101",
          homeScore: 1,
          awayScore: 0,
          createdAt: "2026-11-19T10:00:00Z",
        },
        {
          roomCode: "FB1907",
          deviceId: "dev-1",
          nickname: "Bedir",
          matchId: "match-101",
          homeScore: 2,
          awayScore: 1,
          createdAt: "2026-11-19T10:05:00Z",
        },
        {
          roomCode: "FB1907",
          deviceId: "dev-3",
          nickname: "Mert",
          matchId: "match-101",
          homeScore: 0,
          awayScore: 2,
          createdAt: "2026-11-19T10:10:00Z",
        },
      ],
      [finishedDerby, upcomingMatch],
      "dev-1",
      { nickname: "Bedir", roomCode: "FB1907" },
    );

    expect(board).toHaveLength(3);
    expect(board[0].nickname).toBe("Bedir");
    expect(board[0].totalPoints).toBe(3);
    expect(board[0].exactHits).toBe(1);
    expect(board[0].isMe).toBe(true);

    expect(board[1].nickname).toBe("Efe");
    expect(board[1].totalPoints).toBe(1);
    expect(board[1].correctOutcomes).toBe(1);

    expect(board[2].nickname).toBe("Mert");
    expect(board[2].totalPoints).toBe(0);
  });

  it("falls back to single-device local leaderboard when remote rows are empty", () => {
    savePredictionForMatch("match-101", 2, 1);

    const board = buildRoomLeaderboard(
      [],
      [finishedDerby, upcomingMatch],
      "dev-local",
      { nickname: "Can", roomCode: "FB1907" },
    );

    expect(board).toHaveLength(1);
    expect(board[0].nickname).toBe("Can");
    expect(board[0].totalPoints).toBe(3);
    expect(board[0].exactHits).toBe(1);
    expect(board[0].isMe).toBe(true);

    const text = formatLeagueShareText(
      { nickname: "Can", roomCode: "FB1907" },
      board,
      [finishedDerby, upcomingMatch],
    );
    expect(text).toContain("Oda Kodu: FB1907");
    expect(text).toContain("Can: 3P");
    expect(text).toContain("Porto");
  });
});
