import { proxy } from 'valtio';
import { MMKV } from 'react-native-mmkv';
import { TokenBalance } from '@/utils/BalanceTypes';
import { fetchBalancesForChains } from '@/services/BalanceService';
import { fetchERC20Balances } from '@/services/ERC20BalanceService';
import { EIP155_CHAINS } from '@/constants/Eip155';
import { isSpamToken } from '@/utils/SpamFilter';
import { SOLANA_MAINNET_CAIP2 } from '@/constants/Solana';
import { BIP122_MAINNET_CAIP2 } from '@/constants/Bitcoin';
import LogStore, { serializeError } from '@/store/LogStore';

const mmkv = new MMKV();
const STORAGE_KEY = 'WALLET_BALANCES';

// Supported chains by the blockchain API for non-EIP155
const TON_SUPPORTED_CHAINS = ['ton:-239'];
const TRON_SUPPORTED_CHAINS = ['tron:0x2b6653dc'];
const SUI_SUPPORTED_CHAINS = ['sui:mainnet'];
const SOLANA_SUPPORTED_CHAINS = [SOLANA_MAINNET_CAIP2];
const BITCOIN_SUPPORTED_CHAINS = [BIP122_MAINNET_CAIP2];

export interface WalletAddresses {
  eip155Address?: string;
  tonAddress?: string;
  tronAddress?: string;
  suiAddress?: string;
  solanaAddress?: string;
  bitcoinAddress?: string;
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
  [SOLANA_MAINNET_CAIP2]: { name: 'Solana', symbol: 'SOL', decimals: '9' },
  [BIP122_MAINNET_CAIP2]: { name: 'Bitcoin', symbol: 'BTC', decimals: '8' },
};

/**
 * Processes API balances:
 * 1. Filters out tokens with 0 value (except mainnet native tokens)
 * 2. Ensures mainnet native tokens are always present for address visibility
 */
// Per-namespace flag: true when that chain's balance request failed, so the
// synthesized native row should read "~" (unknown) instead of a confirmed 0.
interface BalanceUnavailableFlags {
  eip155?: boolean;
  ton?: boolean;
  tron?: boolean;
  sui?: boolean;
  solana?: boolean;
  bitcoin?: boolean;
}

function processBalances(
  apiBalances: TokenBalance[],
  addresses: WalletAddresses,
  unavailable: BalanceUnavailableFlags = {},
): TokenBalance[] {
  const mainnetChainIds = Object.keys(MAINNET_NATIVE_TOKENS);

  // Filter: keep tokens with value > 0, mainnet native tokens, or tokens with a non-zero quantity (on-chain ERC-20s without USD price)
  const filtered = apiBalances.filter(b => {
    // Drop spam/airdrop token contracts (native rows have no address)
    if (b.address && isSpamToken(b.symbol)) return false;
    if (b.value > 0) return true;
    if (mainnetChainIds.includes(b.chainId) && !b.address) return true;
    if (parseFloat(b.quantity.numeric) > 0) return true;
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
        balanceUnavailable: unavailable.eip155,
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
        balanceUnavailable: unavailable.ton,
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
        balanceUnavailable: unavailable.tron,
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
        balanceUnavailable: unavailable.sui,
      });
    }
  }

  // SOL on mainnet
  if (addresses.solanaAddress) {
    const hasSolanaMainnet = result.some(
      b => b.chainId === SOLANA_MAINNET_CAIP2 && !b.address,
    );
    if (!hasSolanaMainnet) {
      result.push({
        name: 'Solana',
        symbol: 'SOL',
        chainId: SOLANA_MAINNET_CAIP2,
        value: 0,
        price: 0,
        quantity: { decimals: '9', numeric: '0' },
        iconUrl: undefined,
        balanceUnavailable: unavailable.solana,
      });
    }
  }

  // BTC on mainnet
  if (addresses.bitcoinAddress) {
    const hasBtcMainnet = result.some(
      b => b.chainId === BIP122_MAINNET_CAIP2 && !b.address,
    );
    if (!hasBtcMainnet) {
      result.push({
        name: 'Bitcoin',
        symbol: 'BTC',
        chainId: BIP122_MAINNET_CAIP2,
        value: 0,
        price: 0,
        quantity: { decimals: '8', numeric: '0' },
        iconUrl: undefined,
        balanceUnavailable: unavailable.bitcoin,
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

  async fetchBalances(
    addresses: WalletAddresses,
    options?: { force?: boolean },
  ) {
    // Early return if no addresses are available
    if (
      !addresses.eip155Address &&
      !addresses.tonAddress &&
      !addresses.tronAddress &&
      !addresses.suiAddress &&
      !addresses.solanaAddress &&
      !addresses.bitcoinAddress
    ) {
      return;
    }

    state.isLoading = true;

    try {
      // Fetch all balances in parallel for better performance and resilience
      const eip155ChainIds = Object.keys(EIP155_CHAINS);

      const [
        eip155Result,
        tonResult,
        tronResult,
        suiResult,
        solanaResult,
        bitcoinResult,
        erc20Balances,
      ] = await Promise.all([
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
          ? fetchBalancesForChains(addresses.tronAddress, TRON_SUPPORTED_CHAINS)
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
        // Solana balances (or empty result if no address)
        addresses.solanaAddress
          ? fetchBalancesForChains(
              addresses.solanaAddress,
              SOLANA_SUPPORTED_CHAINS,
            )
          : Promise.resolve({
              balances: [] as TokenBalance[],
              anySuccess: false,
            }),
        // Bitcoin balances (or empty result if no address)
        addresses.bitcoinAddress
          ? fetchBalancesForChains(
              addresses.bitcoinAddress,
              BITCOIN_SUPPORTED_CHAINS,
            )
          : Promise.resolve({
              balances: [] as TokenBalance[],
              anySuccess: false,
            }),
        // On-chain ERC-20 balances (EURC etc.)
        addresses.eip155Address
          ? fetchERC20Balances(addresses.eip155Address)
          : Promise.resolve([] as TokenBalance[]),
      ]);

      // Only update state if at least one API call succeeded
      const anySuccess =
        eip155Result.anySuccess ||
        tonResult.anySuccess ||
        tronResult.anySuccess ||
        suiResult.anySuccess ||
        solanaResult.anySuccess ||
        bitcoinResult.anySuccess;

      if (!anySuccess) {
        return;
      }

      // Combine all balances from the blockchain API
      const apiBalances = [
        ...eip155Result.balances,
        ...tonResult.balances,
        ...tronResult.balances,
        ...suiResult.balances,
        ...solanaResult.balances,
        ...bitcoinResult.balances,
      ];

      // Merge on-chain ERC-20 balances (only non-zero) unless the API already returned them
      for (const erc20 of erc20Balances) {
        const hasBalance = parseFloat(erc20.quantity.numeric) > 0;
        if (!hasBalance) {
          continue;
        }
        const alreadyFromApi = apiBalances.some(
          b =>
            b.chainId === erc20.chainId &&
            b.address?.toLowerCase() === erc20.address?.toLowerCase(),
        );
        if (!alreadyFromApi) {
          apiBalances.push(erc20);
        }
      }

      // Protect against API returning empty data when we have valid cached
      // data. Skipped on explicit refetch (e.g. after wallet import), where
      // an "empty" result is the desired ground truth.
      if (!options?.force) {
        const totalValue = apiBalances.reduce((s, b) => s + b.value, 0);
        const cachedTotalValue = state.balances.reduce(
          (s, b) => s + b.value,
          0,
        );
        if (totalValue === 0 && cachedTotalValue > 0) {
          return;
        }
      }

      // A group that has an address but didn't return any successful response
      // means the balance is unknown (e.g. the API rejects bip122/sui) — mark
      // it so the synthesized native row shows "~" instead of a confirmed 0.
      const unavailable = {
        eip155: !!addresses.eip155Address && !eip155Result.anySuccess,
        ton: !!addresses.tonAddress && !tonResult.anySuccess,
        tron: !!addresses.tronAddress && !tronResult.anySuccess,
        sui: !!addresses.suiAddress && !suiResult.anySuccess,
        solana: !!addresses.solanaAddress && !solanaResult.anySuccess,
        bitcoin: !!addresses.bitcoinAddress && !bitcoinResult.anySuccess,
      };

      // Filter 0-balance tokens and ensure mainnet natives are present
      const allBalances = processBalances(apiBalances, addresses, unavailable);

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
