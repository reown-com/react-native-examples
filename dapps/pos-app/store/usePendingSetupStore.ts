import { SetupPayload } from "@/utils/parse-setup-qr";
import { create } from "zustand";

// Transient (non-persisted) hand-off channel for a scanned terminal setup
// (merchant ID + Customer API key). The in-app scanner
// (`app/scan-setup-qr.tsx`) and the `wpay://setup` deep link route
// (`app/setup.tsx`) write the parsed payload here and navigate to settings;
// the settings screen consumes it to run the PIN-gated save. A navigation param
// can't update the already-mounted settings screen, so a tiny store is the
// clean way to pass the value back.
interface PendingSetupStore {
  pendingSetup: SetupPayload | null;
  setPendingSetup: (payload: SetupPayload) => void;
  clear: () => void;
}

export const usePendingSetupStore = create<PendingSetupStore>((set) => ({
  pendingSetup: null,
  setPendingSetup: (payload) => set({ pendingSetup: payload }),
  clear: () => set({ pendingSetup: null }),
}));
