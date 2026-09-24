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
  /**
   * Server merchant id (`mrch_…`) for this install, set once at first
   * onboarding. One merchant per install: it's the anchor for "already
   * onboarded?" routing and is reused (with re-synced settlements) when a
   * different wallet logs in. Null until the first merchant is created.
   */
  installMerchantId: string | null;
  /** Address of the merchant in the current session, or null when logged out. */
  activeAddress: string | null;
  /**
   * Addresses that have proved ownership (signed) for the *current* wallet
   * connection. Persisted so an app restart with the same live session doesn't
   * re-prompt, but cleared on disconnect so a reconnect signs again.
   */
  verifiedAddresses: string[];
  _hasHydrated: boolean;

  isRegistered: (address: string) => boolean;
  getMerchant: (address: string) => MerchantConfig | undefined;
  /** Any local entry whose `merchantId` matches — used to detect "this install already has a merchant". */
  findByMerchantId: (merchantId: string) => MerchantConfig | undefined;
  upsertMerchant: (config: MerchantConfig) => void;
  /** Record this install's server merchant id (set once at first onboarding). */
  setInstallMerchantId: (id: string | null) => void;
  setActive: (address: string | null) => void;
  /** End the session (disconnect). Registry is kept so the merchant can log back in. */
  clearActive: () => void;
  getActiveMerchant: () => MerchantConfig | undefined;
  /** Whether `address` has signed for the current connection session. */
  isVerified: (address: string) => boolean;
  /** Record that `address` signed in this session. */
  markVerified: (address: string) => void;
  /** Forget all session verifications (called on disconnect). */
  clearVerified: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useMerchantStore = create<MerchantStore>()(
  persist(
    (set, get) => ({
      merchants: {},
      installMerchantId: null,
      activeAddress: null,
      verifiedAddresses: [],
      _hasHydrated: false,

      isRegistered: (address) => Boolean(get().merchants[keyFor(address)]),
      getMerchant: (address) => get().merchants[keyFor(address)],
      findByMerchantId: (merchantId) =>
        Object.values(get().merchants).find((m) => m.merchantId === merchantId),
      upsertMerchant: (config) =>
        set((state) => ({
          merchants: { ...state.merchants, [keyFor(config.address)]: config },
        })),
      setInstallMerchantId: (id) => set({ installMerchantId: id }),
      setActive: (address) => set({ activeAddress: address }),
      clearActive: () => set({ activeAddress: null }),
      getActiveMerchant: () => {
        const { activeAddress, merchants } = get();
        if (!activeAddress) return undefined;
        return merchants[keyFor(activeAddress)];
      },
      isVerified: (address) =>
        get().verifiedAddresses.includes(keyFor(address)),
      markVerified: (address) =>
        set((state) =>
          state.verifiedAddresses.includes(keyFor(address))
            ? state
            : {
                verifiedAddresses: [
                  ...state.verifiedAddresses,
                  keyFor(address),
                ],
              },
        ),
      clearVerified: () => set({ verifiedAddresses: [] }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "merchants",
      version: 2,
      storage,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
