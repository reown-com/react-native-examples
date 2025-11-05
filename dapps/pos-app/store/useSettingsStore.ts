import { ALLOWED_CHAINS, CaipNetworkId, Network } from "@/utils/networks";
import { Namespace } from "@/utils/types";
import { Appearance } from "react-native";
import { createMMKV } from "react-native-mmkv";
import { create } from "zustand";
import { persist, StorageValue } from "zustand/middleware";

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
  supportedNetworks: Map<CaipNetworkId, boolean>;

  // Actions
  setThemeMode: (themeMode: "light" | "dark") => void;
  setNetworkAddress: (network: Namespace, address: string) => void;
  toggleSupportedNetwork: (networkId: CaipNetworkId) => void;
  getEnabledNetworks: () => Network[];
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      themeMode: Appearance.getColorScheme() || "light",
      networkAddresses: {
        eip155: "",
        solana: "",
      },
      supportedNetworks: new Map(
        ALLOWED_CHAINS.map((network) => [network.caipNetworkId, true]),
      ),
      setThemeMode: (themeMode: "light" | "dark") => set({ themeMode }),
      toggleSupportedNetwork: (networkId: CaipNetworkId) =>
        set((state) => {
          const newMap = new Map(state.supportedNetworks);
          newMap.set(networkId, !newMap.get(networkId));
          return { supportedNetworks: newMap };
        }),
      setNetworkAddress: (network: Namespace, address: string) =>
        set({
          networkAddresses: {
            ...get().networkAddresses,
            [network]: address,
          },
        }),
      getEnabledNetworks: () => {
        const { supportedNetworks } = get();
        return ALLOWED_CHAINS.filter((network) =>
          supportedNetworks.get(network.caipNetworkId),
        );
      },
    }),
    {
      name: "settings",
      version: 2,
      storage: {
        getItem: (name) => {
          const str = mmkvStorage.getItem(name);
          if (!str) return null;
          const existingValue = JSON.parse(str);

          // Create a Set of valid network IDs from ALLOWED_NETWORKS
          const validNetworkIds = new Set(
            ALLOWED_CHAINS.map((network) => network.caipNetworkId),
          );

          // Filter stored networks to only include those that are still allowed
          const filteredNetworks = existingValue.state.supportedNetworks.filter(
            ([networkId]: [CaipNetworkId, boolean]) =>
              validNetworkIds.has(networkId),
          );

          // Convert to Map and ensure all current ALLOWED_NETWORKS are present
          const restoredMap = new Map(filteredNetworks);

          // Add any new networks that don't exist in stored data (default to true)
          ALLOWED_CHAINS.forEach((network) => {
            if (!restoredMap.has(network.caipNetworkId)) {
              restoredMap.set(network.caipNetworkId, true);
            }
          });

          return {
            ...existingValue,
            state: {
              ...existingValue.state,
              supportedNetworks: restoredMap,
            },
          };
        },
        setItem: (name, newValue: StorageValue<SettingsStore>) => {
          // functions cannot be JSON encoded
          const str = JSON.stringify({
            ...newValue,
            state: {
              ...newValue.state,
              supportedNetworks: Array.from(
                newValue.state.supportedNetworks.entries(),
              ),
            },
          });
          mmkvStorage.setItem(name, str);
        },
        removeItem: (name) => {
          mmkvStorage.removeItem(name);
        },
      },
    },
  ),
);
