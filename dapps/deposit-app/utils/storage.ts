import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Tiny typed JSON wrapper over AsyncStorage (localStorage-backed on web). Used
 * to cache the on-chain portfolio (rate-limited to one refresh per hour) and the
 * deposits made through the flow, so both survive a reload.
 */
export const STORAGE_KEYS = {
  portfolio: 'deposit-app:portfolio',
  deposits: 'deposit-app:deposits',
} as const;

/** Balance is refetched from the network at most once per hour. */
export const BALANCE_TTL_MS = 60 * 60 * 1000;

export async function getJSON<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function setJSON(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Best-effort; ignore storage failures.
  }
}

export async function removeKeys(keys: string[]): Promise<void> {
  try {
    await AsyncStorage.multiRemove(keys);
  } catch {
    // Best-effort; ignore storage failures.
  }
}
