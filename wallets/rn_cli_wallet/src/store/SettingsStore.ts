import {proxy} from 'valtio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Verify, SessionTypes} from '@walletconnect/types';

import EIP155Lib from '../lib/EIP155Lib';

/**
 * Types
 */
interface State {
  testNets: boolean;
  account: number;
  eip155Address: string;
  relayerRegionURL: string;
  activeChainId: string;
  currentRequestVerifyContext?: Verify.Context;
  sessions: SessionTypes.Struct[];
  wallet: EIP155Lib | null;
  initPromise?: Promise<void>;
  initPromiseResolver?: {
    resolve: (value: undefined) => void;
    reject: (reason?: unknown) => void;
  };
  socketStatus: 'connected' | 'disconnected' | 'stalled' | 'unknown';
  logs: string[];
  isLinkModeRequest: boolean;
}

/**
 * State
 */
const state = proxy<State>({
  testNets: false, //add async boolean
  account: 0,
  activeChainId: '1',
  eip155Address: '',
  relayerRegionURL: '',
  sessions: [],
  wallet: null,
  socketStatus: 'unknown',
  logs: [],
  isLinkModeRequest: false,
});

/**
 * Store / Actions
 */
const SettingsStore = {
  state,

  setAccount(value: number) {
    state.account = value;
  },

  setEIP155Address(eip155Address: string) {
    state.eip155Address = eip155Address;
  },

  setWallet(wallet: EIP155Lib) {
    state.wallet = wallet;
  },

  setActiveChainId(value: string) {
    state.activeChainId = value;
  },

  setCurrentRequestVerifyContext(context?: Verify.Context) {
    state.currentRequestVerifyContext = context;
  },

  setSessions(sessions: SessionTypes.Struct[]) {
    state.sessions = sessions;
  },

  setInitPromise() {
    state.initPromise = new Promise((resolve, reject) => {
      state.initPromiseResolver = {resolve, reject};
    });
  },

  setSocketStatus(value: State['socketStatus']) {
    state.socketStatus = value;
  },

  setLogs(logs: string[]) {
    state.logs = logs;
  },

  setIsLinkModeRequest(value: State['isLinkModeRequest']) {
    state.isLinkModeRequest = value;
  },

  toggleTestNets() {
    state.testNets = !state.testNets;
    if (state.testNets) {
      AsyncStorage.setItem('TEST_NETS', 'YES');
    } else {
      AsyncStorage.removeItem('TEST_NETS');
    }
  },
};

export default SettingsStore;
