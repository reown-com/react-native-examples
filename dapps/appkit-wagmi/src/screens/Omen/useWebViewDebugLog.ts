import {useCallback, useRef, useState} from 'react';

/**
 * Tiny in-memory debug log for the deposit WebView. We have no console access inside the remote BX
 * page on-device, so every navigation/handler/console line is funneled here and rendered by
 * WebViewDebugOverlay. Capped ring buffer — plain React state, no external store.
 */
export type DebugLevel = 'nav' | 'open' | 'msg' | 'console' | 'error';

export interface DebugEntry {
  id: string;
  ts: number;
  level: DebugLevel;
  label: string;
  detail?: string;
}

const MAX_ENTRIES = 200;

export interface WebViewDebugLog {
  entries: DebugEntry[];
  log: (level: DebugLevel, label: string, detail?: string) => void;
  clear: () => void;
}

export function useWebViewDebugLog(): WebViewDebugLog {
  const [entries, setEntries] = useState<DebugEntry[]>([]);
  const seq = useRef(0);

  const log = useCallback((level: DebugLevel, label: string, detail?: string) => {
    seq.current += 1;
    const entry: DebugEntry = {
      id: `${Date.now().toString(36)}_${seq.current}`,
      ts: Date.now(),
      level,
      label,
      detail,
    };
    setEntries(prev => {
      const next = [entry, ...prev];
      return next.length > MAX_ENTRIES ? next.slice(0, MAX_ENTRIES) : next;
    });
  }, []);

  const clear = useCallback(() => setEntries([]), []);

  return {entries, log, clear};
}
