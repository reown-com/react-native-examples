import {proxy} from 'valtio';
import {Verify, SessionTypes} from '@walletconnect/types';

import { storage } from '@/utils/storage';
import EIP155Lib from '../lib/EIP155Lib';
import SuiLib from '../lib/SuiLib';

/**
 * Types
 */
interface State {
  testNets: boolean;
  account: number;
  eip155Address: string;
  suiAddress: string;
  suiWallet: SuiLib | null;
  tonAddress: string
  tronAddress: string
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
  suiAddress: '',
  suiWallet: null,
  tonAddress: '',
  tronAddress: '',
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
      storage.setItem('TEST_NETS', 'YES');
    } else {
      storage.removeItem('TEST_NETS');
    }
  },

  setSuiAddress(suiAddress: string) {
    state.suiAddress = suiAddress;
  },

  setSuiWallet(suiWallet: SuiLib) {
    state.suiWallet = suiWallet;
  },

  setTonAddress(tonAddress: string) {
    state.tonAddress = tonAddress
  },

  setTronAddress(tronAddress: string) {
    state.tronAddress = tronAddress
  },
};

export default SettingsStore;
