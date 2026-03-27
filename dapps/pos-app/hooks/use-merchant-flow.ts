import { useLogsStore } from "@/store/useLogsStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { useCallback, useEffect, useState } from "react";

type ModalType = "none" | "pin-verify" | "pin-setup";
type PendingAction = "merchant-id" | "customer-api-key" | null;

interface MerchantFlowState {
  merchantIdInput: string;
  customerApiKeyInput: string;
  activeModal: ModalType;
  pinError: string | null;
  pendingValue: string | null;
  pendingAction: PendingAction;
}

const initialState: MerchantFlowState = {
  merchantIdInput: "",
  customerApiKeyInput: "",
  activeModal: "none",
  pinError: null,
  pendingValue: null,
  pendingAction: null,
};

export function useMerchantFlow() {
  const storedMerchantId = useSettingsStore((state) => state.merchantId);
  const setMerchantId = useSettingsStore((state) => state.setMerchantId);
  const clearMerchantId = useSettingsStore((state) => state.clearMerchantId);
  const setCustomerApiKey = useSettingsStore(
    (state) => state.setCustomerApiKey,
  );
  const isCustomerApiKeySet = useSettingsStore(
    (state) => state.isCustomerApiKeySet,
  );
  const isPinSet = useSettingsStore((state) => state.isPinSet);
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

  const [state, setState] = useState<MerchantFlowState>({
    ...initialState,
    merchantIdInput: storedMerchantId ?? "",
  });

  // Sync merchant ID input with stored value
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      merchantIdInput: storedMerchantId ?? "",
    }));
  }, [storedMerchantId]);

  const formatLockoutMessage = useCallback(() => {
    const remaining = getLockoutRemainingSeconds();
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `Too many failed attempts. Try again in ${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [getLockoutRemainingSeconds]);

  const handleMerchantIdInputChange = useCallback((value: string) => {
    setState((prev) => ({
      ...prev,
      merchantIdInput: value,
    }));
  }, []);

  const handleCustomerApiKeyInputChange = useCallback((value: string) => {
    setState((prev) => ({
      ...prev,
      customerApiKeyInput: value,
    }));
  }, []);

  const resetCustomerApiKeyInput = useCallback(() => {
    setState((prev) => ({
      ...prev,
      customerApiKeyInput: "",
    }));
  }, []);

  const initiateSave = useCallback(
    (value: string, action: PendingAction) => {
      // Check if locked out
      if (isLockedOut()) {
        showErrorToast(formatLockoutMessage());
        return;
      }

      const pinExists = isPinSet();

      setState((prev) => ({
        ...prev,
        pendingValue: value,
        pendingAction: action,
        activeModal: pinExists ? "pin-verify" : "pin-setup",
      }));
    },
    [isLockedOut, formatLockoutMessage, isPinSet],
  );

  const handleMerchantIdConfirm = useCallback(() => {
    const trimmedMerchantId = state.merchantIdInput.trim();

    // Check if value changed
    if (trimmedMerchantId === storedMerchantId) {
      return;
    }

    // Pass empty string to indicate clearing (will reset to default)
    initiateSave(trimmedMerchantId || "", "merchant-id");
  }, [state.merchantIdInput, storedMerchantId, initiateSave]);

  const handleCustomerApiKeyConfirm = useCallback(() => {
    const trimmedApiKey = state.customerApiKeyInput.trim();
    if (!trimmedApiKey) {
      return;
    }

    initiateSave(trimmedApiKey, "customer-api-key");
  }, [state.customerApiKeyInput, initiateSave]);

  const completeSave = useCallback(async () => {
    if (state.pendingValue === null || !state.pendingAction) {
      return;
    }

    try {
      if (state.pendingAction === "merchant-id") {
        if (state.pendingValue === "") {
          // Clear merchant ID and API key (resets both to env defaults)
          const newMerchantId = await clearMerchantId();
          // Sync local input with the new default value
          setState((prev) => ({
            ...prev,
            merchantIdInput: newMerchantId ?? "",
          }));
          showSuccessToast("Merchant credentials reset to default");
          addLog(
            "info",
            "Merchant credentials reset to default",
            "settings",
            "completeSave",
          );
        } else {
          setMerchantId(state.pendingValue);
          showSuccessToast("Merchant ID saved successfully");
          addLog(
            "info",
            `Merchant ID updated to: ${state.pendingValue}`,
            "settings",
            "completeSave",
          );
        }
      } else if (state.pendingAction === "customer-api-key") {
        await setCustomerApiKey(state.pendingValue);
        setState((prev) => ({
          ...prev,
          customerApiKeyInput: "", // Clear input after saving
        }));
        showSuccessToast("Customer API key saved successfully");
        addLog("info", "Customer API key updated", "settings", "completeSave");
      }

      setState((prev) => ({
        ...prev,
        pendingValue: null,
        pendingAction: null,
        activeModal: "none",
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save";
      showErrorToast(errorMessage);
      addLog("error", errorMessage, "settings", "completeSave");
    }
  }, [
    state.pendingValue,
    state.pendingAction,
    setMerchantId,
    clearMerchantId,
    setCustomerApiKey,
    addLog,
  ]);

  const handlePinVerifyComplete = useCallback(
    async (pin: string) => {
      const isValid = await verifyPin(pin);
      if (isValid) {
        setState((prev) => ({
          ...prev,
          pinError: null,
        }));
        await completeSave();
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
    [
      verifyPin,
      isLockedOut,
      formatLockoutMessage,
      pinFailedAttempts,
      completeSave,
    ],
  );

  const handleBiometricAuthSuccess = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      pinError: null,
    }));
    await completeSave();
  }, [completeSave]);

  const handleBiometricAuthFailure = useCallback(() => {
    setState((prev) => ({
      ...prev,
      pinError: "Biometric authentication failed. Please use PIN.",
    }));
  }, []);

  const handlePinSetupComplete = useCallback(
    async (pin: string) => {
      await setPin(pin);
      showSuccessToast("PIN set successfully");
      await completeSave();
    },
    [setPin, completeSave],
  );

  const handleCancelSecurityFlow = useCallback(() => {
    setState((prev) => ({
      ...prev,
      activeModal: "none",
      pinError: null,
      pendingValue: null,
      pendingAction: null,
      merchantIdInput: storedMerchantId ?? "",
      customerApiKeyInput: "", // Clear input on cancel
    }));
  }, [storedMerchantId]);

  // Enable save when value has changed (including clearing to reset to default)
  const isMerchantIdConfirmDisabled =
    state.merchantIdInput.trim() === (storedMerchantId ?? "");

  const isCustomerApiKeyConfirmDisabled =
    state.customerApiKeyInput.trim().length === 0;

  const hasStoredCustomerApiKey = isCustomerApiKeySet;

  return {
    // State
    merchantIdInput: state.merchantIdInput,
    customerApiKeyInput: state.customerApiKeyInput,
    activeModal: state.activeModal,
    pinError: state.pinError,
    storedMerchantId,
    isMerchantIdConfirmDisabled,
    isCustomerApiKeyConfirmDisabled,
    hasStoredCustomerApiKey,

    // Handlers
    handleMerchantIdInputChange,
    handleCustomerApiKeyInputChange,
    resetCustomerApiKeyInput,
    handleMerchantIdConfirm,
    handleCustomerApiKeyConfirm,
    handlePinVerifyComplete,
    handleBiometricAuthSuccess,
    handleBiometricAuthFailure,
    handlePinSetupComplete,
    handleCancelSecurityFlow,
  };
}
