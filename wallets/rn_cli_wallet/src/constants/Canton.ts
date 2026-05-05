import Canton from '@/assets/chains/canton.png';

/**
 * Types
 */
export type TCantonChain =
  | keyof typeof CANTON_MAINNET_CHAINS
  | keyof typeof CANTON_TEST_CHAINS;

/**
 * Chains
 */
export const CANTON_MAINNET_CHAINS = {
  'canton:mainnet': {
    chainId: 'mainnet',
    namespace: 'canton',
    name: 'Canton Mainnet',
    rpcUrl: '',
  },
};

export const CANTON_TEST_CHAINS = {
  'canton:devnet': {
    chainId: 'devnet',
    namespace: 'canton',
    name: 'Canton Devnet',
    rpcUrl: '',
  },
};

export const CANTON_CHAINS = {
  ...CANTON_MAINNET_CHAINS,
  ...CANTON_TEST_CHAINS,
};

export const CANTON_NETWORKS_IMAGES = {
  'canton:mainnet': Canton,
  'canton:devnet': Canton,
};

/**
 * Methods
 */
export const CANTON_SIGNING_METHODS = {
  LIST_ACCOUNTS: 'canton_listAccounts',
  GET_PRIMARY_ACCOUNT: 'canton_getPrimaryAccount',
  GET_ACTIVE_NETWORK: 'canton_getActiveNetwork',
  STATUS: 'canton_status',
  LEDGER_API: 'canton_ledgerApi',
  SIGN_MESSAGE: 'canton_signMessage',
  PREPARE_SIGN_EXECUTE: 'canton_prepareSignExecute',
};

/**
 * Events
 */
export const CANTON_EVENTS = {
  ACCOUNTS_CHANGED: 'accountsChanged',
  STATUS_CHANGED: 'statusChanged',
  CHAIN_CHANGED: 'chainChanged',
};
