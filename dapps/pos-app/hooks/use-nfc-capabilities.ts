import { useCallback, useEffect, useState } from "react";
import { AppState, Platform } from "react-native";

import { HceModule } from "@/modules/hce";

export type NfcMode = "hce" | "none";

export interface NfcCapabilities {
  isNfcSupported: boolean;
  isNfcEnabled: boolean;
  isHceSupported: boolean;
  nfcMode: NfcMode;
  isLoading: boolean;
}

const UNSUPPORTED: NfcCapabilities = {
  isNfcSupported: false,
  isNfcEnabled: false,
  isHceSupported: false,
  nfcMode: "none",
  isLoading: false,
};

export function useNfcCapabilities(): NfcCapabilities {
  const [capabilities, setCapabilities] = useState<NfcCapabilities>({
    ...UNSUPPORTED,
    isLoading: true,
  });

  const check = useCallback(async () => {
    if (Platform.OS !== "android" || !HceModule.isAvailable) {
      setCapabilities(UNSUPPORTED);
      return;
    }
    try {
      const result = await HceModule.getNfcCapabilities();
      setCapabilities({
        isNfcSupported: result.isNfcSupported,
        isNfcEnabled: result.isNfcEnabled,
        isHceSupported: result.isHceSupported,
        nfcMode: result.isHceSupported ? "hce" : "none",
        isLoading: false,
      });
    } catch {
      setCapabilities(UNSUPPORTED);
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  // The OS-level NFC toggle or HCE availability can change while we're
  // backgrounded — re-query when the app comes back to the foreground.
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        check();
      }
    });
    return () => sub.remove();
  }, [check]);

  return capabilities;
}
