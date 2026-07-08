import { ENV } from '@/utils/env';
import { getBundleId } from '@/utils/AppInfo';
import { TokenBalance, BalanceResponse } from '@/utils/BalanceTypes';
import LogStore, { serializeError } from '@/store/LogStore';

const BALANCE_API_PATH = '/v1/account';

/**
 * Fetches token balances for a single chain
 * @param address - Wallet address
 * @param chainId - CAIP-2 chain ID (e.g., "eip155:1")
 * @returns Array of token balances for the chain
 */
async function fetchBalanceForChain(
  address: string,
  chainId: string,
): Promise<TokenBalance[]> {
  const baseUrl = ENV.BLOCKCHAIN_API_URL;
  const projectId = ENV.PROJECT_ID;
  const origin = getBundleId();

  LogStore.log(
    'fetchBalanceForChain called',
    'BalanceService',
    'fetchBalanceForChain',
    {
      address,
      chainId,
      baseUrl,
      projectId: projectId ? '***' : 'MISSING',
      origin,
    },
  );

  if (!baseUrl || !projectId) {
    LogStore.warn(
      'Missing baseUrl or projectId, returning []',
      'BalanceService',
      'fetchBalanceForChain',
    );
    return [];
  }

  const url = new URL(`${BALANCE_API_PATH}/${address}/balance`, baseUrl);
  url.searchParams.set('projectId', projectId);
  url.searchParams.set('currency', 'usd');
  url.searchParams.set('chainId', chainId);
  url.searchParams.set('st', 'walletkit');
  url.searchParams.set('sv', '1.0.0');

  LogStore.log('Fetching URL', 'BalanceService', 'fetchBalanceForChain', {
    url: url.toString(),
  });

  const response = await fetch(url.toString(), {
    headers: {
      Origin: origin,
    },
  });

  LogStore.log('Response received', 'BalanceService', 'fetchBalanceForChain', {
    status: response.status,
  });

  if (!response.ok) {
    const errorText = await response.text();
    // A 400 means the balance API doesn't support this chain/address format
    // (e.g. bip122/Bitcoin, sui) — this is expected and handled by the caller
    // (fails silently per-chain), so log it as a warning rather than an error.
    if (response.status === 400) {
      LogStore.warn(
        'Chain not supported by balance API',
        'BalanceService',
        'fetchBalanceForChain',
        { chainId, status: response.status, body: errorText },
      );
    } else {
      LogStore.error(
        'Error response',
        'BalanceService',
        'fetchBalanceForChain',
        { chainId, status: response.status, body: errorText },
      );
    }
    throw new Error(
      `Failed to fetch balance for ${chainId}: ${response.status}`,
    );
  }

  const data: BalanceResponse = await response.json();

  LogStore.log('Response data', 'BalanceService', 'fetchBalanceForChain', {
    chainId,
    balancesCount: data.balances?.length ?? 0,
    balances: data.balances,
  });

  return data.balances || [];
}

export interface FetchBalancesResult {
  balances: TokenBalance[];
  anySuccess: boolean;
}

/**
 * Fetches token balances for multiple chains in parallel
 * Fails silently for unsupported chains
 * @param address - Wallet address
 * @param chainIds - Array of CAIP-2 chain IDs
 * @returns Object with combined balances and success flag
 */
export async function fetchBalancesForChains(
  address: string,
  chainIds: string[],
): Promise<FetchBalancesResult> {
  LogStore.log(
    'fetchBalancesForChains called',
    'BalanceService',
    'fetchBalancesForChains',
    {
      address,
      chainIds,
    },
  );

  const results = await Promise.allSettled(
    chainIds.map(chainId => fetchBalanceForChain(address, chainId)),
  );

  const allBalances: TokenBalance[] = [];
  let anySuccess = false;

  results.forEach((result, index) => {
    const chainId = chainIds[index];
    if (result.status === 'fulfilled') {
      anySuccess = true;
      LogStore.log(
        `Chain ${chainId} succeeded`,
        'BalanceService',
        'fetchBalancesForChains',
        {
          balancesCount: result.value.length,
        },
      );
      allBalances.push(...result.value);
    } else {
      // Unsupported chains reject with a ": 400" suffix (see fetchBalanceForChain).
      // Those are expected and already warned about; only genuine failures
      // (network/5xx) should log at error level here.
      const reasonMessage =
        result.reason instanceof Error ? result.reason.message : '';
      const isUnsupportedChain = reasonMessage.endsWith(': 400');
      if (isUnsupportedChain) {
        LogStore.warn(
          `Chain ${chainId} not supported by balance API`,
          'BalanceService',
          'fetchBalancesForChains',
          { error: serializeError(result.reason) },
        );
      } else {
        LogStore.error(
          `Chain ${chainId} failed`,
          'BalanceService',
          'fetchBalancesForChains',
          { error: serializeError(result.reason) },
        );
      }
    }
  });

  LogStore.log('Final result', 'BalanceService', 'fetchBalancesForChains', {
    totalBalances: allBalances.length,
    anySuccess,
  });

  return { balances: allBalances, anySuccess };
}
