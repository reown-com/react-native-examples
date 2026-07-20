import { proxy, ref } from 'valtio';
import { Appearance } from 'react-native';
import { Verify, SessionTypes } from '@walletconnect/types';

import { storage } from '@/utils/storage';
import EIP155Lib from '../lib/EIP155Lib';
import SuiLib from '../lib/SuiLib';
import TonLib from '../lib/TonLib';
import TronLib from '../lib/TronLib';
import CantonLib from '../lib/CantonLib';
import SolanaLib from '../lib/SolanaLib';
import BitcoinLib from '../lib/BitcoinLib';
import { MMKV } from 'react-native-mmkv';

function getInitialThemeMode(): 'light' | 'dark' {
  const mmkv = new MMKV();
  const saved = mmkv.getString('THEME_MODE');
  if (saved === 'light' || saved === 'dark') {
    Appearance.setColorScheme?.(saved);
    return saved;
  }

  const systemMode = Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
  Appearance.setColorScheme?.(systemMode);
  return systemMode;
}

/**
 * Types
 */
interface State {
  testNets: boolean;
  account: number;
  eip155Address: string;
  suiAddress: string;
  suiWallet: SuiLib | null;
  tonAddress: string;
  tonWallet: TonLib | null;
  tronAddress: string;
  tronWallet: TronLib | null;
  cantonAddress: string;
  cantonWallet: CantonLib | null;
  solanaAddress: string;
  solanaWallet: SolanaLib | null;
  bitcoinAddress: string;
  bitcoinWallet: BitcoinLib | null;
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
  themeMode: 'light' | 'dark';
  // Dapp Picker POC
  pickerAutoConnect: boolean;
  pickerConsentAsked: boolean;
  pickerHeadless: boolean;
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
  tonWallet: null,
  tronAddress: '',
  tronWallet: null,
  cantonAddress: '',
  cantonWallet: null,
  solanaAddress: '',
  solanaWallet: null,
  bitcoinAddress: '',
  bitcoinWallet: null,
  relayerRegionURL: '',
  sessions: [],
  wallet: null,
  socketStatus: 'unknown',
  logs: [],
  isLinkModeRequest: false,
  themeMode: getInitialThemeMode(),
  pickerAutoConnect: new MMKV().getBoolean('PICKER_AUTO_CONNECT') ?? false,
  pickerConsentAsked: new MMKV().getBoolean('PICKER_CONSENT_ASKED') ?? false,
  pickerHeadless: new MMKV().getBoolean('PICKER_HEADLESS') ?? true,
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
    // ref() keeps the wallet out of valtio's proxy: ethers v6's private
    // #signingKey throws through a Proxy and valtio would corrupt the shared
    // eip155Wallets instance.
    state.wallet = ref(wallet);
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
      state.initPromiseResolver = { resolve, reject };
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

  setPickerConsent(granted: boolean) {
    state.pickerAutoConnect = granted;
    state.pickerConsentAsked = true;
    const mmkv = new MMKV();
    mmkv.set('PICKER_AUTO_CONNECT', granted);
    if (granted) {
      mmkv.set('PICKER_CONSENT_ASKED', true);
    } else {
      // "Not now" applies to the current app run only — the consent
      // alert shows again on next app start.
      mmkv.delete('PICKER_CONSENT_ASKED');
    }
  },

  togglePickerHeadless() {
    state.pickerHeadless = !state.pickerHeadless;
    new MMKV().set('PICKER_HEADLESS', state.pickerHeadless);
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
    state.suiWallet = ref(suiWallet);
  },

  setTonAddress(tonAddress: string) {
    state.tonAddress = tonAddress;
  },

  setTonWallet(tonWallet: TonLib) {
    state.tonWallet = ref(tonWallet);
  },

  setTronAddress(tronAddress: string) {
    state.tronAddress = tronAddress;
  },

  setTronWallet(tronWallet: TronLib) {
    state.tronWallet = ref(tronWallet);
  },

  setCantonAddress(cantonAddress: string) {
    state.cantonAddress = cantonAddress;
  },

  setCantonWallet(cantonWallet: CantonLib) {
    state.cantonWallet = ref(cantonWallet);
  },

  setSolanaAddress(solanaAddress: string) {
    state.solanaAddress = solanaAddress;
  },

  setSolanaWallet(solanaWallet: SolanaLib) {
    state.solanaWallet = ref(solanaWallet);
  },

  setBitcoinAddress(bitcoinAddress: string) {
    state.bitcoinAddress = bitcoinAddress;
  },

  setBitcoinWallet(bitcoinWallet: BitcoinLib) {
    state.bitcoinWallet = ref(bitcoinWallet);
  },

  setThemeMode(value: 'light' | 'dark') {
    state.themeMode = value;
    Appearance.setColorScheme?.(value);
    storage.setItem('THEME_MODE', value);
  },

  async loadThemeMode() {
    const saved = await storage.getItem<string>('THEME_MODE');
    if (saved === 'light' || saved === 'dark') {
      state.themeMode = saved;
      Appearance.setColorScheme?.(saved);
    }
  },
};

export default SettingsStore;
