/**
 * Store Test Helpers
 * Utilities for testing Zustand stores
 */

import { useSettingsStore } from "@/store/useSettingsStore";
import { useLogsStore } from "@/store/useLogsStore";

/**
 * Reset the settings store to initial state
 */
export function resetSettingsStore() {
  useSettingsStore.setState({
    themeMode: "light",
    deviceId: "",
    variant: "default",
    _hasHydrated: false,
    merchantId: null,
    isMerchantApiKeySet: false,
    pinFailedAttempts: 0,
    pinLockoutUntil: null,
    biometricEnabled: false,
  });
}

/**
 * Reset the logs store to initial state
 */
export function resetLogsStore() {
  useLogsStore.setState({
    logs: [],
    _hasHydrated: false,
  });
}

/**
 * Reset all stores
 */
export function resetAllStores() {
  resetSettingsStore();
  resetLogsStore();
}

/**
 * Set up a test merchant configuration
 */
export async function setupTestMerchant(
  merchantId: string = "test-merchant-id",
  apiKey: string = "test-api-key",
) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const SecureStore = require("expo-secure-store");
  await SecureStore.setItemAsync("merchant_api_key", apiKey);

  useSettingsStore.setState({
    merchantId,
    isMerchantApiKeySet: true,
  });
}

/**
 * Clear test merchant configuration
 */
export async function clearTestMerchant() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const SecureStore = require("expo-secure-store");
  await SecureStore.deleteItemAsync("merchant_api_key");

  useSettingsStore.setState({
    merchantId: null,
    isMerchantApiKeySet: false,
  });
}
