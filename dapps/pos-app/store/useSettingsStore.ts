import { Appearance } from "react-native";
import { createMMKV } from "react-native-mmkv";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const storage = createMMKV();

const mmkvStorage = {
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: (name: string, value: any) => {
    storage.set(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    storage.remove(name);
  },
};

interface SettingsStore {
  themeMode: "light" | "dark";

  //actions
  setThemeMode: (themeMode: "light" | "dark") => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      themeMode: Appearance.getColorScheme() || "light",
      setThemeMode: (themeMode: "light" | "dark") => set({ themeMode }),
    }),
    {
      name: "settings",
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
