import { proxy } from 'valtio';
import { MMKV } from 'react-native-mmkv';
import { TokenBalance } from '@/utils/BalanceTypes';
import { fetchBalancesForChains } from '@/services/BalanceService';
import { EIP155_CHAINS } from '@/constants/Eip155';

const mmkv = new MMKV();
const STORAGE_KEY = 'WALLET_BALANCES';

// Supported chains by the blockchain API for non-EIP155
const TON_SUPPORTED_CHAINS = ['ton:-239'];
const TRON_SUPPORTED_CHAINS = ['tron:0x2b6653dc'];

export interface WalletAddresses {
  eip155Address: string;
  tonAddress?: string;
  tronAddress?: string;
}

interface WalletState {
  balances: TokenBalance[];
  isLoading: boolean;
  lastUpdated: number | null;
}

function getInitialBalances(): TokenBalance[] {
  try {
    const cached = mmkv.getString(STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.warn('Failed to parse cached balances:', error);
  }
  return [];
}

const state = proxy<WalletState>({
  balances: getInitialBalances(),
  isLoading: false,
  lastUpdated: null,
});

function saveToStorage(balances: TokenBalance[]) {
  try {
    mmkv.set(STORAGE_KEY, JSON.stringify(balances));
  } catch (error) {
    console.warn('Failed to save balances to storage:', error);
  }
}

// Mainnet native tokens that should always be shown (so user can see their address)
const MAINNET_NATIVE_TOKENS = {
  'eip155:1': { name: 'Ethereum', symbol: 'ETH', decimals: '18' },
  'ton:-239': { name: 'Toncoin', symbol: 'TON', decimals: '9' },
  'tron:0x2b6653dc': { name: 'TRON', symbol: 'TRX', decimals: '6' },
};

/**
 * Processes API balances:
 * 1. Filters out tokens with 0 value (except mainnet native tokens)
 * 2. Ensures mainnet native tokens are always present for address visibility
 */
function processBalances(
  apiBalances: TokenBalance[],
  addresses: WalletAddresses,
): TokenBalance[] {
  const mainnetChainIds = Object.keys(MAINNET_NATIVE_TOKENS);

  // Filter: keep tokens with value > 0, OR mainnet native tokens (even if 0)
  const filtered = apiBalances.filter(b => {
    // Always keep tokens with value
    if (b.value > 0) return true;
    // Keep mainnet native tokens (no address = native token)
    if (mainnetChainIds.includes(b.chainId) && !b.address) return true;
    return false;
  });

  // Ensure mainnet native tokens are present
  const result = [...filtered];

  // ETH on mainnet
  if (addresses.eip155Address) {
    const hasEthMainnet = result.some(
      b => b.chainId === 'eip155:1' && !b.address,
    );
    if (!hasEthMainnet) {
      result.push({
        name: 'Ethereum',
        symbol: 'ETH',
        chainId: 'eip155:1',
        value: 0,
        price: 0,
        quantity: { decimals: '18', numeric: '0' },
        iconUrl: undefined,
      });
    }
  }

  // TON on mainnet
  if (addresses.tonAddress) {
    const hasTonMainnet = result.some(
      b => b.chainId === 'ton:-239' && !b.address,
    );
    if (!hasTonMainnet) {
      result.push({
        name: 'Toncoin',
        symbol: 'TON',
        chainId: 'ton:-239',
        value: 0,
        price: 0,
        quantity: { decimals: '9', numeric: '0' },
        iconUrl: undefined,
      });
    }
  }

  // TRX on mainnet
  if (addresses.tronAddress) {
    const hasTrxMainnet = result.some(
      b => b.chainId === 'tron:0x2b6653dc' && !b.address,
    );
    if (!hasTrxMainnet) {
      result.push({
        name: 'TRON',
        symbol: 'TRX',
        chainId: 'tron:0x2b6653dc',
        value: 0,
        price: 0,
        quantity: { decimals: '6', numeric: '0' },
        iconUrl: undefined,
      });
    }
  }

  return result;
}

const WalletStore = {
  state,

  setBalances(balances: TokenBalance[]) {
    state.balances = balances;
    state.lastUpdated = Date.now();
    saveToStorage(balances);
  },

  setLoading(loading: boolean) {
    state.isLoading = loading;
  },

  async fetchBalances(addresses: WalletAddresses) {
    if (!addresses.eip155Address) {
      console.warn('No EIP155 address provided for balance fetch');
      return;
    }

    state.isLoading = true;

    try {
      // Fetch EIP155 balances
      const eip155ChainIds = Object.keys(EIP155_CHAINS);
      const eip155Result = await fetchBalancesForChains(
        addresses.eip155Address,
        eip155ChainIds,
      );

      // Fetch TON balances if address exists
      let tonResult = { balances: [] as TokenBalance[], anySuccess: false };
      if (addresses.tonAddress) {
        tonResult = await fetchBalancesForChains(
          addresses.tonAddress,
          TON_SUPPORTED_CHAINS,
        );
      }

      // Fetch TRON balances if address exists
      let tronResult = { balances: [] as TokenBalance[], anySuccess: false };
      if (addresses.tronAddress) {
        tronResult = await fetchBalancesForChains(
          addresses.tronAddress,
          TRON_SUPPORTED_CHAINS,
        );
      }

      // Only update state if at least one API call succeeded
      const anySuccess =
        eip155Result.anySuccess ||
        tonResult.anySuccess ||
        tronResult.anySuccess;

      if (!anySuccess) {
        console.warn('All balance API calls failed, keeping cached data');
        return;
      }

      // Combine all balances
      const apiBalances = [
        ...eip155Result.balances,
        ...tonResult.balances,
        ...tronResult.balances,
      ];

      // Filter 0-balance tokens and ensure mainnet natives are present
      const allBalances = processBalances(apiBalances, addresses);

      // Sort: tokens with value first, then by chain
      allBalances.sort((a, b) => {
        if (a.value !== b.value) {
          return b.value - a.value; // Higher value first
        }
        return a.chainId.localeCompare(b.chainId);
      });

      WalletStore.setBalances(allBalances);
    } catch (error) {
      console.error('Failed to fetch balances:', error);
    } finally {
      state.isLoading = false;
    }
  },

  clearBalances() {
    state.balances = [];
    state.lastUpdated = null;
    mmkv.delete(STORAGE_KEY);
  },
};

export default WalletStore;
