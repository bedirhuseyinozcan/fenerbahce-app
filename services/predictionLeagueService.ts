import {
  calculatePredictionStats,
  evaluatePredictionResult,
  getSavedPredictions,
} from "@/services/fanEngagementService";
import {
  getNotificationPrefs,
  getOrCreateDeviceId,
} from "@/services/notificationPrefs";
import {
  LeaderboardEntry,
  MatchData,
  PredictionLeagueProfile,
  RemotePredictionRow,
} from "@/types";
import { getJson, setJson } from "@/utils/storage";

const LEAGUE_PROFILE_KEY = "fb_prediction_league_profile_v1";

export function normalizeRoomCode(raw: string): string {
  return String(raw || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 16);
}

export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `FB${suffix}`;
}

export function getLeagueProfile(): PredictionLeagueProfile {
  const stored = getJson<Partial<PredictionLeagueProfile>>(LEAGUE_PROFILE_KEY);
  return {
    nickname: typeof stored?.nickname === "string" ? stored.nickname : "",
    roomCode:
      typeof stored?.roomCode === "string"
        ? normalizeRoomCode(stored.roomCode)
        : "",
  };
}

export function saveLeagueProfile(
  patch: Partial<PredictionLeagueProfile>,
): PredictionLeagueProfile {
  const current = getLeagueProfile();
  const next: PredictionLeagueProfile = {
    nickname:
      patch.nickname !== undefined
        ? patch.nickname.trim().replace(/\s+/g, " ").slice(0, 24)
        : current.nickname,
    roomCode:
      patch.roomCode !== undefined
        ? normalizeRoomCode(patch.roomCode)
        : current.roomCode,
  };
  setJson(LEAGUE_PROFILE_KEY, next);
  return next;
}

export function buildRoomLeaderboard(
  remoteRows: RemotePredictionRow[],
  matches: MatchData[],
  myDeviceId: string,
  myProfile: PredictionLeagueProfile,
): LeaderboardEntry[] {
  const matchMap = new Map<string, MatchData>();
  for (const m of matches) {
    matchMap.set(m.id, m);
  }

  if (remoteRows.length === 0) {
    const localStats = calculatePredictionStats(matches);
    const localPreds = Object.values(getSavedPredictions());
    let scoredCount = 0;
    for (const p of localPreds) {
      const m = matchMap.get(p.matchId);
      if (m && evaluatePredictionResult(p, m).status !== "pending") {
        scoredCount += 1;
      }
    }
    return [
      {
        deviceId: myDeviceId,
        nickname: myProfile.nickname || "Sen (Yerel)",
        totalPoints: localStats.totalPoints,
        exactHits: localStats.exactHits,
        correctOutcomes: localStats.correctOutcomes,
        totalPredictions: localStats.totalPredictions,
        scoredPredictions: scoredCount,
        isMe: true,
      },
    ];
  }

  const map = new Map<string, LeaderboardEntry & { latestAt: string }>();

  for (const row of remoteRows) {
    let entry = map.get(row.deviceId);
    if (!entry) {
      entry = {
        deviceId: row.deviceId,
        nickname: row.nickname,
        totalPoints: 0,
        exactHits: 0,
        correctOutcomes: 0,
        totalPredictions: 0,
        scoredPredictions: 0,
        isMe: row.deviceId === myDeviceId,
        latestAt: row.createdAt,
      };
      map.set(row.deviceId, entry);
    }

    if (row.createdAt >= entry.latestAt && row.nickname) {
      entry.nickname = row.nickname;
      entry.latestAt = row.createdAt;
    }

    entry.totalPredictions += 1;
    const match = matchMap.get(row.matchId);
    if (!match) continue;

    const evaluated = evaluatePredictionResult(
      {
        matchId: row.matchId,
        homeScore: row.homeScore,
        awayScore: row.awayScore,
        createdAt: row.createdAt,
      },
      match,
    );

    if (evaluated.status !== "pending") {
      entry.scoredPredictions += 1;
      entry.totalPoints += evaluated.points;
      if (evaluated.status === "exact") {
        entry.exactHits += 1;
      } else if (evaluated.status === "outcome") {
        entry.correctOutcomes += 1;
      }
    }
  }

  return Array.from(map.values())
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

function getWorkerBaseUrl(): string {
  return (getNotificationPrefs().workerBaseUrl || "").trim().replace(/\/+$/, "");
}

export async function syncPredictionToWorker(
  matchId: string,
  homeScore: number,
  awayScore: number,
): Promise<{ synced: boolean; message: string }> {
  const baseUrl = getWorkerBaseUrl();
  const profile = getLeagueProfile();
  if (!baseUrl) {
    return {
      synced: false,
      message: "Yerel kaydedildi (Oda eşitleme için Worker URL girilmedi).",
    };
  }
  if (profile.roomCode.length < 3 || profile.nickname.length < 2) {
    return {
      synced: false,
      message: "Yerel kaydedildi (Oda senkronu için Tahmin Ligi'nden takma ad ve oda seç).",
    };
  }

  try {
    const res = await fetch(`${baseUrl}/predictions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomCode: profile.roomCode,
        deviceId: getOrCreateDeviceId(),
        nickname: profile.nickname,
        matchId,
        homeScore,
        awayScore,
      }),
    });
    if (!res.ok) {
      const errJson: any = await res.json().catch(() => null);
      return {
        synced: false,
        message: errJson?.error || `Sunucu HTTP ${res.status} döndü.`,
      };
    }
    return {
      synced: true,
      message: `☁️ ${profile.roomCode} odasına eşitlendi!`,
    };
  } catch {
    return {
      synced: false,
      message: "Yerel kaydedildi (Worker'a erişilemedi).",
    };
  }
}

export async function syncAllLocalPredictionsToWorker(): Promise<{
  syncedCount: number;
  message: string;
}> {
  const baseUrl = getWorkerBaseUrl();
  const profile = getLeagueProfile();
  if (!baseUrl) {
    return { syncedCount: 0, message: "Worker URL yapılandırılmamış." };
  }
  if (profile.roomCode.length < 3 || profile.nickname.length < 2) {
    return {
      syncedCount: 0,
      message: "Önce en az 2 harfli takma ad ve 3 karakterli oda kodu kaydet.",
    };
  }

  const all = Object.values(getSavedPredictions());
  if (all.length === 0) {
    return { syncedCount: 0, message: "Gönderilecek yerel tahmin yok." };
  }

  const deviceId = getOrCreateDeviceId();
  let syncedCount = 0;

  const chunkSize = 8;
  for (let i = 0; i < all.length; i += chunkSize) {
    const slice = all.slice(i, i + chunkSize);
    const results = await Promise.all(
      slice.map(async (p) => {
        try {
          const res = await fetch(`${baseUrl}/predictions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              roomCode: profile.roomCode,
              deviceId,
              nickname: profile.nickname,
              matchId: p.matchId,
              homeScore: p.homeScore,
              awayScore: p.awayScore,
            }),
          });
          return res.ok;
        } catch {
          return false;
        }
      }),
    );
    syncedCount += results.filter(Boolean).length;
  }

  return {
    syncedCount,
    message: `☁️ ${syncedCount}/${all.length} tahmin '${profile.roomCode}' odasına aktarıldı.`,
  };
}

export async function fetchRoomPredictions(roomCodeInput?: string): Promise<{
  ok: boolean;
  predictions: RemotePredictionRow[];
  message: string;
}> {
  const baseUrl = getWorkerBaseUrl();
  const code = normalizeRoomCode(roomCodeInput ?? getLeagueProfile().roomCode);
  if (!baseUrl) {
    return {
      ok: false,
      predictions: [],
      message: "Yerel mod (Cloudflare Worker URL bağlı değil).",
    };
  }
  if (code.length < 3) {
    return {
      ok: false,
      predictions: [],
      message: "Geçerli bir oda kodu gir (ör. FB1907).",
    };
  }

  try {
    const res = await fetch(
      `${baseUrl}/rooms/${encodeURIComponent(code)}/predictions`,
    );
    if (!res.ok) {
      return {
        ok: false,
        predictions: [],
        message: `Oda verisi alınamadı (HTTP ${res.status}).`,
      };
    }
    const json: any = await res.json();
    const rawList: any[] = Array.isArray(json?.predictions)
      ? json.predictions
      : [];
    const predictions: RemotePredictionRow[] = rawList.map((r) => ({
      roomCode: String(r.room_code || code),
      deviceId: String(r.device_id || ""),
      nickname: String(r.nickname || "Taraftar"),
      matchId: String(r.match_id || ""),
      homeScore: Number(r.home_score ?? 0),
      awayScore: Number(r.away_score ?? 0),
      createdAt: String(r.created_at || ""),
    }));

    return {
      ok: true,
      predictions,
      message:
        predictions.length > 0
          ? `✅ ${code} odasında ${predictions.length} tahmin yüklendi.`
          : `ℹ️ ${code} odasında henüz tahmin yok. İlk tahmini sen yap!`,
    };
  } catch (err: any) {
    return {
      ok: false,
      predictions: [],
      message: `❌ Oda çekilemedi: ${err?.message || "Ağ hatası"}`,
    };
  }
}

export function formatLeagueShareText(
  profile: PredictionLeagueProfile,
  leaderboard: LeaderboardEntry[],
  matches: MatchData[],
): string {
  const roomLine = profile.roomCode
    ? `Oda Kodu: ${profile.roomCode}`
    : "Yerel Tahmin Karnem";
  const topLines = leaderboard.slice(0, 5).map((entry, idx) => {
    const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}.`;
    return `${medal} ${entry.nickname}: ${entry.totalPoints}P (${entry.exactHits} Tam / ${entry.correctOutcomes} Sonuç)`;
  });

  const upcomingMatch = matches.find(
    (m) => m.status !== "finished" && m.homeScore == null,
  );
  const nextLine = upcomingMatch
    ? `\nSıradaki Maç: ${upcomingMatch.homeTeam} - ${upcomingMatch.awayTeam}`
    : "";

  return [
    "🏆 Fenerbahçe Arkadaş Tahmin Ligi",
    roomLine,
    "",
    ...topLines,
    nextLine,
    "\nSen de tahmini kaydet ve sıralamaya katıl! 💛💙",
  ]
    .filter((line, i, arr) => !(line === "" && arr[i - 1] === ""))
    .join("\n");
}
