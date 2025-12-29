import { useLogsStore } from "@/store/useLogsStore";
import * as LocalAuthentication from "expo-local-authentication";
import { Platform } from "react-native";

export type BiometricType = "fingerprint" | "facial" | "iris" | "none";

export interface BiometricStatus {
  isAvailable: boolean;
  biometricType: BiometricType;
  isEnrolled: boolean;
}

export async function getBiometricStatus(): Promise<BiometricStatus> {
  // Web doesn't support biometrics
  if (Platform.OS === "web") {
    return {
      isAvailable: false,
      biometricType: "none",
      isEnrolled: false,
    };
  }

  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) {
      return {
        isAvailable: false,
        biometricType: "none",
        isEnrolled: false,
      };
    }

    const enrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes =
      await LocalAuthentication.supportedAuthenticationTypesAsync();

    let biometricType: BiometricType = "none";
    if (
      supportedTypes.includes(
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
      )
    ) {
      biometricType = "facial";
    } else if (
      supportedTypes.includes(
        LocalAuthentication.AuthenticationType.FINGERPRINT,
      )
    ) {
      biometricType = "fingerprint";
    } else if (
      supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)
    ) {
      biometricType = "iris";
    }

    return {
      isAvailable: enrolled,
      biometricType,
      isEnrolled: enrolled,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Biometric error";
    useLogsStore
      .getState()
      .addLog("error", errorMessage, "biometrics", "getBiometricStatus", {
        error,
      });
    return {
      isAvailable: false,
      biometricType: "none",
      isEnrolled: false,
    };
  }
}

export async function authenticateWithBiometrics(
  promptMessage = "Authenticate to continue",
): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }

  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: "Cancel",
      disableDeviceFallback: true,
      fallbackLabel: "",
    });

    return result.success;
  } catch {
    return false;
  }
}

export function getBiometricLabel(type: BiometricType): string {
  switch (type) {
    case "facial":
      return Platform.OS === "ios" ? "Face ID" : "Face Recognition";
    case "fingerprint":
      return Platform.OS === "ios" ? "Touch ID" : "Fingerprint";
    case "iris":
      return "Iris";
    default:
      return "Biometric";
  }
}
