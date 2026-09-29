import { useLogsStore } from "@/store/useLogsStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { formatCountdown } from "@/utils/misc";
import { SetupPayload } from "@/utils/parse-setup-qr";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { useCallback, useEffect, useState } from "react";

type ModalType = "none" | "pin-verify" | "pin-setup";
// A protected save waiting on PIN/biometric auth. An empty `value` clears the
// setting. "setup" saves both credentials from a scanned setup QR at once.
type PendingSave =
  | { action: "merchant-id"; value: string }
  | { action: "customer-api-key"; value: string }
  | ({ action: "setup" } & SetupPayload);

interface MerchantFlowState {
  merchantIdInput: string;
  customerApiKeyInput: string;
  // Whether the user has started editing the (masked) API key field. Used to
  // distinguish "just opened, still showing ********" from "cleared the field".
  isEditingCustomerApiKey: boolean;
  activeModal: ModalType;
  pinError: string | null;
  pendingSave: PendingSave | null;
  // When true, a protected save is waiting for the auto-triggered biometric
  // prompt to resolve. The PIN modal stays hidden while this is set.
  biometricPending: boolean;
}

const initialState: MerchantFlowState = {
  merchantIdInput: "",
  customerApiKeyInput: "",
  isEditingCustomerApiKey: false,
  activeModal: "none",
  pinError: null,
  pendingSave: null,
  biometricPending: false,
};

interface MerchantFlowOptions {
  // Whether biometrics is enabled and available right now. When true, a
  // protected save auto-triggers the biometric prompt instead of the PIN modal.
  canUseBiometric: boolean;
  // Runs the native biometric prompt; resolves true on success.
  authenticate: (promptMessage: string) => Promise<boolean>;
  // Label for the current biometric type (e.g. "Face ID"), used in the prompt.
  biometricLabel: string;
}

export function useMerchantFlow({
  canUseBiometric,
  authenticate,
  biometricLabel,
}: MerchantFlowOptions) {
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
    return `Too many failed attempts. Try again in ${formatCountdown(remaining)}`;
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
      isEditingCustomerApiKey: true,
    }));
  }, []);

  const resetCustomerApiKeyInput = useCallback(() => {
    setState((prev) => ({
      ...prev,
      customerApiKeyInput: "",
      isEditingCustomerApiKey: false,
    }));
  }, []);

  const initiateSave = useCallback(
    (pendingSave: PendingSave) => {
      // Check if locked out
      if (isLockedOut()) {
        showErrorToast(formatLockoutMessage());
        return;
      }

      const pinExists = isPinSet();

      // With a PIN set and biometrics enabled, skip the PIN modal entirely and
      // auto-trigger the biometric prompt. The effect below picks up
      // `biometricPending` once state commits (so the pending save is
      // available to `completeSave`). The PIN modal only appears if biometrics
      // fails or is cancelled.
      if (pinExists && canUseBiometric) {
        setState((prev) => ({
          ...prev,
          pendingSave,
          pinError: null,
          biometricPending: true,
          activeModal: "none",
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        pendingSave,
        activeModal: pinExists ? "pin-verify" : "pin-setup",
      }));
    },
    [isLockedOut, formatLockoutMessage, isPinSet, canUseBiometric],
  );

  const handleMerchantIdConfirm = useCallback(() => {
    const trimmedMerchantId = state.merchantIdInput.trim();

    // Check if value changed
    if (trimmedMerchantId === storedMerchantId) {
      return;
    }

    // Pass empty string to indicate clearing (will reset to default)
    initiateSave({ action: "merchant-id", value: trimmedMerchantId });
  }, [state.merchantIdInput, storedMerchantId, initiateSave]);

  const handleCustomerApiKeyConfirm = useCallback(() => {
    const trimmedApiKey = state.customerApiKeyInput.trim();
    if (!trimmedApiKey) {
      // Empty means "clear the key". Only meaningful when one is stored.
      if (!isCustomerApiKeySet) {
        return;
      }
      initiateSave({ action: "customer-api-key", value: "" });
      return;
    }

    initiateSave({ action: "customer-api-key", value: trimmedApiKey });
  }, [state.customerApiKeyInput, isCustomerApiKeySet, initiateSave]);

  const handleScannedSetup = useCallback(
    (payload: SetupPayload) => {
      initiateSave({ action: "setup", ...payload });
    },
    [initiateSave],
  );

  const completeSave = useCallback(async () => {
    const pending = state.pendingSave;
    if (!pending) {
      return;
    }

    try {
      if (pending.action === "merchant-id") {
        if (pending.value === "") {
          // Clear only the merchant ID, leaving the terminal unconfigured.
          await clearMerchantId();
          setState((prev) => ({
            ...prev,
            merchantIdInput: "",
          }));
          showSuccessToast("Merchant ID cleared");
          addLog("info", "Merchant ID cleared", "settings", "completeSave");
        } else {
          setMerchantId(pending.value);
          showSuccessToast("Merchant ID saved successfully");
          addLog("info", "Merchant ID updated", "settings", "completeSave");
        }
      } else if (pending.action === "customer-api-key") {
        const isClearing = pending.value === "";
        await setCustomerApiKey(pending.value);
        setState((prev) => ({
          ...prev,
          customerApiKeyInput: "", // Clear input after saving
          isEditingCustomerApiKey: false,
        }));
        showSuccessToast(
          isClearing
            ? "Customer API key cleared"
            : "Customer API key saved successfully",
        );
        addLog(
          "info",
          isClearing ? "Customer API key cleared" : "Customer API key updated",
          "settings",
          "completeSave",
        );
      } else {
        // Save the key first: it's the async step that can fail, and doing it
        // before the merchant ID avoids leaving a half-applied setup behind.
        await setCustomerApiKey(pending.apiKey);
        setMerchantId(pending.merchantId);
        setState((prev) => ({
          ...prev,
          customerApiKeyInput: "",
          isEditingCustomerApiKey: false,
        }));
        showSuccessToast("Credentials saved");
        addLog(
          "info",
          "Merchant ID and Customer API key updated from setup QR",
          "settings",
          "completeSave",
        );
      }

      setState((prev) => ({
        ...prev,
        pendingSave: null,
        activeModal: "none",
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save";
      showErrorToast("We couldn't save this setting. Try again.");
      addLog("error", errorMessage, "settings", "completeSave");
    }
  }, [
    state.pendingSave,
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

  // Runs the biometric prompt for a pending protected save. Used both by the
  // auto-trigger effect and by the manual retry button inside the PIN modal.
  // On success the save completes; on failure/cancel the PIN modal is revealed
  // so the user can type their PIN or retry biometrics from its key.
  const runBiometricAuth = useCallback(async () => {
    const success = await authenticate(
      `Use ${biometricLabel} to change merchant settings`,
    );
    if (success) {
      setState((prev) => ({ ...prev, pinError: null }));
      await completeSave();
    } else {
      setState((prev) => ({ ...prev, activeModal: "pin-verify" }));
    }
  }, [authenticate, biometricLabel, completeSave]);

  // Fire the biometric prompt once after `initiateSave` requests it. Clearing
  // the flag immediately prevents a re-fire on the resulting re-render.
  useEffect(() => {
    if (!state.biometricPending) {
      return;
    }
    setState((prev) => ({ ...prev, biometricPending: false }));
    runBiometricAuth();
  }, [state.biometricPending, runBiometricAuth]);

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
      customerApiKeyInput: "", // Clear input on cancel
      isEditingCustomerApiKey: false,
    }));
  }, [storedMerchantId]);

  // Enable save when the merchant ID has changed (including clearing it).
  const isMerchantIdConfirmDisabled =
    state.merchantIdInput.trim() === (storedMerchantId ?? "");

  // Enable save for a non-empty key, or when the user has emptied the field to
  // clear an existing key. Stays disabled on open (masked, not yet edited).
  const isCustomerApiKeyConfirmDisabled =
    state.customerApiKeyInput.trim().length === 0 &&
    !(state.isEditingCustomerApiKey && isCustomerApiKeySet);

  const hasStoredCustomerApiKey = isCustomerApiKeySet;

  // The merchant a scanned setup QR is about to save, so the PIN prompt can name
  // it (the merchant never sees the values before confirming).
  const pendingSetupMerchantId =
    state.pendingSave?.action === "setup" ? state.pendingSave.merchantId : null;

  return {
    // State
    merchantIdInput: state.merchantIdInput,
    customerApiKeyInput: state.customerApiKeyInput,
    isEditingCustomerApiKey: state.isEditingCustomerApiKey,
    activeModal: state.activeModal,
    pinError: state.pinError,
    storedMerchantId,
    isMerchantIdConfirmDisabled,
    isCustomerApiKeyConfirmDisabled,
    hasStoredCustomerApiKey,
    pendingSetupMerchantId,

    // Handlers
    handleMerchantIdInputChange,
    handleCustomerApiKeyInputChange,
    resetCustomerApiKeyInput,
    handleMerchantIdConfirm,
    handleCustomerApiKeyConfirm,
    handleScannedSetup,
    handlePinVerifyComplete,
    handleBiometricPress: runBiometricAuth,
    handlePinSetupComplete,
    handleCancelSecurityFlow,
  };
}
