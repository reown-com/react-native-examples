import { useEffect, useState } from "react";
import { NativeModules, Platform } from "react-native";

const { HceModule, VasModule } = NativeModules;

export type NfcMode = "hce" | "vas" | "none";

export interface NfcCapabilities {
  /** Device has NFC hardware */
  isNfcSupported: boolean;
  /** NFC is turned on in settings */
  isNfcEnabled: boolean;
  /** Device supports Host Card Emulation (Android only) */
  isHceSupported: boolean;
  /** Device supports Apple VAS via Tap to Pay (iOS only) */
  isVasSupported: boolean;
  /** VAS is available and ready to use (entitlement configured) */
  isVasAvailable: boolean;
  /** The active NFC mode for this device */
  nfcMode: NfcMode;
  /** Still checking capabilities */
  isLoading: boolean;
  /** Error message if check failed */
  error: string | null;
  /** Reason for VAS unavailability (iOS only) */
  vasReason: string | null;
}

/**
 * Hook to check NFC capabilities of the device
 *
 * Returns platform-specific NFC capabilities:
 * - Android: HCE (Host Card Emulation) for NDEF tag emulation
 * - iOS: VAS (Value Added Services) via Tap to Pay on iPhone
 *
 * The `nfcMode` indicates which mode is available:
 * - "hce": Android HCE mode
 * - "vas": iOS VAS mode (Tap to Pay)
 * - "none": No NFC transmission available
 */
export function useNfcCapabilities(): NfcCapabilities {
  const [capabilities, setCapabilities] = useState<NfcCapabilities>({
    isNfcSupported: false,
    isNfcEnabled: false,
    isHceSupported: false,
    isVasSupported: false,
    isVasAvailable: false,
    nfcMode: "none",
    isLoading: true,
    error: null,
    vasReason: null,
  });

  useEffect(() => {
    async function checkCapabilities() {
      try {
        // iOS: Check VAS support via Tap to Pay
        if (Platform.OS === "ios") {
          if (!VasModule) {
            // VasModule not available - gracefully disable NFC features
            setCapabilities({
              isNfcSupported: true, // Modern iOS has NFC
              isNfcEnabled: true,
              isHceSupported: false, // iOS never supports HCE
              isVasSupported: false,
              isVasAvailable: false,
              nfcMode: "none",
              isLoading: false,
              error: null,
              vasReason: "VAS module not available",
            });
            return;
          }

          try {
            const result = await VasModule.getVasCapabilities();
            const isVasAvailable = result.isVasAvailable ?? false;

            setCapabilities({
              isNfcSupported: true,
              isNfcEnabled: true,
              isHceSupported: false,
              isVasSupported: result.isVasSupported ?? false,
              isVasAvailable,
              nfcMode: isVasAvailable ? "vas" : "none",
              isLoading: false,
              error: null,
              vasReason: result.reason ?? null,
            });
          } catch (error) {
            console.warn("VAS capabilities check failed:", error);
            setCapabilities({
              isNfcSupported: true,
              isNfcEnabled: true,
              isHceSupported: false,
              isVasSupported: false,
              isVasAvailable: false,
              nfcMode: "none",
              isLoading: false,
              error: null,
              vasReason: "Failed to check VAS capabilities",
            });
          }
          return;
        }

        // Android: Check HCE support
        if (Platform.OS === "android") {
          if (!HceModule) {
            // HceModule not available - gracefully disable NFC features
            setCapabilities({
              isNfcSupported: false,
              isNfcEnabled: false,
              isHceSupported: false,
              isVasSupported: false,
              isVasAvailable: false,
              nfcMode: "none",
              isLoading: false,
              error: null,
              vasReason: null,
            });
            return;
          }

          try {
            const result = await HceModule.getNfcCapabilities();
            const isHceSupported = result.isHceSupported ?? false;

            setCapabilities({
              isNfcSupported: result.isNfcSupported ?? false,
              isNfcEnabled: result.isNfcEnabled ?? false,
              isHceSupported,
              isVasSupported: false, // Android doesn't support VAS
              isVasAvailable: false,
              nfcMode: isHceSupported ? "hce" : "none",
              isLoading: false,
              error: null,
              vasReason: null,
            });
          } catch (error) {
            console.warn("NFC capabilities check failed:", error);
            setCapabilities({
              isNfcSupported: false,
              isNfcEnabled: false,
              isHceSupported: false,
              isVasSupported: false,
              isVasAvailable: false,
              nfcMode: "none",
              isLoading: false,
              error: null,
              vasReason: null,
            });
          }
          return;
        }

        // Other platforms (web, etc.)
        setCapabilities({
          isNfcSupported: false,
          isNfcEnabled: false,
          isHceSupported: false,
          isVasSupported: false,
          isVasAvailable: false,
          nfcMode: "none",
          isLoading: false,
          error: null,
          vasReason: null,
        });
      } catch (error) {
        // Catch-all for any unexpected errors
        console.warn("Unexpected error checking NFC capabilities:", error);
        setCapabilities({
          isNfcSupported: false,
          isNfcEnabled: false,
          isHceSupported: false,
          isVasSupported: false,
          isVasAvailable: false,
          nfcMode: "none",
          isLoading: false,
          error: null,
          vasReason: null,
        });
      }
    }

    checkCapabilities();
  }, []);

  return capabilities;
}
