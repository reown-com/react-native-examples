import { Namespace } from "@/utils/types";
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

  networkAddresses: Record<Namespace, string>;

  // Actions
  setThemeMode: (themeMode: "light" | "dark") => void;
  setNetworkAddress: (network: Namespace, address: string) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      themeMode: Appearance.getColorScheme() || "light",
      networkAddresses: {
        eip155: "",
        solana: "",
      },
      setThemeMode: (themeMode: "light" | "dark") => set({ themeMode }),
      setNetworkAddress: (network: Namespace, address: string) =>
        set({
          networkAddresses: {
            ...get().networkAddresses,
            [network]: address,
          },
        }),
    }),
    {
      name: "settings",
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
