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

  // Write whichever of merchant ID / customer key actually changed.
  const handleUpdateKeysConfirm = useCallback(async () => {
    if (!merchantIdChanged && !customerKeyProvided) {
      return;
    }

    try {
      const saved: string[] = [];

      if (merchantIdChanged) {
        setMerchantId(trimmedMerchantId);
        addLog(
          "info",
          `Merchant ID updated to: ${trimmedMerchantId}`,
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
    merchantIdChanged,
    customerKeyProvided,
    trimmedMerchantId,
    trimmedApiKey,
    setMerchantId,
    setCustomerApiKey,
    addLog,
    onSaved,
  ]);

  // Save is enabled when there is at least one valid change to commit.
  const isUpdateKeysConfirmDisabled =
    !merchantIdChanged && !customerKeyProvided;

  return {
    merchantIdInput,
    customerApiKeyInput,
    storedMerchantId,
    isUpdateKeysConfirmDisabled,
    hasStoredCustomerApiKey: isCustomerApiKeySet,
    handleMerchantIdInputChange,
    handleCustomerApiKeyInputChange,
    handleUpdateKeysConfirm,
  };
}
