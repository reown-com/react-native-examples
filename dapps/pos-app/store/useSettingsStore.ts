import { storage } from "@/utils/storage";
import { Appearance } from "react-native";
import { create } from "zustand";
import { persist, StorageValue } from "zustand/middleware";

interface SettingsStore {
  themeMode: "light" | "dark";
  deviceId: string;

  // Actions
  setThemeMode: (themeMode: "light" | "dark") => void;
  setDeviceId: (deviceId: string) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      themeMode: Appearance.getColorScheme() || "light",
      deviceId: "",
      setThemeMode: (themeMode: "light" | "dark") => set({ themeMode }),
      setDeviceId: (deviceId: string) => set({ deviceId }),
    }),
    {
      name: "settings",
      version: 2,
      storage: {
        //TODO: Review this
        getItem: async (name) => {
          const existingValue = await storage.getItem(name);

          return {
            ...existingValue,
          };
        },
        setItem: (name, newValue: StorageValue<SettingsStore>) => {
          const str = JSON.stringify({
            ...newValue,
            state: {
              ...newValue.state,
            },
          });
          storage.setItem(name, str);
        },
        removeItem: (name) => {
          storage.removeItem(name);
        },
      },
    },
  ),
);
