import { storage } from "@/utils/storage";
import { MerchantConfig } from "@/utils/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Normalize an address for use as a registry key (EVM is case-insensitive). */
function keyFor(address: string): string {
  return address.startsWith("0x") ? address.toLowerCase() : address;
}

interface MerchantStore {
  /** Registry of every wallet that has completed onboarding, keyed by address. */
  merchants: Record<string, MerchantConfig>;
  /** Address of the merchant in the current session, or null when logged out. */
  activeAddress: string | null;
  _hasHydrated: boolean;

  isRegistered: (address: string) => boolean;
  getMerchant: (address: string) => MerchantConfig | undefined;
  upsertMerchant: (config: MerchantConfig) => void;
  setActive: (address: string | null) => void;
  /** End the session (disconnect). Registry is kept so the merchant can log back in. */
  clearActive: () => void;
  getActiveMerchant: () => MerchantConfig | undefined;
  setHasHydrated: (state: boolean) => void;
}

export const useMerchantStore = create<MerchantStore>()(
  persist(
    (set, get) => ({
      merchants: {},
      activeAddress: null,
      _hasHydrated: false,

      isRegistered: (address) => Boolean(get().merchants[keyFor(address)]),
      getMerchant: (address) => get().merchants[keyFor(address)],
      upsertMerchant: (config) =>
        set((state) => ({
          merchants: { ...state.merchants, [keyFor(config.address)]: config },
        })),
      setActive: (address) => set({ activeAddress: address }),
      clearActive: () => set({ activeAddress: null }),
      getActiveMerchant: () => {
        const { activeAddress, merchants } = get();
        if (!activeAddress) return undefined;
        return merchants[keyFor(activeAddress)];
      },
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "merchants",
      version: 1,
      storage,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
