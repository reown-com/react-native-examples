// Stellar
import Stellar from '@/assets/chains/stellar.png';
import { Chain } from '@/utils/TypesUtil';

/**
 * Methods
 * See the Stellar WalletConnect specs (stellar_signXDR / signAndSubmitXDR /
 * signMessage / signAuthEntry).
 */
export const STELLAR_SIGNING_METHODS = {
  STELLAR_SIGN_XDR: 'stellar_signXDR',
  STELLAR_SIGN_AND_SUBMIT_XDR: 'stellar_signAndSubmitXDR',
  STELLAR_SIGN_MESSAGE: 'stellar_signMessage',
  STELLAR_SIGN_AUTH_ENTRY: 'stellar_signAuthEntry',
};

/**
 * Events
 */
export const STELLAR_EVENTS = {
  STELLAR_ACCOUNTS_CHANGED: 'accountsChanged',
  STELLAR_CHAIN_CHANGED: 'chainChanged',
};

export const STELLAR_NAMESPACE = 'stellar';

// Stellar uses named CAIP-2 references rather than a chain hash.
export const STELLAR_PUBNET_ID = 'pubnet';
export const STELLAR_TESTNET_ID = 'testnet';
export const STELLAR_PUBNET_CAIP2 = `${STELLAR_NAMESPACE}:${STELLAR_PUBNET_ID}`;
export const STELLAR_TESTNET_CAIP2 = `${STELLAR_NAMESPACE}:${STELLAR_TESTNET_ID}`;

// The import modal / balances screen point at mainnet.
export const STELLAR_MAINNET_CAIP2 = STELLAR_PUBNET_CAIP2;

// Horizon endpoints (used for stellar_signAndSubmitXDR).
export const STELLAR_PUBNET_RPC = 'https://horizon.stellar.org';
export const STELLAR_TESTNET_RPC = 'https://horizon-testnet.stellar.org';

export const STELLAR_MAINNET = {
  [STELLAR_PUBNET_CAIP2]: {
    chainId: STELLAR_PUBNET_ID,
    namespace: STELLAR_NAMESPACE,
    name: 'Stellar',
    rpcUrl: STELLAR_PUBNET_RPC,
  },
};

export const STELLAR_TEST = {
  [STELLAR_TESTNET_CAIP2]: {
    chainId: STELLAR_TESTNET_ID,
    namespace: STELLAR_NAMESPACE,
    name: 'Stellar Testnet',
    rpcUrl: STELLAR_TESTNET_RPC,
  },
};

export const STELLAR_NETWORKS_IMAGES = {
  [STELLAR_PUBNET_CAIP2]: Stellar,
  [STELLAR_TESTNET_CAIP2]: Stellar,
};

export const STELLAR_CHAINS: Record<string, Chain> = {
  ...STELLAR_MAINNET,
  ...STELLAR_TEST,
};
