import {proxy} from 'valtio';
import {MMKV} from 'react-native-mmkv';

import {ALL_NETWORK_IDS} from '@/utils/WagmiUtils';

/**
 * Persisted AppKit launch configuration — the per-chain network selection and
 * the SIWX (Sign In With X / One-Click Auth) toggle.
 *
 * `createAppKit` is a singleton, so this is read synchronously at module load
 * (see App.tsx) and only takes effect after the app is reloaded. A raw MMKV
 * instance is used (NOT the async `storage` wrapper) so the values are available
 * synchronously at startup.
 */
const NETWORKS_KEY = 'W3M_ENABLED_NETWORKS';
const SIWX_KEY = 'W3M_SIWX_ENABLED';

const mmkv = new MMKV();

function loadEnabledNetworkIds(): string[] {
  const raw = mmkv.getString(NETWORKS_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Keep only known ids and drop duplicates — stored values can be stale
        // (e.g. a network removed from the registry) and NETWORK_GROUPS only
        // renders known ids, so unknown/duplicate entries would be unremovable
        // and would skew the settings screen's dirty-check.
        const known = new Set(ALL_NETWORK_IDS);
        const sanitized = [
          ...new Set(
            parsed.filter(id => typeof id === 'string' && known.has(id)),
          ),
        ];
        if (sanitized.length > 0) {
          return sanitized;
        }
      }
    } catch {
      // ignore malformed value and fall back to defaults
    }
  }
  return [...ALL_NETWORK_IDS];
}

function loadSiwxEnabled(): boolean {
  const stored = mmkv.getBoolean(SIWX_KEY);
  return typeof stored === 'boolean' ? stored : true;
}

interface State {
  enabledNetworkIds: string[];
  siwxEnabled: boolean;
}

const state = proxy<State>({
  enabledNetworkIds: loadEnabledNetworkIds(),
  siwxEnabled: loadSiwxEnabled(),
});

const AppKitConfigStore = {
  state,

  // --- Networks ---
  isNetworkEnabled(id: string) {
    return state.enabledNetworkIds.includes(id);
  },

  toggleNetwork(id: string) {
    if (state.enabledNetworkIds.includes(id)) {
      state.enabledNetworkIds = state.enabledNetworkIds.filter(
        existing => existing !== id,
      );
    } else {
      state.enabledNetworkIds = [...state.enabledNetworkIds, id];
    }
    mmkv.set(NETWORKS_KEY, JSON.stringify(state.enabledNetworkIds));
  },

  getEnabledNetworkIds(): string[] {
    return [...state.enabledNetworkIds];
  },

  // --- SIWX ---
  setSiwxEnabled(value: boolean) {
    state.siwxEnabled = value;
    mmkv.set(SIWX_KEY, value);
  },

  toggleSiwx() {
    AppKitConfigStore.setSiwxEnabled(!state.siwxEnabled);
  },

  getSiwxEnabled(): boolean {
    return state.siwxEnabled;
  },
};

export default AppKitConfigStore;
