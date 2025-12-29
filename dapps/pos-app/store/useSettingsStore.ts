import { DEFAULT_LOGO_BASE64 } from "@/constants/printer-logos";
import { VariantName, Variants } from "@/constants/variants";
import { storage } from "@/utils/storage";
import { Appearance } from "react-native";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Simple hash function for PIN (not cryptographically secure, but sufficient for local protection)
function hashPin(pin: string): string {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

const MAX_PIN_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

interface SettingsStore {
  themeMode: "light" | "dark";
  deviceId: string;
  variant: VariantName;
  _hasHydrated: boolean;
  merchantId: string | null;

  // PIN protection
  pinHash: string | null;
  pinFailedAttempts: number;
  pinLockoutUntil: number | null;
  biometricEnabled: boolean;

  // Actions
  setThemeMode: (themeMode: "light" | "dark") => void;
  setDeviceId: (deviceId: string) => void;
  setHasHydrated: (state: boolean) => void;
  setVariant: (variant: VariantName) => void;
  setMerchantId: (merchantId: string | null) => void;
  clearMerchantId: () => void;

  // PIN actions
  setPin: (pin: string) => void;
  verifyPin: (pin: string) => boolean;
  isPinSet: () => boolean;
  isLockedOut: () => boolean;
  getLockoutRemainingSeconds: () => number;
  resetPinAttempts: () => void;
  setBiometricEnabled: (enabled: boolean) => void;

  getVariantPrinterLogo: () => string;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      themeMode: Appearance.getColorScheme() || "light",
      deviceId: "",
      variant: "default",
      _hasHydrated: false,
      merchantId: null,
      pinHash: null,
      pinFailedAttempts: 0,
      pinLockoutUntil: null,
      biometricEnabled: false,
      setThemeMode: (themeMode: "light" | "dark") => set({ themeMode }),
      setDeviceId: (deviceId: string) => set({ deviceId }),
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),
      setVariant: (variant: VariantName) => {
        const variantData = Variants[variant];
        set({ variant });
        if (variantData.defaultTheme) {
          set({ themeMode: variantData.defaultTheme });
        }
      },
      setMerchantId: (merchantId: string | null) => set({ merchantId }),
      clearMerchantId: () => set({ merchantId: null }),

      // PIN methods
      setPin: (pin: string) => {
        set({
          pinHash: hashPin(pin),
          pinFailedAttempts: 0,
          pinLockoutUntil: null,
        });
      },
      verifyPin: (pin: string) => {
        const state = get();

        // Check if locked out
        if (state.pinLockoutUntil && Date.now() < state.pinLockoutUntil) {
          return false;
        }

        // Clear lockout if expired
        if (state.pinLockoutUntil && Date.now() >= state.pinLockoutUntil) {
          set({ pinLockoutUntil: null, pinFailedAttempts: 0 });
        }

        const isValid = hashPin(pin) === state.pinHash;

        if (isValid) {
          set({ pinFailedAttempts: 0, pinLockoutUntil: null });
          return true;
        }

        // Increment failed attempts
        const newAttempts = state.pinFailedAttempts + 1;
        if (newAttempts >= MAX_PIN_ATTEMPTS) {
          set({
            pinFailedAttempts: newAttempts,
            pinLockoutUntil: Date.now() + LOCKOUT_DURATION_MS,
          });
        } else {
          set({ pinFailedAttempts: newAttempts });
        }

        return false;
      },
      isPinSet: () => get().pinHash !== null,
      isLockedOut: () => {
        const state = get();
        if (!state.pinLockoutUntil) return false;
        if (Date.now() >= state.pinLockoutUntil) {
          set({ pinLockoutUntil: null, pinFailedAttempts: 0 });
          return false;
        }
        return true;
      },
      getLockoutRemainingSeconds: () => {
        const state = get();
        if (!state.pinLockoutUntil) return 0;
        const remaining = Math.max(0, state.pinLockoutUntil - Date.now());
        return Math.ceil(remaining / 1000);
      },
      resetPinAttempts: () =>
        set({ pinFailedAttempts: 0, pinLockoutUntil: null }),
      setBiometricEnabled: (enabled: boolean) =>
        set({ biometricEnabled: enabled }),

      getVariantPrinterLogo: () => {
        return Variants[get().variant]?.printerLogo ?? DEFAULT_LOGO_BASE64;
      },
    }),
    {
      name: "settings",
      version: 6,
      storage,
      migrate: (persistedState: any, version: number) => {
        if (!persistedState || typeof persistedState !== "object") {
          return { variant: "default" };
        }
        if (version < 4) {
          persistedState.variant = "default";
          delete persistedState.showVariantLogo;
        }
        if (version < 5) {
          persistedState.merchantId =
            persistedState.merchantId ?? "test_merchant_111";
        }
        if (version < 6) {
          // Initialize PIN protection fields
          persistedState.pinHash = persistedState.pinHash ?? null;
          persistedState.pinFailedAttempts =
            persistedState.pinFailedAttempts ?? 0;
          persistedState.pinLockoutUntil =
            persistedState.pinLockoutUntil ?? null;
          persistedState.biometricEnabled =
            persistedState.biometricEnabled ?? false;
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Settings hydration failed:", error);
        }

        state?.setHasHydrated(true);
      },
    },
  ),
);
