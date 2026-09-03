import { create } from "zustand";

interface PosBridgeStore {
  isConfigured: boolean;
  merchantId: string | null;
  configure: (merchantId: string) => void;
  reset: () => void;
}

/**
 * Runtime-only state for the dashboard bridge. This must never be persisted:
 * the parent window and its credentials are intentionally not POS state.
 */
export const usePosBridgeStore = create<PosBridgeStore>((set) => ({
  isConfigured: false,
  merchantId: null,
  configure: (merchantId) => set({ isConfigured: true, merchantId }),
  reset: () => set({ isConfigured: false, merchantId: null }),
}));
