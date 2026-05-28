import { useSettingsStore } from "@/store/useSettingsStore";
import { useLogsStore } from "@/store/useLogsStore";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { useCallback, useEffect, useState } from "react";

type ModalType = "none" | "pin-verify" | "pin-setup";

// Describes what a single PIN-gated Save should write. Only the fields that
// actually changed are present, so merchant ID and customer API key can be
// updated together or independently in one flow.
type PendingSave = {
  merchantId?: string;
  customerApiKey?: string;
} | null;

interface MerchantFlowState {
  merchantIdInput: string;
  customerApiKeyInput: string;
  activeModal: ModalType;
  pinError: string | null;
  pendingSave: PendingSave;
}

const initialState: MerchantFlowState = {
  merchantIdInput: "",
  customerApiKeyInput: "",
  activeModal: "none",
  pinError: null,
  pendingSave: null,
};

export function useMerchantFlow() {
  const storedMerchantId = useSettingsStore((state) => state.merchantId);
  const setMerchantId = useSettingsStore((state) => state.setMerchantId);
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

  // Sync merchant ID input with stored value (e.g. after a save or reset).
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

  const initiateSave = useCallback(
    (pendingSave: NonNullable<PendingSave>) => {
      // Check if locked out
      if (isLockedOut()) {
        showErrorToast(formatLockoutMessage());
        return;
      }

      const pinExists = isPinSet();

      setState((prev) => ({
        ...prev,
        pendingSave,
        activeModal: pinExists ? "pin-verify" : "pin-setup",
      }));
    },
    [isLockedOut, formatLockoutMessage, isPinSet],
  );

  const trimmedMerchantId = state.merchantIdInput.trim();
  const trimmedApiKey = state.customerApiKeyInput.trim();
  // Merchant ID must be non-empty; resetting to defaults is an explicit action
  // (the Reset link pre-fills the input), never an empty Save.
  const merchantIdChanged =
    trimmedMerchantId.length > 0 &&
    trimmedMerchantId !== (storedMerchantId ?? "");
  const customerKeyProvided = trimmedApiKey.length > 0;

  // Build the PendingSave from the current inputs and start the PIN flow.
  const handleUpdateKeysConfirm = useCallback(() => {
    const pending: NonNullable<PendingSave> = {};
    if (merchantIdChanged) {
      pending.merchantId = trimmedMerchantId;
    }
    if (customerKeyProvided) {
      pending.customerApiKey = trimmedApiKey;
    }

    if (
      pending.merchantId === undefined &&
      pending.customerApiKey === undefined
    ) {
      return;
    }

    initiateSave(pending);
  }, [
    merchantIdChanged,
    customerKeyProvided,
    trimmedMerchantId,
    trimmedApiKey,
    initiateSave,
  ]);

  const completeSave = useCallback(async () => {
    const pending = state.pendingSave;
    if (!pending) {
      return;
    }

    try {
      const saved: string[] = [];

      if (pending.merchantId !== undefined) {
        setMerchantId(pending.merchantId);
        addLog(
          "info",
          `Merchant ID updated to: ${pending.merchantId}`,
          "settings",
          "completeSave",
        );
        saved.push("Merchant ID");
      }

      if (pending.customerApiKey !== undefined) {
        await setCustomerApiKey(pending.customerApiKey);
        addLog("info", "Customer API key updated", "settings", "completeSave");
        saved.push("Customer API key");
      }

      setState((prev) => ({
        ...prev,
        customerApiKeyInput: "",
        pendingSave: null,
        activeModal: "none",
        pinError: null,
      }));

      showSuccessToast(
        saved.length > 1
          ? "Keys saved successfully"
          : `${saved[0]} saved successfully`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save";
      showErrorToast(errorMessage);
      addLog("error", errorMessage, "settings", "completeSave");
    }
  }, [state.pendingSave, setMerchantId, setCustomerApiKey, addLog]);

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
      pendingSave: null,
      merchantIdInput: storedMerchantId ?? "",
      customerApiKeyInput: "",
    }));
  }, [storedMerchantId]);

  // Save is enabled when there is at least one valid change to commit.
  const isUpdateKeysConfirmDisabled =
    !merchantIdChanged && !customerKeyProvided;

  const hasStoredCustomerApiKey = isCustomerApiKeySet;

  return {
    // State
    merchantIdInput: state.merchantIdInput,
    customerApiKeyInput: state.customerApiKeyInput,
    activeModal: state.activeModal,
    pinError: state.pinError,
    storedMerchantId,
    isUpdateKeysConfirmDisabled,
    hasStoredCustomerApiKey,

    // Handlers
    handleMerchantIdInputChange,
    handleCustomerApiKeyInputChange,
    handleUpdateKeysConfirm,
    handlePinVerifyComplete,
    handleBiometricAuthSuccess,
    handleBiometricAuthFailure,
    handlePinSetupComplete,
    handleCancelSecurityFlow,
  };
}
