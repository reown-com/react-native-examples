import { useLogsStore } from "@/store/useLogsStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { showInfoToast } from "@/utils/toast";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

/**
 * On web, reads merchantId and customerApiKey from URL query parameters,
 * base64-decodes them, saves to the settings store,
 * and cleans the URL. Runs once after store hydration.
 *
 * Values must be base64-encoded.
 */
export function useUrlCredentials() {
  const hasProcessed = useRef(false);
  const _hasHydrated = useSettingsStore((state) => state._hasHydrated);
  const setMerchantId = useSettingsStore((state) => state.setMerchantId);
  const setCustomerApiKey = useSettingsStore(
    (state) => state.setCustomerApiKey,
  );
  const addLog = useLogsStore((state) => state.addLog);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (!_hasHydrated) return;
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const params = new URLSearchParams(window.location.search);
    const rawMerchantId = params.get("merchantId");
    const rawCustomerApiKey = params.get("customerApiKey");

    if (!rawMerchantId && !rawCustomerApiKey) return;

    async function applyCredentials() {
      try {
        if (rawMerchantId) {
          const merchantId = atob(rawMerchantId);
          setMerchantId(merchantId);
          addLog(
            "info",
            "Merchant ID set from URL parameter",
            "layout",
            "useUrlCredentials",
          );
        }

        if (rawCustomerApiKey) {
          const customerApiKey = atob(rawCustomerApiKey);
          await setCustomerApiKey(customerApiKey);
          addLog(
            "info",
            "Customer API key set from URL parameter",
            "layout",
            "useUrlCredentials",
          );
        }

        showInfoToast("Credentials updated from URL");

        // Clean URL by navigating through Expo Router (replaceState alone
        // doesn't update Expo Router's internal state, so params reappear)
        router.replace("/");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        addLog(
          "error",
          `Failed to apply URL credentials: ${errorMessage}`,
          "layout",
          "useUrlCredentials",
          { error },
        );
      }
    }

    applyCredentials();
  }, [_hasHydrated, setMerchantId, setCustomerApiKey, addLog]);
}
