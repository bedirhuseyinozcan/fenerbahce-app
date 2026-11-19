const memoryStore = new Map<string, string>();

function getNativeWebLocalStorage(): Storage | null {
  try {
    const ls = (globalThis as { localStorage?: Storage }).localStorage;
    if (
      ls &&
      typeof ls.getItem === "function" &&
      typeof ls.setItem === "function"
    ) {
      return ls;
    }
  } catch {}
  return null;
}

export function getString(key: string): string | null {
  const ls = getNativeWebLocalStorage();
  if (ls) {
    try {
      const value = ls.getItem(key);
      if (value !== null) {
        memoryStore.set(key, value);
        return value;
      }
    } catch {}
  }
  return memoryStore.get(key) ?? null;
}

export function setString(key: string, value: string): void {
  memoryStore.set(key, value);
  const ls = getNativeWebLocalStorage();
  if (ls) {
    try {
      ls.setItem(key, value);
    } catch {}
  }
}

export function removeKey(key: string): void {
  memoryStore.delete(key);
  const ls = getNativeWebLocalStorage();
  if (ls) {
    try {
      ls.removeItem(key);
    } catch {}
  }
}

export function getJson<T>(key: string): T | null {
  const raw = getString(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setJson<T>(key: string, value: T): void {
  try {
    setString(key, JSON.stringify(value));
  } catch {}
}

export function clearMemoryStorage(): void {
  memoryStore.clear();
}
