import {proxy} from 'valtio';

/**
 * Types
 */
interface State {
  isCurrentRequestLinkMode?: boolean;
}

/**
 * State
 */
const state = proxy<State>({
  isCurrentRequestLinkMode: false,
});

/**
 * Store / Actions
 */
const SettingsStore = {
  state,

  setCurrentRequestLinkMode(value: boolean) {
    state.isCurrentRequestLinkMode = value;
  },
};

export default SettingsStore;
