import { DEFAULT_LOGO_BASE64 } from "@/constants/printer-logos";
import { VariantName, Variants } from "@/constants/variants";
import { storage } from "@/utils/storage";
import { Appearance } from "react-native";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsStore {
  themeMode: "light" | "dark";
  deviceId: string;
  variant: VariantName;
  _hasHydrated: boolean;
  merchantId: string | null;

  // Actions
  setThemeMode: (themeMode: "light" | "dark") => void;
  setDeviceId: (deviceId: string) => void;
  setHasHydrated: (state: boolean) => void;
  setVariant: (variant: VariantName) => void;
  setMerchantId: (merchantId: string | null) => void;
  clearMerchantId: () => void;

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
      getVariantPrinterLogo: () => {
        return Variants[get().variant]?.printerLogo ?? DEFAULT_LOGO_BASE64;
      },
    }),
    {
      name: "settings",
      version: 5,
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
