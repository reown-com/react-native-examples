import { useLogsStore } from "@/store/useLogsStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { showInfoToast } from "@/utils/toast";
import { router } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";

/**
 * On web, accepts credentials via two methods (in priority order):
 *
 * 1. **postMessage** — parent/opener sends `{ type: "pos-credentials", merchantId?, customerApiKey? }`
 *    Values are plain text (no encoding needed).
 *
 * 2. **URL query parameters** — `?merchantId=<base64>&customerApiKey=<base64>`
 *    Values must be base64-encoded. Acts as fallback when postMessage is not used.
 *
 * Both methods overwrite any previously stored credentials.
 * Runs after store hydration; URL params are processed once, postMessage listener
 * stays active until unmount.
 */
export function useUrlCredentials() {
  const hasProcessedParams = useRef(false);
  const _hasHydrated = useSettingsStore((state) => state._hasHydrated);
  const setMerchantId = useSettingsStore((state) => state.setMerchantId);
  const setCustomerApiKey = useSettingsStore(
    (state) => state.setCustomerApiKey,
  );
  const addLog = useLogsStore((state) => state.addLog);

  const applyCredentials = useCallback(
    async (
      merchantId: string | null,
      customerApiKey: string | null,
      source: string,
    ) => {
      try {
        if (merchantId) {
          setMerchantId(merchantId);
          addLog(
            "info",
            `Merchant ID set from ${source}`,
            "layout",
            "useUrlCredentials",
          );
        }

        if (customerApiKey) {
          await setCustomerApiKey(customerApiKey);
          addLog(
            "info",
            `Customer API key set from ${source}`,
            "layout",
            "useUrlCredentials",
          );
        }

        showInfoToast("Credentials updated");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        addLog(
          "error",
          `Failed to apply credentials from ${source}: ${errorMessage}`,
          "layout",
          "useUrlCredentials",
          { error },
        );
      }
    },
    [setMerchantId, setCustomerApiKey, addLog],
  );

  // URL query parameters (fallback, processed once)
  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (!_hasHydrated) return;
    if (hasProcessedParams.current) return;
    hasProcessedParams.current = true;

    const params = new URLSearchParams(window.location.search);
    const rawMerchantId = params.get("merchantId");
    const rawCustomerApiKey = params.get("customerApiKey");

    if (!rawMerchantId && !rawCustomerApiKey) return;

    const merchantId = rawMerchantId ? atob(rawMerchantId) : null;
    const customerApiKey = rawCustomerApiKey ? atob(rawCustomerApiKey) : null;

    applyCredentials(merchantId, customerApiKey, "URL parameter").then(() => {
      router.replace("/");
    });
  }, [_hasHydrated, applyCredentials]);

  // postMessage listener (stays active until unmount)
  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (!_hasHydrated) return;

    function handleMessage(event: MessageEvent) {
      if (
        !event.data ||
        typeof event.data !== "object" ||
        event.data.type !== "pos-credentials"
      ) {
        return;
      }

      const { merchantId, customerApiKey } = event.data;
      if (!merchantId && !customerApiKey) return;

      applyCredentials(
        merchantId ?? null,
        customerApiKey ?? null,
        "postMessage",
      );
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [_hasHydrated, applyCredentials]);
}
