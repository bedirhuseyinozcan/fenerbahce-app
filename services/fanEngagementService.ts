import { MatchData, PredictionData } from "@/types";
import { Linking } from "react-native";

// Hafıza + Web localStorage hibrit sıfır maliyetli depolama (ek paket gerektirmez)
const memoryStore = new Map<string, string>();

function getItem(key: string): string | null {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // ignore
  }
  return memoryStore.get(key) ?? null;
}

function setItem(key: string, value: string): void {
  memoryStore.set(key, value);
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // ignore
  }
}

const PREDICTIONS_KEY = "fb_fan_predictions_v1";
const NTFY_TOPIC_KEY = "fb_ntfy_topic_v1";
const DEFAULT_NTFY_TOPIC = "fenerbahce-canli-1907";

export function getSavedPredictions(): Record<string, PredictionData> {
  const raw = getItem(PREDICTIONS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function getPredictionForMatch(matchId: string): PredictionData | null {
  const all = getSavedPredictions();
  return all[matchId] || null;
}

export function savePredictionForMatch(
  matchId: string,
  homeScore: number,
  awayScore: number,
): PredictionData {
  const all = getSavedPredictions();
  const entry: PredictionData = {
    matchId,
    homeScore,
    awayScore,
    createdAt: new Date().toISOString(),
  };
  all[matchId] = entry;
  setItem(PREDICTIONS_KEY, JSON.stringify(all));
  return entry;
}

export function calculatePredictionStats(matches: MatchData[]): {
  totalPredictions: number;
  exactHits: number;
  correctOutcomes: number;
  totalPoints: number;
} {
  const all = getSavedPredictions();
  let totalPredictions = 0;
  let exactHits = 0;
  let correctOutcomes = 0;
  let totalPoints = 0;

  Object.values(all).forEach((pred) => {
    totalPredictions += 1;
    const match = matches.find((m) => m.id === pred.matchId);
    if (
      match &&
      match.status === "finished" &&
      match.homeScore != null &&
      match.awayScore != null
    ) {
      const actualH = parseInt(String(match.homeScore), 10);
      const actualA = parseInt(String(match.awayScore), 10);
      if (!isNaN(actualH) && !isNaN(actualA)) {
        if (actualH === pred.homeScore && actualA === pred.awayScore) {
          exactHits += 1;
          totalPoints += 3;
        } else {
          const predDiff = Math.sign(pred.homeScore - pred.awayScore);
          const actualDiff = Math.sign(actualH - actualA);
          if (predDiff === actualDiff) {
            correctOutcomes += 1;
            totalPoints += 1;
          }
        }
      }
    }
  });

  return { totalPredictions, exactHits, correctOutcomes, totalPoints };
}

export function getNtfyTopic(): string {
  return getItem(NTFY_TOPIC_KEY) || DEFAULT_NTFY_TOPIC;
}

export function setNtfyTopic(topic: string): void {
  const cleaned = topic.trim().replace(/[^a-zA-Z0-9_-]/g, "");
  setItem(NTFY_TOPIC_KEY, cleaned || DEFAULT_NTFY_TOPIC);
}

export async function sendTestNtfyNotification(
  customMessage?: string,
): Promise<boolean> {
  const topic = getNtfyTopic();
  try {
    const res = await fetch(`https://ntfy.sh/${topic}`, {
      method: "POST",
      headers: {
        Title: "Fenerbahce Canli Skor",
        Priority: "high",
        Tags: "soccer,yellow_heart,blue_heart",
      },
      body:
        customMessage ||
        "GOOOL! 67' Fenerbahçe 2 - 1 (Canlı bildirim kanalı aktif!)",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function openNtfySubscription(): void {
  const topic = getNtfyTopic();
  Linking.openURL(`https://ntfy.sh/${topic}`);
}
