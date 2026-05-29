import { useSettingsStore } from "@/store/useSettingsStore";
import { showErrorToast } from "@/utils/toast";
import { useCallback, useRef, useState } from "react";

type GateModal = "none" | "pin-verify" | "pin-setup";

const MAX_PIN_ATTEMPTS = 3;

/**
 * Reusable PIN gate for sensitive actions (saving credentials, exporting them).
 *
 * Call `requireAuth(onSuccess)` to open the PIN modal; `onSuccess` runs once the
 * user verifies an existing PIN, sets a new one, or passes biometrics. The
 * lockout / attempt logic lives here so every gated action shares one
 * implementation (the actual lockout state is owned by the store).
 */
export function usePinGate() {
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

  const [activeModal, setActiveModal] = useState<GateModal>("none");
  const [pinError, setPinError] = useState<string | null>(null);
  const onSuccessRef = useRef<(() => void | Promise<void>) | null>(null);

  const formatLockoutMessage = useCallback(() => {
    const remaining = getLockoutRemainingSeconds();
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `Too many failed attempts. Try again in ${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [getLockoutRemainingSeconds]);

  const requireAuth = useCallback(
    (onSuccess: () => void | Promise<void>) => {
      if (isLockedOut()) {
        showErrorToast(formatLockoutMessage());
        return;
      }
      onSuccessRef.current = onSuccess;
      setPinError(null);
      setActiveModal(isPinSet() ? "pin-verify" : "pin-setup");
    },
    [isLockedOut, formatLockoutMessage, isPinSet],
  );

  const runSuccess = useCallback(async () => {
    const onSuccess = onSuccessRef.current;
    onSuccessRef.current = null;
    setActiveModal("none");
    setPinError(null);
    if (onSuccess) {
      await onSuccess();
    }
  }, []);

  const handlePinVerifyComplete = useCallback(
    async (pin: string) => {
      const isValid = await verifyPin(pin);
      if (isValid) {
        await runSuccess();
      } else if (isLockedOut()) {
        setActiveModal("none");
        showErrorToast(formatLockoutMessage());
      } else {
        const attemptsLeft = MAX_PIN_ATTEMPTS - pinFailedAttempts;
        setPinError(
          `Incorrect PIN. ${attemptsLeft} attempt${attemptsLeft !== 1 ? "s" : ""} remaining.`,
        );
      }
    },
    [
      verifyPin,
      isLockedOut,
      formatLockoutMessage,
      pinFailedAttempts,
      runSuccess,
    ],
  );

  const handlePinSetupComplete = useCallback(
    async (pin: string) => {
      await setPin(pin);
      await runSuccess();
    },
    [setPin, runSuccess],
  );

  const handleBiometricSuccess = useCallback(async () => {
    setPinError(null);
    await runSuccess();
  }, [runSuccess]);

  const handleBiometricFailure = useCallback(() => {
    setPinError("Biometric check failed. Use your PIN instead.");
  }, []);

  const cancel = useCallback(() => {
    onSuccessRef.current = null;
    setActiveModal("none");
    setPinError(null);
  }, []);

  return {
    activeModal,
    pinError,
    requireAuth,
    handlePinVerifyComplete,
    handlePinSetupComplete,
    handleBiometricSuccess,
    handleBiometricFailure,
    cancel,
  };
}
