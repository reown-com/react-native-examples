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

const logsStorage = {
  getItem: <T = any>(key: string) => {
    if (isRunningInIframe()) return null;
    return storage.getItem<T>(key);
  },
  setItem: <T = any>(key: string, value: T) => {
    if (isRunningInIframe()) return;
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
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Logs hydration failed:", error);
        }
        state?.setHasHydrated(true);
      },
    },
  ),
);
