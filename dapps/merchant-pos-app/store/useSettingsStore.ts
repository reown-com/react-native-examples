import { CurrencyCode } from "@/utils/currency";
import { storage } from "@/utils/storage";
import { ThemeMode } from "@/utils/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsStore {
  themeMode: ThemeMode;
  currency: CurrencyCode;
  _hasHydrated: boolean;
  setThemeMode: (themeMode: ThemeMode) => void;
  setCurrency: (currency: CurrencyCode) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      themeMode: "dark",
      currency: "USD",
      _hasHydrated: false,
      setThemeMode: (themeMode) => set({ themeMode }),
      setCurrency: (currency) => set({ currency }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "settings",
      version: 1,
      storage,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
