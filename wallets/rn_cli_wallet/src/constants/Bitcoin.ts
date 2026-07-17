// Bitcoin (bip122)
import Bitcoin from '@/assets/chains/bitcoin.png';
import { Chain } from '@/utils/TypesUtil';

/**
 * Methods
 */
export const BIP122_SIGNING_METHODS = {
  BIP122_SIGN_MESSAGE: 'signMessage',
  BIP122_GET_ACCOUNT_ADDRESSES: 'getAccountAddresses',
  BIP122_SEND_TRANSACTION: 'sendTransfer',
  BIP122_SIGN_PSBT: 'signPsbt',
};

/**
 * Events
 */
export const BIP122_EVENTS = {
  BIP122_ADDRESSES_CHANGED: 'bip122_addressesChanged',
};

export const BIP122_NAMESPACE = 'bip122';

// Mainnet genesis block hash (CAIP-2 reference). Testnet is intentionally not
// supported here — the RN wallet exposes only mainnet chains.
export const BIP122_MAINNET_ID = '000000000019d6689c085ae165831e93';
export const BIP122_MAINNET_CAIP2 = `${BIP122_NAMESPACE}:${BIP122_MAINNET_ID}`;

export type IBip122ChainId = typeof BIP122_MAINNET_CAIP2;

// BIP44 coin type for Bitcoin mainnet (used for HD derivation).
export const BIP122_MAINNET_COIN_TYPE = '0';
export const BIP122_MAINNET_RPC = 'https://mempool.space/api';

export const BIP122_MAINNET = {
  [BIP122_MAINNET_CAIP2]: {
    chainId: BIP122_MAINNET_ID,
    namespace: BIP122_NAMESPACE,
    name: 'Bitcoin',
    rpcUrl: BIP122_MAINNET_RPC,
  },
};

export const BIP122_NETWORKS_IMAGES = {
  [BIP122_MAINNET_CAIP2]: Bitcoin,
};

export const BIP122_CHAINS: Record<string, Chain> = {
  ...BIP122_MAINNET,
};
