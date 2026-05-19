import { requireNativeModule, type EventSubscription } from "expo-modules-core";
import { Platform } from "react-native";

import type { NfcCapabilitiesResult } from "./src/HceModule.types";

type HceEvents = {
  onTap: () => void;
};

interface HceNativeModule {
  getNfcCapabilities(): Promise<NfcCapabilitiesResult>;
  setPaymentUrl(url: string): Promise<void>;
  clearPaymentUrl(): Promise<void>;
  addListener<E extends keyof HceEvents>(
    eventName: E,
    listener: HceEvents[E],
  ): EventSubscription;
}

const Native: HceNativeModule | null =
  Platform.OS === "android"
    ? (requireNativeModule("HceModule") as HceNativeModule)
    : null;

export const HceModule = {
  isAvailable: Native !== null,

  async getNfcCapabilities(): Promise<NfcCapabilitiesResult> {
    if (!Native) {
      return { isNfcSupported: false, isNfcEnabled: false, isHceSupported: false };
    }
    return Native.getNfcCapabilities();
  },

  async setPaymentUrl(url: string): Promise<void> {
    if (!Native) return;
    await Native.setPaymentUrl(url);
  },

  async clearPaymentUrl(): Promise<void> {
    if (!Native) return;
    await Native.clearPaymentUrl();
  },

  addTapListener(listener: () => void): EventSubscription {
    if (!Native) {
      return { remove: () => {} };
    }
    return Native.addListener("onTap", listener);
  },
};

export type { NfcCapabilitiesResult } from "./src/HceModule.types";
