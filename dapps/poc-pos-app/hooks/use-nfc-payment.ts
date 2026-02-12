import { useEffect, useRef, useCallback, useState } from "react";
import { NativeModules, Platform, AppState, AppStateStatus } from "react-native";
import { useNfcCapabilities, NfcMode } from "./use-nfc-capabilities";

const { HceModule, VasModule } = NativeModules;

interface UseNfcPaymentOptions {
  /** The payment URL to transmit via NFC */
  paymentUrl: string;
  /** Whether NFC transmission should be active */
  enabled: boolean;
  /** Callback when NFC is successfully set up */
  onNfcReady?: () => void;
  /** Callback when an error occurs */
  onNfcError?: (error: Error) => void;
}

interface UseNfcPaymentReturn {
  /** Whether NFC is currently active and transmitting */
  isNfcActive: boolean;
  /** Whether the device supports HCE mode (Android) */
  isHceMode: boolean;
  /** Whether the device supports VAS mode (iOS) */
  isVasMode: boolean;
  /** The active NFC mode */
  nfcMode: NfcMode;
  /** Whether NFC capabilities are still loading */
  isLoading: boolean;
  /** Start NFC transmission manually */
  startNfc: () => Promise<void>;
  /** Stop NFC transmission manually */
  stopNfc: () => Promise<void>;
  /** Update the payment URL while active */
  updateUrl: (url: string) => Promise<void>;
}

/**
 * Hook to manage NFC payment transmission
 *
 * This hook handles platform-specific NFC transmission:
 * - Android: HCE (Host Card Emulation) - emulates NFC tag with NDEF URL
 * - iOS: VAS (Value Added Services) - pushes URL via Tap to Pay
 *
 * Usage:
 * ```tsx
 * const { isNfcActive, nfcMode } = useNfcPayment({
 *   paymentUrl: 'https://pay.example.com/abc123',
 *   enabled: true,
 * });
 * ```
 */
export function useNfcPayment(options: UseNfcPaymentOptions): UseNfcPaymentReturn {
  const { paymentUrl, enabled, onNfcReady, onNfcError } = options;
  const capabilities = useNfcCapabilities();
  const [isNfcActive, setIsNfcActive] = useState(false);
  const currentUrlRef = useRef(paymentUrl);

  // Update URL ref when it changes
  useEffect(() => {
    currentUrlRef.current = paymentUrl;
  }, [paymentUrl]);

  // Start NFC for Android HCE
  const startHce = useCallback(async () => {
    if (Platform.OS !== "android" || !HceModule) {
      return false;
    }

    if (!capabilities.isHceSupported) {
      console.log("HCE not supported on this device");
      return false;
    }

    try {
      await HceModule.setPaymentUrl(currentUrlRef.current);
      console.log("NFC HCE started with URL:", currentUrlRef.current);
      return true;
    } catch (error) {
      console.error("Failed to start HCE:", error);
      throw error;
    }
  }, [capabilities.isHceSupported]);

  // Start NFC for iOS VAS
  const startVas = useCallback(async () => {
    if (Platform.OS !== "ios" || !VasModule) {
      return false;
    }

    if (!capabilities.isVasAvailable) {
      console.log("VAS not available on this device:", capabilities.vasReason);
      return false;
    }

    try {
      await VasModule.setPaymentUrl(currentUrlRef.current);
      console.log("NFC VAS started with URL:", currentUrlRef.current);
      return true;
    } catch (error) {
      console.error("Failed to start VAS:", error);
      throw error;
    }
  }, [capabilities.isVasAvailable, capabilities.vasReason]);

  // Unified start NFC function
  const startNfc = useCallback(async () => {
    try {
      let success = false;

      if (Platform.OS === "android") {
        success = await startHce();
      } else if (Platform.OS === "ios") {
        success = await startVas();
      }

      if (success) {
        setIsNfcActive(true);
        onNfcReady?.();
      }
    } catch (error) {
      onNfcError?.(error instanceof Error ? error : new Error("Failed to start NFC"));
    }
  }, [startHce, startVas, onNfcReady, onNfcError]);

  // Stop NFC for Android HCE
  const stopHce = useCallback(async () => {
    if (Platform.OS !== "android" || !HceModule) {
      return;
    }

    try {
      await HceModule.clearPaymentUrl();
      console.log("NFC HCE stopped");
    } catch (error) {
      console.error("Failed to stop HCE:", error);
    }
  }, []);

  // Stop NFC for iOS VAS
  const stopVas = useCallback(async () => {
    if (Platform.OS !== "ios" || !VasModule) {
      return;
    }

    try {
      await VasModule.clearPaymentUrl();
      console.log("NFC VAS stopped");
    } catch (error) {
      console.error("Failed to stop VAS:", error);
    }
  }, []);

  // Unified stop NFC function
  const stopNfc = useCallback(async () => {
    if (Platform.OS === "android") {
      await stopHce();
    } else if (Platform.OS === "ios") {
      await stopVas();
    }
    setIsNfcActive(false);
  }, [stopHce, stopVas]);

  // Update URL while NFC is active
  const updateUrl = useCallback(async (url: string) => {
    currentUrlRef.current = url;

    if (!isNfcActive) {
      return;
    }

    try {
      if (Platform.OS === "android" && HceModule) {
        await HceModule.setPaymentUrl(url);
        console.log("HCE URL updated:", url);
      } else if (Platform.OS === "ios" && VasModule) {
        await VasModule.setPaymentUrl(url);
        console.log("VAS URL updated:", url);
      }
    } catch (error) {
      console.error("Failed to update NFC URL:", error);
    }
  }, [isNfcActive]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active" && enabled && capabilities.nfcMode !== "none") {
        // Re-activate NFC when app comes to foreground
        startNfc();
      }
      // Note: We don't stop NFC when going to background
      // HCE continues to work in background on Android
      // VAS requires app to be in foreground on iOS
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [enabled, capabilities.nfcMode, startNfc]);

  // Start/stop based on enabled state and URL availability
  useEffect(() => {
    const canStart = !capabilities.isLoading &&
                     enabled &&
                     paymentUrl &&
                     capabilities.nfcMode !== "none";

    if (canStart) {
      startNfc();
    } else if (!enabled || !paymentUrl) {
      stopNfc();
    }

    return () => {
      stopNfc();
    };
  }, [enabled, paymentUrl, capabilities.isLoading, capabilities.nfcMode, startNfc, stopNfc]);

  // Update URL when it changes while active
  useEffect(() => {
    if (isNfcActive && paymentUrl) {
      updateUrl(paymentUrl);
    }
  }, [paymentUrl, isNfcActive, updateUrl]);

  return {
    isNfcActive,
    isHceMode: capabilities.isHceSupported,
    isVasMode: capabilities.isVasAvailable,
    nfcMode: capabilities.nfcMode,
    isLoading: capabilities.isLoading,
    startNfc,
    stopNfc,
    updateUrl,
  };
}
