import { storage } from "@/utils/storage";
import { isRunningInIframe } from "@/utils/is-running-in-iframe";
import { DateRangeFilterType, LogLevelFilterType } from "@/utils/types";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// -- Types --------------------------------------------- //
export type LogLevel = "log" | "info" | "error";

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
  view?: string;
  functionName?: string;
  data?: Record<string, unknown>;
}

interface LogsStore {
  logs: LogEntry[];
  logLevelFilter: LogLevelFilterType;
  logDateRangeFilter: DateRangeFilterType;
  _hasHydrated: boolean;

  // Actions
  addLog: (
    level: LogLevel,
    message: string,
    view?: string,
    functionName?: string,
    data?: Record<string, unknown>,
  ) => void;
  clearLogs: () => void;
  setLogLevelFilter: (filter: LogLevelFilterType) => void;
  setLogDateRangeFilter: (filter: DateRangeFilterType) => void;
  setHasHydrated: (state: boolean) => void;
}

// -- Constants ----------------------------------------- //
const MAX_LOGS_COUNT = 100;

// Persist writes are held until the saved history has been restored (see the
// deferred rehydrate in app/_layout.tsx). Without this, logs added during
// startup — before hydration runs — would persist a buffer-only snapshot and
// overwrite the saved history before we get a chance to merge it back in.
let historyRestored = false;

const logsStorage = {
  getItem: <T = any>(key: string) => {
    if (isRunningInIframe()) return null;
    return storage.getItem<T>(key);
  },
  setItem: <T = any>(key: string, value: T) => {
    if (isRunningInIframe()) return;
    if (!historyRestored) return;
    return storage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (isRunningInIframe()) return;
    return storage.removeItem(key);
  },
};

// -- Store --------------------------------------------- //
export const useLogsStore = create<LogsStore>()(
  persist(
    (set) => ({
      logs: [],
      logLevelFilter: "all",
      logDateRangeFilter: "all_time",
      _hasHydrated: false,

      addLog: (level, message, view, functionName, data) => {
        if (__DEV__) {
          console.log("LOG ENTRY: ", {
            level,
            message,
            view,
            functionName,
            data,
          });
        }
        const entry: LogEntry = {
          id: uuidv4(),
          timestamp: Date.now(),
          level,
          message,
          view,
          functionName,
          data,
        };

        set((state) => {
          const newLogs = [...state.logs, entry];
          // Keep only the last MAX_LOGS_COUNT logs
          if (newLogs.length > MAX_LOGS_COUNT) {
            return { logs: newLogs.slice(-MAX_LOGS_COUNT) };
          }
          return { logs: newLogs };
        });
      },

      clearLogs: () =>
        set({
          logs: [],
          logLevelFilter: "all",
          logDateRangeFilter: "all_time",
        }),

      setLogLevelFilter: (filter) => set({ logLevelFilter: filter }),

      setLogDateRangeFilter: (filter) => set({ logDateRangeFilter: filter }),

      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),
    }),
    {
      name: "logs",
      version: 1,
      storage: logsStorage,
      // Don't read + parse the persisted logs synchronously at import time —
      // that runs on the cold-start path. The root layout calls rehydrate()
      // once the home screen is usable (see app/_layout.tsx).
      skipHydration: true,
      // Combine logs buffered during startup (currentState) with the restored
      // history (persistedState) instead of letting the restore replace them.
      // Restored history is older, so it goes first; newest are kept on cap.
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<LogsStore>;
        const restoredLogs = persisted.logs ?? [];
        const seenIds = new Set<string>();
        const logs = [...restoredLogs, ...currentState.logs]
          .filter((entry) => {
            if (seenIds.has(entry.id)) return false;
            seenIds.add(entry.id);
            return true;
          })
          .slice(-MAX_LOGS_COUNT);
        return { ...currentState, ...persisted, logs };
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Logs hydration failed:", error);
        }
        // Unlock persistence now that the saved history has been read + merged.
        historyRestored = true;
        state?.setHasHydrated(true);
      },
    },
  ),
);
