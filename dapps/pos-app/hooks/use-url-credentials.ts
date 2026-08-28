import {
  configureBridge,
  handleBridgeResponse,
  PROTOCOL_VERSION,
  resetBridge,
} from "@/services/pos-bridge";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

type PosBridgeConfigMessage = {
  type: "pos-bridge-config";
  protocolVersion: typeof PROTOCOL_VERSION;
  merchantId: string;
};

function isBridgeConfigMessage(data: unknown): data is PosBridgeConfigMessage {
  if (!data || typeof data !== "object") return false;
  const message = data as Record<string, unknown>;
  return (
    message.type === "pos-bridge-config" &&
    message.protocolVersion === PROTOCOL_VERSION &&
    typeof message.merchantId === "string" &&
    message.merchantId.trim().length > 0
  );
}

/**
 * Configures the embedded web POS bridge after settings hydration. Credentials
 * are never accepted through URLs or postMessage; standalone and native POS
 * continue to use credentials entered in Settings.
 */
export function useUrlCredentials() {
  const hasInitialized = useRef(false);
  const hasHydrated = useSettingsStore((state) => state._hasHydrated);
  const setMerchantId = useSettingsStore((state) => state.setMerchantId);
  const clearCustomerApiKey = useSettingsStore(
    (state) => state.clearCustomerApiKey,
  );

  useEffect(() => {
    if (Platform.OS !== "web" || !hasHydrated || hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;

    let isMounted = true;
    const handleMessage = (event: MessageEvent) => {
      if (isBridgeConfigMessage(event.data)) {
        if (
          event.source === window.parent &&
          configureBridge(
            event.source as Window,
            event.origin,
            event.data.merchantId.trim(),
          )
        ) {
          // A bridge uses the dashboard's key outside this frame. Remove any
          // local key left by a direct or older embedded POS session.
          void clearCustomerApiKey().then(() => {
            if (isMounted) setMerchantId(event.data.merchantId.trim());
          });
        }
        return;
      }

      // This only accepts responses from the already locked parent origin.
      handleBridgeResponse(event);
    };

    window.addEventListener("message", handleMessage);

    const initialize = async () => {
      if (window.parent !== window) {
        // Do not retain an old local key while an embedded POS is waiting for
        // bridge configuration. No URL or legacy credential fallback exists.
        await clearCustomerApiKey();
      }

      if (isMounted) {
        window.parent.postMessage(
          { type: "pos-ready", protocolVersion: PROTOCOL_VERSION },
          "*",
        );
      }
    };

    void initialize();
    return () => {
      isMounted = false;
      window.removeEventListener("message", handleMessage);
      resetBridge("POS bridge listener was unmounted");
    };
  }, [clearCustomerApiKey, hasHydrated, setMerchantId]);
}
