import { useCallback, useEffect, useRef, useState } from "react";

import { HceModule } from "@/modules/hce";
import { NfcMode, useNfcCapabilities } from "./use-nfc-capabilities";

interface UseNfcPaymentOptions {
  paymentUrl: string;
  enabled: boolean;
  onNfcReady?: () => void;
  onNfcError?: (error: Error) => void;
  onTap?: () => void;
}

interface UseNfcPaymentReturn {
  isNfcActive: boolean;
  nfcMode: NfcMode;
  isLoading: boolean;
}

export function useNfcPayment(options: UseNfcPaymentOptions): UseNfcPaymentReturn {
  const { paymentUrl, enabled, onNfcReady, onNfcError, onTap } = options;
  const capabilities = useNfcCapabilities();
  const [isNfcActive, setIsNfcActive] = useState(false);
  const lastActivatedUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!onTap) return;
    const sub = HceModule.addTapListener(onTap);
    return () => sub.remove();
  }, [onTap]);

  const activate = useCallback(
    async (url: string) => {
      try {
        await HceModule.setPaymentUrl(url);
        lastActivatedUrlRef.current = url;
        setIsNfcActive(true);
        onNfcReady?.();
      } catch (error) {
        onNfcError?.(error instanceof Error ? error : new Error(String(error)));
      }
    },
    [onNfcReady, onNfcError],
  );

  const deactivate = useCallback(async () => {
    try {
      await HceModule.clearPaymentUrl();
    } finally {
      lastActivatedUrlRef.current = null;
      setIsNfcActive(false);
    }
  }, []);

  useEffect(() => {
    const canStart =
      !capabilities.isLoading &&
      enabled &&
      !!paymentUrl &&
      capabilities.nfcMode === "hce";

    if (canStart) {
      if (lastActivatedUrlRef.current !== paymentUrl) {
        activate(paymentUrl);
      }
    } else if (isNfcActive) {
      deactivate();
    }

    return () => {
      if (isNfcActive || lastActivatedUrlRef.current) {
        HceModule.clearPaymentUrl().catch(() => {});
        lastActivatedUrlRef.current = null;
      }
    };
  }, [
    enabled,
    paymentUrl,
    capabilities.isLoading,
    capabilities.nfcMode,
    activate,
    deactivate,
    isNfcActive,
  ]);

  return {
    isNfcActive,
    nfcMode: capabilities.nfcMode,
    isLoading: capabilities.isLoading,
  };
}
