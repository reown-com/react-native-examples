import { storage } from "@/utils/storage";
import { Appearance } from "react-native";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsStore {
  themeMode: "light" | "dark";
  deviceId: string;
  showVariantLogo: boolean;
  _hasHydrated: boolean;

  // Actions
  setThemeMode: (themeMode: "light" | "dark") => void;
  setDeviceId: (deviceId: string) => void;
  setHasHydrated: (state: boolean) => void;
  setShowVariantLogo: (showVariantLogo: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      themeMode: Appearance.getColorScheme() || "light",
      deviceId: "",
      showVariantLogo: false,
      _hasHydrated: false,
      setThemeMode: (themeMode: "light" | "dark") => set({ themeMode }),
      setDeviceId: (deviceId: string) => set({ deviceId }),
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),
      setShowVariantLogo: (showVariantLogo: boolean) =>
        set({ showVariantLogo }),
    }),
    {
      name: "settings",
      version: 2,
      storage,
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Hydration failed:", error);
        }

        state?.setHasHydrated(true);
      },
    },
  ),
);
