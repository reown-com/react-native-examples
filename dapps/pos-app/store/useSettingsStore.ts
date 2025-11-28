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

  // Actions
  setThemeMode: (themeMode: "light" | "dark") => void;
  setDeviceId: (deviceId: string) => void;
  setHasHydrated: (state: boolean) => void;
  setVariant: (variant: VariantName) => void;

  getVariantPrinterLogo: () => string;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      themeMode: Appearance.getColorScheme() || "light",
      deviceId: "",
      variant: "default",
      _hasHydrated: false,
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
      getVariantPrinterLogo: () => {
        return Variants[get().variant]?.printerLogo ?? DEFAULT_LOGO_BASE64;
      },
    }),
    {
      name: "settings",
      version: 4,
      storage,
      migrate: (persistedState: any, version: number) => {
        if (!persistedState || typeof persistedState !== "object") {
          return { variant: "default" };
        }
        if (version < 4) {
          persistedState.variant = "default";
          delete persistedState.showVariantLogo;
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Hydration failed:", error);
        }

        state?.setHasHydrated(true);
      },
    },
  ),
);
