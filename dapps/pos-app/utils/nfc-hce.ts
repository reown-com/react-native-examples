import { NativeModules, Platform } from "react-native";

interface HceModuleInterface {
  setNdefMessage(uri: string): Promise<boolean>;
  clearNdefMessage(): Promise<boolean>;
  isNfcEnabled(): Promise<boolean>;
}

const HceModule: HceModuleInterface | null =
  Platform.OS === "android" ? NativeModules.HceModule : null;

export async function startHceBroadcast(uri: string): Promise<boolean> {
  if (!HceModule) {
    console.warn("HCE is only available on Android");
    return false;
  }

  try {
    return await HceModule.setNdefMessage(uri);
  } catch (error) {
    console.error("Failed to start HCE broadcast:", error);
    return false;
  }
}

export async function stopHceBroadcast(): Promise<boolean> {
  if (!HceModule) {
    return false;
  }

  try {
    return await HceModule.clearNdefMessage();
  } catch (error) {
    console.error("Failed to stop HCE broadcast:", error);
    return false;
  }
}

export async function isNfcAvailable(): Promise<boolean> {
  if (!HceModule) {
    return false;
  }

  try {
    return await HceModule.isNfcEnabled();
  } catch (error) {
    console.error("Failed to check NFC status:", error);
    return false;
  }
}

export function isHceSupported(): boolean {
  return Platform.OS === "android" && HceModule !== null;
}
