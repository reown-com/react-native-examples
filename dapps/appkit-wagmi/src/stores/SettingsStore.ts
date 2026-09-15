import {proxy} from 'valtio';

/**
 * Types
 */
interface State {
  isCurrentRequestLinkMode?: boolean;
  socketStatus: 'connected' | 'disconnected' | 'stalled' | 'closed' | 'unknown';
  logs: string[];
}

/**
 * State
 */
const state = proxy<State>({
  isCurrentRequestLinkMode: false,
  socketStatus: 'unknown',
  logs: [],
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

  setLogs(value: State['logs']) {
    state.logs = value;
  },
};

export default SettingsStore;
