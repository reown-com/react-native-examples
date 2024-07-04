import {proxy} from 'valtio';

/**
 * Types
 */
interface State {
  isCurrentRequestLinkMode?: boolean;
  socketStatus: 'connected' | 'disconnected' | 'stalled' | 'unknown';
}

/**
 * State
 */
const state = proxy<State>({
  isCurrentRequestLinkMode: false,
  socketStatus: 'unknown',
});

/**
 * Store / Actions
 */
const SettingsStore = {
  state,

  setCurrentRequestLinkMode(value: State['isCurrentRequestLinkMode']) {
    state.isCurrentRequestLinkMode = value;
  },

  setSocketStatus(value: State['socketStatus']) {
    state.socketStatus = value;
  },
};

export default SettingsStore;
