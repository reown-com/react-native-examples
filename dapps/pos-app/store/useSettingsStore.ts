import { DEFAULT_LOGO_BASE64 } from "@/constants/printer-logos";
import { VariantName, Variants } from "@/constants/variants";
import { MerchantConfig } from "@/utils/merchant-config";
import { SECURE_STORAGE_KEYS, secureStorage } from "@/utils/secure-storage";
import { storage } from "@/utils/storage";
import { TransactionFilterType } from "@/utils/types";
import * as Crypto from "expo-crypto";
import { Appearance } from "react-native";
import { create } from "zustand";
import { persist } from "zustand/middleware";

async function hashPin(pin: string): Promise<string> {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    pin,
  );
}

/**
 * Timing-safe string comparison to prevent timing attacks on PIN verification.
 * Always compares all characters regardless of where differences occur.
 */
function timingSafeEqual(a: string, b: string): boolean {
  // Length check - but still perform full comparison to maintain constant time
  const lengthMatch = a.length === b.length;

  // Use the longer string length to ensure we always do the same amount of work
  const maxLength = Math.max(a.length, b.length);

  let result = 0;
  for (let i = 0; i < maxLength; i++) {
    // Use charCodeAt with fallback to 0 for out-of-bounds
    const charA = i < a.length ? a.charCodeAt(i) : 0;
    const charB = i < b.length ? b.charCodeAt(i) : 0;
    // XOR accumulates any differences
    result |= charA ^ charB;
  }

  // Both length must match AND all characters must be equal (result === 0)
  return lengthMatch && result === 0;
}

const MAX_PIN_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

interface SettingsStore {
  themeMode: "light" | "dark";
  deviceId: string;
  variant: VariantName;
  _hasHydrated: boolean;
  merchantId: string | null;
  isMerchantApiKeySet: boolean;

  // Transaction filter
  transactionFilter: TransactionFilterType;

  // PIN protection
  pinFailedAttempts: number;
  pinLockoutUntil: number | null;
  biometricEnabled: boolean;

  // Actions
  setThemeMode: (themeMode: "light" | "dark") => void;
  setDeviceId: (deviceId: string) => void;
  setHasHydrated: (state: boolean) => void;
  setVariant: (variant: VariantName) => void;
  setMerchantId: (merchantId: string | null) => void;
  clearMerchantId: () => Promise<string | null>;
  setMerchantApiKey: (apiKey: string | null) => Promise<void>;
  clearMerchantApiKey: () => Promise<void>;
  getMerchantApiKey: () => Promise<string | null>;

  // PIN actions
  setPin: (pin: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  isPinSet: () => Promise<boolean>;
  isLockedOut: () => boolean;
  getLockoutRemainingSeconds: () => number;
  resetPinAttempts: () => void;
  setBiometricEnabled: (enabled: boolean) => void;

  // Transaction filter
  setTransactionFilter: (filter: TransactionFilterType) => void;

  // Others
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
      isMerchantApiKeySet: false,
      transactionFilter: "all",
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
      setMerchantId: (merchantId: string | null) => {
        // If clearing, reset to env default
        if (!merchantId || merchantId.trim() === "") {
          set({ merchantId: MerchantConfig.getDefaultMerchantId() });
        } else {
          set({ merchantId });
        }
      },
      clearMerchantId: async () => {
        // Reset both merchant ID and API key to env defaults
        const defaultMerchantId = MerchantConfig.getDefaultMerchantId();
        set({ merchantId: defaultMerchantId });
        const defaultApiKey = MerchantConfig.getDefaultMerchantApiKey();
        if (defaultApiKey) {
          await secureStorage.setItem(
            SECURE_STORAGE_KEYS.MERCHANT_API_KEY,
            defaultApiKey,
          );
          set({ isMerchantApiKeySet: true });
        } else {
          await secureStorage.removeItem(SECURE_STORAGE_KEYS.MERCHANT_API_KEY);
          set({ isMerchantApiKeySet: false });
        }
        return defaultMerchantId;
      },
      setMerchantApiKey: async (apiKey: string | null) => {
        try {
          if (apiKey) {
            await secureStorage.setItem(
              SECURE_STORAGE_KEYS.MERCHANT_API_KEY,
              apiKey,
            );
            set({ isMerchantApiKeySet: true });
          } else {
            await secureStorage.removeItem(
              SECURE_STORAGE_KEYS.MERCHANT_API_KEY,
            );
          }
        } catch {
          throw new Error("Failed to save credentials securely");
        }
      },
      clearMerchantApiKey: async () => {
        await secureStorage.removeItem(SECURE_STORAGE_KEYS.MERCHANT_API_KEY);
        set({ isMerchantApiKeySet: false });
      },
      getMerchantApiKey: async () => {
        return await secureStorage.getItem(
          SECURE_STORAGE_KEYS.MERCHANT_API_KEY,
        );
      },

      // PIN methods
      setPin: async (pin: string) => {
        const hashedPin = await hashPin(pin);
        await secureStorage.setItem(SECURE_STORAGE_KEYS.PIN_HASH, hashedPin);
        set({
          pinFailedAttempts: 0,
          pinLockoutUntil: null,
        });
      },
      verifyPin: async (pin: string) => {
        const state = get();

        // Check if locked out
        if (state.pinLockoutUntil && Date.now() < state.pinLockoutUntil) {
          return false;
        }

        // Clear lockout if expired
        if (state.pinLockoutUntil && Date.now() >= state.pinLockoutUntil) {
          set({ pinLockoutUntil: null, pinFailedAttempts: 0 });
        }

        const storedPinHash = await secureStorage.getItem(
          SECURE_STORAGE_KEYS.PIN_HASH,
        );
        const hashedPin = await hashPin(pin);
        // Use timing-safe comparison to prevent timing attacks
        const isValid =
          storedPinHash !== null && timingSafeEqual(hashedPin, storedPinHash);

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
      isPinSet: async () => {
        const pinHash = await secureStorage.getItem(
          SECURE_STORAGE_KEYS.PIN_HASH,
        );
        return pinHash !== null;
      },
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

      setTransactionFilter: (filter: TransactionFilterType) =>
        set({ transactionFilter: filter }),

      getVariantPrinterLogo: () => {
        return Variants[get().variant]?.printerLogo ?? DEFAULT_LOGO_BASE64;
      },
    }),
    {
      name: "settings",
      version: 10,
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
          persistedState.merchantId = null;
        }
        if (version < 6) {
          persistedState.pinFailedAttempts = 0;
          persistedState.pinLockoutUntil = null;
          persistedState.biometricEnabled = false;
        }
        if (version < 8) {
          persistedState.isMerchantApiKeySet = false;

          // Store pinHash temporarily for migration in onRehydrateStorage
          const pinHash = persistedState.pinHash;
          delete persistedState.pinHash;

          // Store in a temporary property for async migration
          if (pinHash) {
            (persistedState as any).__migrationData = {
              pinHash,
            };
          }
        }
        if (version < 9) {
          // Remove old pinHash created with simple hash function and let user set a new pin
          persistedState.pinHash = null;
          secureStorage.removeItem(SECURE_STORAGE_KEYS.PIN_HASH);
        }
        if (version < 10) {
          persistedState.transactionFilter = "all";
        }

        return persistedState;
      },
      onRehydrateStorage: () => async (state, error) => {
        if (error) {
          console.error("Settings hydration failed:", error);
        }

        // Migrate pinHash from zustand storage to secure storage
        if (state) {
          const migrationData = (state as any).__migrationData;
          if (migrationData) {
            if (migrationData.pinHash) {
              await secureStorage.setItem(
                SECURE_STORAGE_KEYS.PIN_HASH,
                migrationData.pinHash,
              );
            }

            // Clean up migration data
            delete (state as any).__migrationData;
          }

          // Initialize merchant defaults from env if not set
          const defaultMerchantId = MerchantConfig.getDefaultMerchantId();
          const defaultApiKey = MerchantConfig.getDefaultMerchantApiKey();

          if (!state.merchantId && defaultMerchantId) {
            state.setMerchantId(defaultMerchantId);
          }

          if (!state.isMerchantApiKeySet && defaultApiKey) {
            await state.setMerchantApiKey(defaultApiKey);
          }
        }

        state?.setHasHydrated(true);
      },
    },
  ),
);
