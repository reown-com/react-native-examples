import Config from 'react-native-config';
import DeviceInfo from 'react-native-device-info';
import { TokenBalance, BalanceResponse } from '@/utils/BalanceTypes';

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
  const baseUrl = Config.ENV_BLOCKCHAIN_API_URL;
  const projectId = Config.ENV_PROJECT_ID;
  const origin = DeviceInfo.getBundleId();

  if (!baseUrl || !projectId) {
    return [];
  }

  const url = `${baseUrl}${BALANCE_API_PATH}/${address}/balance?projectId=${encodeURIComponent(
    projectId,
  )}&currency=usd&chainId=${chainId}&st=walletkit&sv=1.0.0`;

  const response = await fetch(url.toString(), {
    headers: {
      Origin: origin,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch balance for ${chainId}: ${response.status}`,
    );
  }

  const data: BalanceResponse = await response.json();

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
  const results = await Promise.allSettled(
    chainIds.map(chainId => fetchBalanceForChain(address, chainId)),
  );

  const allBalances: TokenBalance[] = [];
  let anySuccess = false;

  results.forEach(result => {
    if (result.status === 'fulfilled') {
      anySuccess = true;
      allBalances.push(...result.value);
    }
  });

  return { balances: allBalances, anySuccess };
}
