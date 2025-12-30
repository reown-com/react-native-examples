import * as SecureStore from "expo-secure-store";
import { storage } from "./storage";

const KEYS = {
  MERCHANT_API_KEY: "merchant_api_key",
  PIN_HASH: "pin_hash",
} as const;

const FRESH_INSTALL_KEY = "app_has_launched";

export async function clearStaleSecureStorage(): Promise<void> {
  const hasLaunchedBefore = storage.getItem<boolean>(FRESH_INSTALL_KEY);

  if (!hasLaunchedBefore) {
    await SecureStore.deleteItemAsync(KEYS.MERCHANT_API_KEY);
    await SecureStore.deleteItemAsync(KEYS.PIN_HASH);

    storage.setItem(FRESH_INSTALL_KEY, true);
  }
}

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`Error getting secure item`, error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error(`Error setting secure item`, error);
      throw error;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error(`Error removing secure item`, error);
    }
  },
};

export const SECURE_STORAGE_KEYS = KEYS;
