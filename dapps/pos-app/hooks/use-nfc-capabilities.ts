import { useEffect, useState } from "react";
import { Platform } from "react-native";

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

  useEffect(() => {
    let cancelled = false;

    async function check() {
      if (Platform.OS !== "android" || !HceModule.isAvailable) {
        if (!cancelled) setCapabilities(UNSUPPORTED);
        return;
      }

      try {
        const result = await HceModule.getNfcCapabilities();
        if (cancelled) return;
        setCapabilities({
          isNfcSupported: result.isNfcSupported,
          isNfcEnabled: result.isNfcEnabled,
          isHceSupported: result.isHceSupported,
          nfcMode: result.isHceSupported ? "hce" : "none",
          isLoading: false,
        });
      } catch {
        if (!cancelled) setCapabilities(UNSUPPORTED);
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  return capabilities;
}
