import {
  configureBridge,
  handleBridgeResponse,
  isPosBridgeConfigMessage,
  PROTOCOL_VERSION,
  resetBridge,
} from "@/services/pos-bridge";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

/**
 * Configures the embedded web POS bridge after settings hydration. Credentials
 * are never accepted through URLs or postMessage; standalone and native POS
 * continue to use credentials entered in Settings.
 */
export function usePosBridge() {
  const hasInitialized = useRef(false);
  const hasHydrated = useSettingsStore((state) => state._hasHydrated);

  useEffect(() => {
    if (Platform.OS !== "web" || !hasHydrated || hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;

    let isMounted = true;
    const handleMessage = (event: MessageEvent) => {
      if (isPosBridgeConfigMessage(event.data)) {
        if (window.parent !== window && event.source === window.parent) {
          // Keep bridge credentials runtime-only.
          configureBridge(
            event.source as Window,
            event.origin,
            event.data.merchantId.trim(),
          );
        }
        return;
      }

      // This only accepts responses from the already locked parent origin.
      handleBridgeResponse(event);
    };

    window.addEventListener("message", handleMessage);

    const initialize = () => {
      if (isMounted) {
        window.parent.postMessage(
          { type: "pos-ready", protocolVersion: PROTOCOL_VERSION },
          "*",
        );
      }
    };

    initialize();
    return () => {
      isMounted = false;
      window.removeEventListener("message", handleMessage);
      resetBridge("POS bridge listener was unmounted");
    };
  }, [hasHydrated]);
}
