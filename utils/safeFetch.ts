import { Platform } from "react-native";

const DEFAULT_TIMEOUT_MS = 6500;

async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function safeFetch(
  url: string,
  init?: RequestInit,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<Response | null> {
  const candidates = url.includes("://site.api.espn.com/")
    ? [url, url.replace("://site.api.espn.com/", "://site.web.api.espn.com/")]
    : url.includes("://site.web.api.espn.com/")
      ? [url.replace("://site.web.api.espn.com/", "://site.api.espn.com/"), url]
      : [url];

  for (const targetUrl of candidates) {
    try {
      const res = await fetchWithTimeout(targetUrl, init, timeoutMs);
      if (res.ok) return res;
    } catch {}
  }

  if (
    Platform.OS === "web" &&
    (!init || !init.method || init.method === "GET")
  ) {
    const primaryUrl = candidates[0];
    const proxies = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(primaryUrl)}`,
      `https://corsproxy.io/?${encodeURIComponent(primaryUrl)}`,
    ];

    for (const proxyUrl of proxies) {
      try {
        const proxyRes = await fetchWithTimeout(proxyUrl, undefined, 4500);
        if (proxyRes.ok) return proxyRes;
      } catch {}
    }
  }

  return null;
}

export async function safeFetchJson<T = unknown>(
  url: string,
  init?: RequestInit,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<T | null> {
  const res = await safeFetch(url, init, timeoutMs);
  if (!res) return null;
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
