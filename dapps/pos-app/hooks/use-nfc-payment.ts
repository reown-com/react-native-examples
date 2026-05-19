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

  // Route callbacks through refs so consumers don't need to memoize them
  // and so the native tap listener is subscribed exactly once.
  const onNfcReadyRef = useRef(onNfcReady);
  const onNfcErrorRef = useRef(onNfcError);
  const onTapRef = useRef(onTap);
  useEffect(() => {
    onNfcReadyRef.current = onNfcReady;
    onNfcErrorRef.current = onNfcError;
    onTapRef.current = onTap;
  }, [onNfcReady, onNfcError, onTap]);

  useEffect(() => {
    const sub = HceModule.addTapListener(() => onTapRef.current?.());
    return () => sub.remove();
  }, []);

  const activate = useCallback(async (url: string) => {
    try {
      await HceModule.setPaymentUrl(url);
      lastActivatedUrlRef.current = url;
      setIsNfcActive(true);
      onNfcReadyRef.current?.();
    } catch (error) {
      onNfcErrorRef.current?.(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }, []);

  const deactivate = useCallback(async () => {
    try {
      await HceModule.clearPaymentUrl();
    } finally {
      lastActivatedUrlRef.current = null;
      setIsNfcActive(false);
    }
  }, []);

  // Sync HCE with `enabled` + `paymentUrl`.
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
    } else if (lastActivatedUrlRef.current !== null) {
      deactivate();
    }
  }, [
    enabled,
    paymentUrl,
    capabilities.isLoading,
    capabilities.nfcMode,
    activate,
    deactivate,
  ]);

  // Clear HCE when the hook unmounts (e.g. navigating away from the scan screen).
  useEffect(() => {
    return () => {
      if (lastActivatedUrlRef.current) {
        HceModule.clearPaymentUrl().catch(() => {});
        lastActivatedUrlRef.current = null;
      }
    };
  }, []);

  return {
    isNfcActive,
    nfcMode: capabilities.nfcMode,
    isLoading: capabilities.isLoading,
  };
}
