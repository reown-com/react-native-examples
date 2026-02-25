import { useLogsStore } from "@/store/useLogsStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

/**
 * Decodes a value that may be base64 encoded.
 * Tries base64 decoding first; if it fails, returns the raw value.
 */
export function tryBase64Decode(value: string): string {
  try {
    const decoded = atob(value);
    // Sanity check: if decoding produces control characters, the input was likely not base64
    if (/[\x00-\x08\x0E-\x1F]/.test(decoded)) {
      return value;
    }
    return decoded;
  } catch {
    return value;
  }
}

/**
 * On web, reads merchantId and partnerApiKey from URL query parameters,
 * base64-decodes them, saves to the settings store,
 * and cleans the URL. Runs once after store hydration.
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
          const merchantId = tryBase64Decode(rawMerchantId);
          setMerchantId(merchantId);
          addLog(
            "info",
            "Merchant ID set from URL parameter",
            "layout",
            "useUrlCredentials",
          );
        }

        if (rawPartnerApiKey) {
          const partnerApiKey = tryBase64Decode(rawPartnerApiKey);
          await setPartnerApiKey(partnerApiKey);
          addLog(
            "info",
            "Partner API key set from URL parameter",
            "layout",
            "useUrlCredentials",
          );
        }

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
