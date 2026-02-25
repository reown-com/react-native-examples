import { useLogsStore } from "@/store/useLogsStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { showInfoToast } from "@/utils/toast";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

/**
 * On web, reads merchantId and partnerApiKey from URL query parameters,
 * base64-decodes them, saves to the settings store,
 * and cleans the URL. Runs once after store hydration.
 *
 * Values must be base64-encoded.
 */
export function useUrlCredentials() {
  const hasProcessed = useRef(false);
  const _hasHydrated = useSettingsStore((state) => state._hasHydrated);
  const setMerchantId = useSettingsStore((state) => state.setMerchantId);
  const setPartnerApiKey = useSettingsStore((state) => state.setPartnerApiKey);
  const addLog = useLogsStore((state) => state.addLog);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (!_hasHydrated) return;
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const params = new URLSearchParams(window.location.search);
    const rawMerchantId = params.get("merchantId");
    const rawPartnerApiKey = params.get("partnerApiKey");

    if (!rawMerchantId && !rawPartnerApiKey) return;

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

        if (rawPartnerApiKey) {
          const partnerApiKey = atob(rawPartnerApiKey);
          await setPartnerApiKey(partnerApiKey);
          addLog(
            "info",
            "Partner API key set from URL parameter",
            "layout",
            "useUrlCredentials",
          );
        }

        showInfoToast("Credentials updated from URL");

        // Clean URL by removing the credential query parameters
        const url = new URL(window.location.href);
        url.searchParams.delete("merchantId");
        url.searchParams.delete("partnerApiKey");
        window.history.replaceState({}, "", url.toString());
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
  }, [_hasHydrated, setMerchantId, setPartnerApiKey, addLog]);
}
