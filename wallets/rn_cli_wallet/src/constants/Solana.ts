// Solana
import Solana from '@/assets/chains/solana.png';
import { Chain } from '@/utils/TypesUtil';

/**
 * Methods
 */
export const SOLANA_SIGNING_METHODS = {
  SOLANA_SIGN_TRANSACTION: 'solana_signTransaction',
  SOLANA_SIGN_MESSAGE: 'solana_signMessage',
  SOLANA_SIGN_AND_SEND_TRANSACTION: 'solana_signAndSendTransaction',
  SOLANA_SIGN_ALL_TRANSACTIONS: 'solana_signAllTransactions',
};

/**
 * Events
 */
export const SOLANA_EVENTS = {
  SOLANA_ACCOUNTS_CHANGED: 'accountsChanged',
  SOLANA_CHAIN_CHANGED: 'chainChanged',
};

export const SOLANA_NAMESPACE = 'solana';

export const SOLANA_MAINNET_ID = '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp';
export const SOLANA_MAINNET_CAIP2 = `${SOLANA_NAMESPACE}:${SOLANA_MAINNET_ID}`;

export type ISolanaChainId = typeof SOLANA_MAINNET_CAIP2;

export const SOLANA_MAINNET_RPC = 'https://api.mainnet-beta.solana.com';

export const SOLANA_MAINNET = {
  [SOLANA_MAINNET_CAIP2]: {
    chainId: SOLANA_MAINNET_ID,
    namespace: SOLANA_NAMESPACE,
    name: 'Solana',
    rpcUrl: SOLANA_MAINNET_RPC,
  },
};

export const SOLANA_NETWORKS_IMAGES = {
  [SOLANA_MAINNET_CAIP2]: Solana,
};

export const SOLANA_CHAINS: Record<string, Chain> = {
  ...SOLANA_MAINNET,
};
