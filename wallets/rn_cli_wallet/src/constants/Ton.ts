import Ton from '@/assets/chains/ton.png';

/**
 * Types
 */
export type TTonChain =
  | keyof typeof TON_MAINNET_CHAINS
  | keyof typeof TON_TEST_CHAINS;

/**
 * Chains
 */
export const TON_MAINNET_CHAINS = {
  'ton:-239': {
    chainId: '-239',
    namespace: 'ton',
    name: 'TON Mainnet',
    rpcUrl: 'https://toncenter.com/api/v2/jsonRPC',
  },
};

export const TON_TEST_CHAINS = {
  'ton:-3': {
    chainId: '-3',
    namespace: 'ton',
    name: 'TON Testnet',
    rpcUrl: 'https://testnet.toncenter.com/api/v2/jsonRPC',
  },
};

export const TON_CHAINS = { ...TON_MAINNET_CHAINS, ...TON_TEST_CHAINS };

export const TON_NETWORKS_IMAGES = {
  'ton:-239': Ton,
  'ton:-3': Ton,
};

/**
 * Methods
 */
export const TON_SIGNING_METHODS = {
  SEND_MESSAGE: 'ton_sendMessage',
  SIGN_DATA: 'ton_signData',
};
