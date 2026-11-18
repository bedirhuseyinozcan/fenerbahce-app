import { safeFetch } from "@/utils/safeFetch";

export interface MatchWeatherInfo {
  temperatureC: number;
  conditionLabel: string;
  emoji: string;
  windKmh: number;
}

let cachedWeather: { data: MatchWeatherInfo; ts: number } | null = null;
const WEATHER_TTL_MS = 15 * 60 * 1000;

function mapWmoCodeToTurkish(code: number): { label: string; emoji: string } {
  if (code === 0) return { label: "Açık", emoji: "☀️" };
  if (code >= 1 && code <= 3) return { label: "Parçalı Bulutlu", emoji: "⛅" };
  if (code >= 45 && code <= 48) return { label: "Sisli", emoji: "🌫️" };
  if (code >= 51 && code <= 67) return { label: "Yağmurlu", emoji: "🌧️" };
  if (code >= 71 && code <= 77) return { label: "Karlı", emoji: "❄️" };
  if (code >= 80 && code <= 82)
    return { label: "Sağanak Yağışlı", emoji: "🌦️" };
  if (code >= 95) return { label: "Fırtınalı", emoji: "⛈️" };
  return { label: "Maç Havası", emoji: "🌤️" };
}

export async function fetchKadikoyWeather(): Promise<MatchWeatherInfo | null> {
  if (cachedWeather && Date.now() - cachedWeather.ts < WEATHER_TTL_MS) {
    return cachedWeather.data;
  }

  try {
    const res = await safeFetch(
      "https://api.open-meteo.com/v1/forecast?latitude=40.9876&longitude=29.0369&current=temperature_2m,weather_code,wind_speed_10m&timezone=Europe%2FIstanbul",
    );
    if (!res || !res.ok) return null;
    const json = await res.json();
    const cur = json.current;
    if (!cur || typeof cur.temperature_2m !== "number") return null;

    const wmo = mapWmoCodeToTurkish(Number(cur.weather_code) || 0);
    const info: MatchWeatherInfo = {
      temperatureC: Math.round(cur.temperature_2m),
      conditionLabel: wmo.label,
      emoji: wmo.emoji,
      windKmh: Math.round(Number(cur.wind_speed_10m) || 0),
    };
    cachedWeather = { data: info, ts: Date.now() };
    return info;
  } catch {
    return null;
  }
}
