import { getMerchantAccounts, MerchantAccounts } from "@/api/merchant";
import { useLogsStore } from "@/store/useLogsStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { useCallback, useEffect, useRef, useState } from "react";

type ModalType = "none" | "pin-verify" | "pin-setup" | "confirm";

interface MerchantFlowState {
  merchantIdInput: string;
  merchantLookupResult: MerchantAccounts | null;
  merchantLookupError: string | null;
  isLoading: boolean;
  activeModal: ModalType;
  pinError: string | null;
  pendingMerchantId: string | null;
  pendingMerchantAccounts: MerchantAccounts | null;
}

const initialState: MerchantFlowState = {
  merchantIdInput: "",
  merchantLookupResult: null,
  merchantLookupError: null,
  isLoading: false,
  activeModal: "none",
  pinError: null,
  pendingMerchantId: null,
  pendingMerchantAccounts: null,
};

export function useMerchantFlow() {
  const storedMerchantId = useSettingsStore((state) => state.merchantId);
  const setMerchantId = useSettingsStore((state) => state.setMerchantId);
  const _hasHydrated = useSettingsStore((state) => state._hasHydrated);
  const pinHash = useSettingsStore((state) => state.pinHash);
  const isPinSet = useCallback(() => pinHash !== null, [pinHash]);
  const verifyPin = useSettingsStore((state) => state.verifyPin);
  const setPin = useSettingsStore((state) => state.setPin);
  const isLockedOut = useSettingsStore((state) => state.isLockedOut);
  const getLockoutRemainingSeconds = useSettingsStore(
    (state) => state.getLockoutRemainingSeconds,
  );
  const pinFailedAttempts = useSettingsStore(
    (state) => state.pinFailedAttempts,
  );
  const addLog = useLogsStore((state) => state.addLog);
  const hasRefetchedMerchant = useRef(false);
  const storedMerchantResult = useRef<MerchantAccounts | null>(null);

  const [state, setState] = useState<MerchantFlowState>({
    ...initialState,
    merchantIdInput: storedMerchantId ?? "",
  });

  // Sync input with stored value
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      merchantIdInput: storedMerchantId ?? "",
      merchantLookupResult: storedMerchantId ? prev.merchantLookupResult : null,
    }));
  }, [storedMerchantId]);

  const formatLockoutMessage = useCallback(() => {
    const remaining = getLockoutRemainingSeconds();
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `Too many failed attempts. Try again in ${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [getLockoutRemainingSeconds]);

  const fetchMerchantAccounts = useCallback(
    async (targetMerchantId: string): Promise<MerchantAccounts | null> => {
      const trimmedMerchantId = targetMerchantId.trim();
      setState((prev) => ({
        ...prev,
        isLoading: true,
        merchantLookupError: null,
      }));

      const data = await getMerchantAccounts(trimmedMerchantId);

      // Cache the result if fetching for the stored merchant
      if (data && trimmedMerchantId === storedMerchantId) {
        storedMerchantResult.current = data;
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        merchantLookupResult: data,
        merchantLookupError: data
          ? null
          : "Invalid merchant ID. Please verify and try again.",
      }));

      return data;
    },
    [storedMerchantId],
  );

  // Auto-fetch on mount if stored merchant exists
  useEffect(() => {
    if (hasRefetchedMerchant.current || !_hasHydrated || !storedMerchantId) {
      return;
    }

    hasRefetchedMerchant.current = true;
    fetchMerchantAccounts(storedMerchantId).catch((error) => {
      useLogsStore
        .getState()
        .addLog(
          "error",
          "Failed to fetch merchant accounts:",
          "merchant",
          "fetchMerchantAccounts",
          { error },
        );
    });
  }, [_hasHydrated, storedMerchantId, fetchMerchantAccounts]);

  const handleInputChange = useCallback(
    (value: string) => {
      const trimmedValue = value.trim();
      const isMatchingStoredMerchant = trimmedValue === storedMerchantId;

      setState((prev) => ({
        ...prev,
        merchantIdInput: value,
        merchantLookupError: null,
        // Restore cached result if input matches stored merchant, otherwise clear
        merchantLookupResult: isMatchingStoredMerchant
          ? storedMerchantResult.current
          : null,
      }));
    },
    [storedMerchantId],
  );

  const handleMerchantConfirm = useCallback(async () => {
    const trimmedMerchantId = state.merchantIdInput.trim();
    if (!trimmedMerchantId || state.isLoading) {
      return;
    }

    // Check if locked out
    if (isLockedOut()) {
      showErrorToast(formatLockoutMessage());
      return;
    }

    // First, verify the merchant ID with the API
    const accounts = await fetchMerchantAccounts(trimmedMerchantId);
    if (!accounts) {
      return;
    }

    // Store pending data for confirmation flow
    setState((prev) => ({
      ...prev,
      pendingMerchantId: trimmedMerchantId,
      pendingMerchantAccounts: accounts,
    }));

    // Check if this is a change to existing merchant (requires PIN verification)
    const isChangingMerchant =
      storedMerchantId && storedMerchantId !== trimmedMerchantId && isPinSet();

    if (isChangingMerchant) {
      setState((prev) => ({ ...prev, activeModal: "pin-verify" }));
    } else {
      setState((prev) => ({ ...prev, activeModal: "confirm" }));
    }
  }, [
    state.merchantIdInput,
    state.isLoading,
    isLockedOut,
    formatLockoutMessage,
    fetchMerchantAccounts,
    storedMerchantId,
    isPinSet,
  ]);

  const handlePinVerifyComplete = useCallback(
    (pin: string) => {
      if (verifyPin(pin)) {
        setState((prev) => ({
          ...prev,
          pinError: null,
          activeModal: "confirm",
        }));
      } else {
        if (isLockedOut()) {
          setState((prev) => ({ ...prev, activeModal: "none" }));
          showErrorToast(formatLockoutMessage());
        } else {
          const attemptsLeft = 3 - pinFailedAttempts;
          setState((prev) => ({
            ...prev,
            pinError: `Incorrect PIN. ${attemptsLeft} attempt${attemptsLeft !== 1 ? "s" : ""} remaining.`,
          }));
        }
      }
    },
    [verifyPin, isLockedOut, formatLockoutMessage, pinFailedAttempts],
  );

  const handleBiometricAuthSuccess = useCallback(() => {
    setState((prev) => ({
      ...prev,
      pinError: null,
      activeModal: "confirm",
    }));
  }, []);

  const handleBiometricAuthFailure = useCallback(() => {
    setState((prev) => ({
      ...prev,
      pinError: "Biometric authentication failed. Please use PIN.",
    }));
  }, []);

  const completeMerchantSave = useCallback(() => {
    if (state.pendingMerchantId) {
      setMerchantId(state.pendingMerchantId);
      showSuccessToast("Merchant ID saved successfully");
      addLog(
        "info",
        `Merchant ID updated to: ${state.pendingMerchantId}`,
        "settings",
        "completeMerchantSave",
      );
    }
    setState((prev) => ({
      ...prev,
      merchantLookupResult: prev.pendingMerchantAccounts,
      pendingMerchantId: null,
      pendingMerchantAccounts: null,
      activeModal: "none",
    }));
  }, [state.pendingMerchantId, setMerchantId, addLog]);

  const handleConfirmMerchant = useCallback(() => {
    // If PIN is not set, prompt user to create one
    if (!isPinSet()) {
      setState((prev) => ({ ...prev, activeModal: "pin-setup" }));
    } else {
      completeMerchantSave();
    }
  }, [isPinSet, completeMerchantSave]);

  const handlePinSetupComplete = useCallback(
    (pin: string) => {
      setPin(pin);
      completeMerchantSave();
      showSuccessToast("PIN set successfully");
    },
    [setPin, completeMerchantSave],
  );

  const handleCancelSecurityFlow = useCallback(() => {
    setState((prev) => ({
      ...prev,
      activeModal: "none",
      pinError: null,
      pendingMerchantId: null,
      pendingMerchantAccounts: null,
      merchantIdInput: storedMerchantId ?? "",
    }));
  }, [storedMerchantId]);

  const isConfirmDisabled =
    state.merchantIdInput.trim().length === 0 ||
    state.isLoading ||
    state.merchantIdInput.trim() === storedMerchantId;

  return {
    // State
    merchantIdInput: state.merchantIdInput,
    merchantLookupResult: state.merchantLookupResult,
    merchantLookupError: state.merchantLookupError,
    isLoading: state.isLoading,
    activeModal: state.activeModal,
    pinError: state.pinError,
    pendingMerchantId: state.pendingMerchantId,
    pendingMerchantAccounts: state.pendingMerchantAccounts,
    storedMerchantId,
    isConfirmDisabled,
    isPinSet,

    // Handlers
    handleInputChange,
    handleMerchantConfirm,
    handlePinVerifyComplete,
    handleBiometricAuthSuccess,
    handleBiometricAuthFailure,
    handleConfirmMerchant,
    handlePinSetupComplete,
    handleCancelSecurityFlow,
  };
}
