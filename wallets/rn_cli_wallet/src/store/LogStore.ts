import { proxy, subscribe } from 'valtio';
import { MMKV } from 'react-native-mmkv';
import { nanoid } from 'nanoid/non-secure';

// Types
export type LogLevel = 'log' | 'info' | 'warn' | 'error';

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
  view?: string;
  functionName?: string;
  data?: Record<string, unknown>;
}

interface LogState {
  logs: LogEntry[];
}

// Constants
const MAX_LOGS_COUNT = 100;
const STORAGE_KEY = 'APP_LOGS';

const mmkv = new MMKV();

/**
 * Serialize an error for logging, preserving message and stack trace.
 */
export function serializeError(
  error: unknown,
): { message: string; stack?: string } | string {
  if (error instanceof Error) {
    return { message: error.message, stack: error.stack };
  }
  return String(error);
}

// Load initial logs from storage
function getInitialLogs(): LogEntry[] {
  try {
    const cached = mmkv.getString(STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // Silent fail - start fresh
  }
  return [];
}

// State
const state = proxy<LogState>({
  logs: getInitialLogs(),
});

// Persist logs on change (debounced)
let saveTimeout: NodeJS.Timeout | null = null;
subscribe(state, () => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  saveTimeout = setTimeout(() => {
    try {
      mmkv.set(STORAGE_KEY, JSON.stringify(state.logs));
    } catch {
      // Silent fail
    }
  }, 500);
});

// Store / Actions
const LogStore = {
  state,

  addLog(
    level: LogLevel,
    message: string,
    view?: string,
    functionName?: string,
    data?: Record<string, unknown>,
  ) {
    // Console in dev mode
    if (__DEV__) {
      const devLog = { level, message, view, functionName, data };
      switch (level) {
        case 'error':
          console.error('[LogStore]', devLog);
          break;
        case 'warn':
          console.warn('[LogStore]', devLog);
          break;
        default:
          console.log('[LogStore]', devLog);
      }
    }

    const entry: LogEntry = {
      id: nanoid(),
      timestamp: Date.now(),
      level,
      message,
      view,
      functionName,
      data,
    };

    // Add to beginning (newest first) and limit to MAX_LOGS_COUNT
    state.logs = [entry, ...state.logs].slice(0, MAX_LOGS_COUNT);
  },

  log(
    message: string,
    view?: string,
    functionName?: string,
    data?: Record<string, unknown>,
  ) {
    this.addLog('log', message, view, functionName, data);
  },

  info(
    message: string,
    view?: string,
    functionName?: string,
    data?: Record<string, unknown>,
  ) {
    this.addLog('info', message, view, functionName, data);
  },

  warn(
    message: string,
    view?: string,
    functionName?: string,
    data?: Record<string, unknown>,
  ) {
    this.addLog('warn', message, view, functionName, data);
  },

  error(
    message: string,
    view?: string,
    functionName?: string,
    data?: Record<string, unknown>,
  ) {
    this.addLog('error', message, view, functionName, data);
  },

  clearLogs() {
    state.logs = [];
    mmkv.delete(STORAGE_KEY);
  },

  /**
   * Cleanup function to clear pending timeouts.
   * Call this when the app is terminating or module is unloading.
   */
  cleanup() {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }
  },
};

export default LogStore;
