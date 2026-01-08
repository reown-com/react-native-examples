import { useSettingsStore } from "@/store/useSettingsStore";
import {
  authenticateWithBiometrics,
  BiometricStatus,
  getBiometricLabel,
  getBiometricStatus,
} from "@/utils/biometrics";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { useCallback, useEffect, useState } from "react";

export function useBiometricAuth() {
  const biometricEnabled = useSettingsStore((state) => state.biometricEnabled);
  const setBiometricEnabled = useSettingsStore(
    (state) => state.setBiometricEnabled,
  );
  const isPinSet = useSettingsStore((state) => state.isPinSet);

  const [biometricStatus, setBiometricStatus] =
    useState<BiometricStatus | null>(null);
  const [isPinSetValue, setIsPinSetValue] = useState(false);

  useEffect(() => {
    const checkBiometrics = async () => {
      const status = await getBiometricStatus();
      setBiometricStatus(status);
    };
    checkBiometrics();
  }, []);

  useEffect(() => {
    const checkPin = async () => {
      const pinExists = await isPinSet();
      setIsPinSetValue(pinExists);
    };
    checkPin();
  }, [isPinSet]);

  const biometricLabel = biometricStatus
    ? getBiometricLabel(biometricStatus.biometricType)
    : "Biometric";

  const canUseBiometric = biometricEnabled && biometricStatus?.isAvailable;

  const shouldShowBiometricOption =
    isPinSetValue && biometricStatus?.isAvailable === true;

  const handleBiometricToggle = useCallback(
    async (enabled: boolean) => {
      if (enabled) {
        const success = await authenticateWithBiometrics(
          "Authenticate to enable biometric unlock",
        );
        if (success) {
          setBiometricEnabled(true);
          showSuccessToast("Biometric unlock enabled");
          return true;
        } else {
          showErrorToast("Biometric authentication failed");
          return false;
        }
      } else {
        setBiometricEnabled(false);
        showSuccessToast("Biometric unlock disabled");
        return true;
      }
    },
    [setBiometricEnabled],
  );

  const authenticate = useCallback(async (promptMessage: string) => {
    return authenticateWithBiometrics(promptMessage);
  }, []);

  return {
    biometricStatus,
    biometricEnabled,
    biometricLabel,
    canUseBiometric,
    shouldShowBiometricOption,
    handleBiometricToggle,
    authenticate,
  };
}
