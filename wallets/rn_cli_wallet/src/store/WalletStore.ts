import { proxy } from 'valtio';
import { MMKV } from 'react-native-mmkv';
import { TokenBalance } from '@/utils/BalanceTypes';
import { fetchBalancesForChains } from '@/services/BalanceService';
import { EIP155_CHAINS } from '@/constants/Eip155';
import LogStore, { serializeError } from '@/store/LogStore';

const mmkv = new MMKV();
const STORAGE_KEY = 'WALLET_BALANCES';

// Supported chains by the blockchain API for non-EIP155
const TON_SUPPORTED_CHAINS = ['ton:-239'];
const TRON_SUPPORTED_CHAINS = ['tron:0x2b6653dc'];
const SUI_SUPPORTED_CHAINS = ['sui:mainnet'];

export interface WalletAddresses {
  eip155Address?: string;
  tonAddress?: string;
  tronAddress?: string;
  suiAddress?: string;
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
    LogStore.warn(
      'Failed to parse cached balances',
      'WalletStore',
      'getInitialBalances',
      {
        error: serializeError(error),
      },
    );
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
    LogStore.warn(
      'Failed to save balances to storage',
      'WalletStore',
      'saveToStorage',
      {
        error: serializeError(error),
      },
    );
  }
}

// Mainnet native tokens that should always be shown (so user can see their address)
const MAINNET_NATIVE_TOKENS = {
  'eip155:1': { name: 'Ethereum', symbol: 'ETH', decimals: '18' },
  'ton:-239': { name: 'Toncoin', symbol: 'TON', decimals: '9' },
  'tron:0x2b6653dc': { name: 'TRON', symbol: 'TRX', decimals: '6' },
  'sui:mainnet': { name: 'Sui', symbol: 'SUI', decimals: '9' },
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

  // SUI on mainnet
  if (addresses.suiAddress) {
    const hasSuiMainnet = result.some(
      b => b.chainId === 'sui:mainnet' && !b.address,
    );
    if (!hasSuiMainnet) {
      result.push({
        name: 'Sui',
        symbol: 'SUI',
        chainId: 'sui:mainnet',
        value: 0,
        price: 0,
        quantity: { decimals: '9', numeric: '0' },
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
    // Early return if no addresses are available
    if (
      !addresses.eip155Address &&
      !addresses.tonAddress &&
      !addresses.tronAddress &&
      !addresses.suiAddress
    ) {
      return;
    }

    state.isLoading = true;

    try {
      // Fetch all balances in parallel for better performance and resilience
      const eip155ChainIds = Object.keys(EIP155_CHAINS);

      const [eip155Result, tonResult, tronResult, suiResult] =
        await Promise.all([
          // EIP155 balances (or empty result if no address)
          addresses.eip155Address
            ? fetchBalancesForChains(addresses.eip155Address, eip155ChainIds)
            : Promise.resolve({
                balances: [] as TokenBalance[],
                anySuccess: false,
              }),
          // TON balances (or empty result if no address)
          addresses.tonAddress
            ? fetchBalancesForChains(addresses.tonAddress, TON_SUPPORTED_CHAINS)
            : Promise.resolve({
                balances: [] as TokenBalance[],
                anySuccess: false,
              }),
          // TRON balances (or empty result if no address)
          addresses.tronAddress
            ? fetchBalancesForChains(
                addresses.tronAddress,
                TRON_SUPPORTED_CHAINS,
              )
            : Promise.resolve({
                balances: [] as TokenBalance[],
                anySuccess: false,
              }),
          // SUI balances (or empty result if no address)
          addresses.suiAddress
            ? fetchBalancesForChains(addresses.suiAddress, SUI_SUPPORTED_CHAINS)
            : Promise.resolve({
                balances: [] as TokenBalance[],
                anySuccess: false,
              }),
        ]);

      // Only update state if at least one API call succeeded
      const anySuccess =
        eip155Result.anySuccess ||
        tonResult.anySuccess ||
        tronResult.anySuccess ||
        suiResult.anySuccess;

      if (!anySuccess) {
        return;
      }

      // Combine all balances
      const apiBalances = [
        ...eip155Result.balances,
        ...tonResult.balances,
        ...tronResult.balances,
        ...suiResult.balances,
      ];

      // Protect against API returning empty data when we have valid cached data
      const totalValue = apiBalances.reduce((s, b) => s + b.value, 0);
      const cachedTotalValue = state.balances.reduce((s, b) => s + b.value, 0);
      if (totalValue === 0 && cachedTotalValue > 0) {
        return;
      }

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
      LogStore.error(
        'Failed to fetch balances',
        'WalletStore',
        'fetchBalances',
        {
          error: serializeError(error),
        },
      );
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
