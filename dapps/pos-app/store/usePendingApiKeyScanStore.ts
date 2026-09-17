import { create } from "zustand";

// Transient (non-persisted) hand-off channel for a scanned Customer API key.
// The full-screen scan route (`app/scan-api-key.tsx`) writes the decoded value
// here and pops back; the settings screen consumes it to run the auto-save
// flow. A navigation param can't update the already-mounted settings screen,
// so a tiny store is the clean way to pass the value back.
interface PendingApiKeyScanStore {
  scannedValue: string | null;
  setScannedValue: (value: string) => void;
  clear: () => void;
}

export const usePendingApiKeyScanStore = create<PendingApiKeyScanStore>(
  (set) => ({
    scannedValue: null,
    setScannedValue: (value) => set({ scannedValue: value }),
    clear: () => set({ scannedValue: null }),
  }),
);
