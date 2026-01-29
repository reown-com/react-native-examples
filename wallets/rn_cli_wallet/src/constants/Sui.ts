// SUI
import Sui from '@/assets/chains/sui.jpeg';
import { Chain } from '@/utils/TypesUtil';
/**
 * Methods
 */
export const SUI_SIGNING_METHODS = {
  SUI_SIGN_TRANSACTION: 'sui_signTransaction',
  SUI_SIGN_AND_EXECUTE_TRANSACTION: 'sui_signAndExecuteTransaction',
  SUI_SIGN_PERSONAL_MESSAGE: 'sui_signPersonalMessage',
};

/**
 * Events
 */

export const SUI_EVENTS = {
  SUI_ACCOUNTS_CHANGED: 'sui_accountsChanged',
  SUI_CHAIN_CHANGED: 'sui_chainChanged',
};

export type ISuiChainId = typeof SUI_MAINNET_CAIP2 | typeof SUI_TESTNET_CAIP2;

export const SUI_NAMESPACE = 'sui';

export const SUI_MAINNET_ID = 'mainnet';
export const SUI_TESTNET_ID = 'testnet';
export const SUI_DEVNET_ID = 'devnet';
export const SUI_MAINNET_CAIP2 = `${SUI_NAMESPACE}:${SUI_MAINNET_ID}`;
export const SUI_TESTNET_CAIP2 = `${SUI_NAMESPACE}:${SUI_TESTNET_ID}`;
export const SUI_DEVNET_CAIP2 = `${SUI_NAMESPACE}:${SUI_DEVNET_ID}`;

export const SUI_MAINNET = {
  [SUI_MAINNET_CAIP2]: {
    chainId: SUI_MAINNET_ID,
    namespace: SUI_NAMESPACE,
    name: 'SUI Mainnet',
    rpcUrl: 'https://fullnode.mainnet.sui.io',
  },
};
export const SUI_TESTNET = {
  [SUI_TESTNET_CAIP2]: {
    chainId: SUI_TESTNET_ID,
    namespace: SUI_NAMESPACE,
    name: 'SUI Testnet',
    rpcUrl: 'https://fullnode.testnet.sui.io',
  },
};

export const SUI_DEVNET = {
  [SUI_DEVNET_CAIP2]: {
    chainId: SUI_DEVNET_ID,
    namespace: SUI_NAMESPACE,
    name: 'SUI Devnet',
    rpcUrl: 'https://fullnode.devnet.sui.io',
  },
};

export const SUI_NETWORKS_IMAGES = {
  'sui:mainnet': Sui,
  'sui:testnet': Sui,
  'sui:devnet': Sui,
};

export const SUI_CHAINS: Record<string, Chain> = {
  ...SUI_MAINNET,
  ...SUI_TESTNET,
  ...SUI_DEVNET,
};
