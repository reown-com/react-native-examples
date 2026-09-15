import { proxy, ref } from 'valtio';
import { Appearance } from 'react-native';
import { Verify, SessionTypes } from '@walletconnect/types';

import { storage } from '@/utils/storage';
import type EIP155Lib from '../lib/EIP155Lib';
import type SuiLib from '../lib/SuiLib';
import type TonLib from '../lib/TonLib';
import type TronLib from '../lib/TronLib';
import type CantonLib from '../lib/CantonLib';
import type SolanaLib from '../lib/SolanaLib';
import type BitcoinLib from '../lib/BitcoinLib';
import type StellarLib from '../lib/StellarLib';
import { MMKV } from 'react-native-mmkv';

type WalletReadiness = 'idle' | 'loading' | 'ready' | 'failed';

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

// `toggleTestNets` persists 'YES' via storage.setItem (JSON-encoded as '"YES"'),
// so read it back the same way for a synchronous initial value.
function getInitialTestNets(): boolean {
  const saved = new MMKV().getString('TEST_NETS');
  return saved === '"YES"' || saved === 'YES';
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
  bitcoinAddresses: string[];
  bitcoinWallet: BitcoinLib | null;
  stellarAddress: string;
  stellarWallet: StellarLib | null;
  walletReadiness: Record<
    | 'eip155'
    | 'sui'
    | 'ton'
    | 'tron'
    | 'canton'
    | 'solana'
    | 'bip122'
    | 'stellar',
    WalletReadiness
  >;
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
}

/**
 * State
 */
const state = proxy<State>({
  testNets: getInitialTestNets(),
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
  bitcoinAddresses: [],
  bitcoinWallet: null,
  stellarAddress: '',
  stellarWallet: null,
  walletReadiness: {
    eip155: 'idle',
    sui: 'idle',
    ton: 'idle',
    tron: 'idle',
    canton: 'idle',
    solana: 'idle',
    bip122: 'idle',
    stellar: 'idle',
  },
  relayerRegionURL: '',
  sessions: [],
  wallet: null,
  socketStatus: 'unknown',
  logs: [],
  isLinkModeRequest: false,
  themeMode: getInitialThemeMode(),
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
    state.bitcoinAddresses = [bitcoinAddress];
  },

  setBitcoinAddresses(bitcoinAddresses: string[]) {
    state.bitcoinAddresses = bitcoinAddresses;
    state.bitcoinAddress = bitcoinAddresses[0] ?? '';
  },

  setBitcoinWallet(bitcoinWallet: BitcoinLib) {
    state.bitcoinWallet = ref(bitcoinWallet);
  },

  setStellarAddress(stellarAddress: string) {
    state.stellarAddress = stellarAddress;
  },

  setStellarWallet(stellarWallet: StellarLib) {
    state.stellarWallet = ref(stellarWallet);
  },

  setWalletReadiness(
    namespace: keyof State['walletReadiness'],
    readiness: WalletReadiness,
  ) {
    state.walletReadiness[namespace] = readiness;
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
