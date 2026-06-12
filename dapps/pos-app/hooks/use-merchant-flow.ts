import { useLogsStore } from "@/store/useLogsStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { useCallback, useEffect, useState } from "react";

// The Update keys screen gates access with a PIN on entry (see usePinGate), so
// saving here writes directly — no second PIN prompt.

export function useMerchantFlow(onSaved?: () => void) {
  const storedMerchantId = useSettingsStore((state) => state.merchantId);
  const setMerchantId = useSettingsStore((state) => state.setMerchantId);
  const setCustomerApiKey = useSettingsStore(
    (state) => state.setCustomerApiKey,
  );
  const isCustomerApiKeySet = useSettingsStore(
    (state) => state.isCustomerApiKeySet,
  );
  const addLog = useLogsStore((state) => state.addLog);

  const [merchantIdInput, setMerchantIdInput] = useState(
    storedMerchantId ?? "",
  );
  const [customerApiKeyInput, setCustomerApiKeyInput] = useState("");

  // Sync merchant ID input with stored value (e.g. after a save or reset).
  useEffect(() => {
    setMerchantIdInput(storedMerchantId ?? "");
  }, [storedMerchantId]);

  const handleMerchantIdInputChange = useCallback((value: string) => {
    setMerchantIdInput(value);
  }, []);

  const handleCustomerApiKeyInputChange = useCallback((value: string) => {
    setCustomerApiKeyInput(value);
  }, []);

  const trimmedMerchantId = merchantIdInput.trim();
  const trimmedApiKey = customerApiKeyInput.trim();
  // Merchant ID must be non-empty; resetting to defaults is an explicit action
  // (the Reset link pre-fills the input), never an empty Save.
  const merchantIdChanged =
    trimmedMerchantId.length > 0 &&
    trimmedMerchantId !== (storedMerchantId ?? "");
  const customerKeyProvided = trimmedApiKey.length > 0;

  // A new merchant ID invalidates the old key (it belongs to the old merchant),
  // so changing it always requires entering a fresh customer key in the same
  // save. This also blocks swapping the merchant ID to keep the previous key.
  const customerKeyRequired = merchantIdChanged && !customerKeyProvided;

  // Enabled when there's a valid change to commit and no required field missing.
  const isUpdateKeysConfirmDisabled =
    (!merchantIdChanged && !customerKeyProvided) || customerKeyRequired;

  const handleUpdateKeysConfirm = useCallback(async () => {
    if (isUpdateKeysConfirmDisabled) {
      return;
    }

    try {
      const saved: string[] = [];

      if (merchantIdChanged) {
        setMerchantId(trimmedMerchantId);
        // Don't log the value — the merchant ID is an account identifier and
        // logs are viewable/exportable from Settings.
        addLog(
          "info",
          "Merchant ID updated",
          "settings",
          "handleUpdateKeysConfirm",
        );
        saved.push("Merchant ID");
      }

      if (customerKeyProvided) {
        await setCustomerApiKey(trimmedApiKey);
        addLog(
          "info",
          "Customer API key updated",
          "settings",
          "handleUpdateKeysConfirm",
        );
        saved.push("Customer API key");
      }

      setCustomerApiKeyInput("");

      showSuccessToast(saved.length > 1 ? "Keys saved" : `${saved[0]} saved`);

      onSaved?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Couldn't save your changes. Try again.";
      showErrorToast(errorMessage);
      addLog("error", errorMessage, "settings", "handleUpdateKeysConfirm");
    }
  }, [
    isUpdateKeysConfirmDisabled,
    merchantIdChanged,
    customerKeyProvided,
    trimmedMerchantId,
    trimmedApiKey,
    setMerchantId,
    setCustomerApiKey,
    addLog,
    onSaved,
  ]);

  return {
    merchantIdInput,
    customerApiKeyInput,
    storedMerchantId,
    merchantIdChanged,
    customerKeyRequired,
    isUpdateKeysConfirmDisabled,
    hasStoredCustomerApiKey: isCustomerApiKeySet,
    handleMerchantIdInputChange,
    handleCustomerApiKeyInputChange,
    handleUpdateKeysConfirm,
  };
}
