import { EIP155_CHAINS, EIP155_SIGNING_METHODS } from '@/constants/eip155';
import { useWalletStore } from '@/stores/use-wallet-store';
import { WalletKitTypes } from '@reown/walletkit';
import {
  buildApprovedNamespaces,
  getSdkError,
  SdkErrorKey,
} from '@walletconnect/utils';
import { ProposalTypes } from '@walletconnect/types';

export function getChainData(chainId?: string) {
  if (!chainId) return;
  const [namespace, reference] = chainId.toString().split(':');
  return Object.values(EIP155_CHAINS).find(
    (chain) => chain.chainId === reference && chain.namespace === namespace,
  );
}

export function getChains(
  requiredNamespaces: ProposalTypes.RequiredNamespaces,
  optionalNamespaces: ProposalTypes.OptionalNamespaces,
) {
  if (!requiredNamespaces && !optionalNamespaces) {
    return [];
  }

  const required = [];
  for (const [key, values] of Object.entries(requiredNamespaces)) {
    const chains = key.includes(':') ? key : values.chains;
    if (chains) {
      required.push(chains);
    }
  }

  const optional = [];
  for (const [key, values] of Object.entries(optionalNamespaces)) {
    const chains = key.includes(':') ? key : values.chains;
    if (chains) {
      optional.push(chains);
    }
  }

  const chains = [...required.flat(), ...optional.flat()];

  return chains
    .map((chain) => getChainData(chain))
    .filter((chain) => chain !== undefined);
}

export function getApprovedNamespaces(
  proposal: WalletKitTypes.SessionProposal,
) {
  const eip155Chains = Object.keys(EIP155_CHAINS);
  const eip155Methods = Object.values(EIP155_SIGNING_METHODS);

  const { evmAddress } = useWalletStore.getState();

  if (!evmAddress) {
    throw new Error('Wallet not initialized');
  }

  // Future: Add solana, sui, ton addresses here
  const supportedNamespaces = {
    eip155: {
      chains: eip155Chains,
      methods: eip155Methods,
      events: ['accountsChanged', 'chainChanged'],
      accounts: eip155Chains.map((chain) => `${chain}:${evmAddress}`),
    },
  };

  return buildApprovedNamespaces({
    proposal: proposal.params,
    supportedNamespaces,
  });
}

export function getRejectError(error: SdkErrorKey) {
  return getSdkError(error);
}

/**
 * Get a human-readable action text for a signing method.
 * Used in the format: "Sign a message for {AppName}"
 */
export function getRequestIntention(method: string): string {
  switch (method) {
    case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
    case EIP155_SIGNING_METHODS.ETH_SIGN:
      return 'Sign a message';
    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4:
      return 'Sign typed data';
    case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
      return 'Send tokens';
    case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
      return 'Sign a transaction';
    default:
      return 'Request';
  }
}

/**
 * Check if the method is a transaction (send or sign transaction).
 */
export function isTransactionMethod(method: string): boolean {
  return (
    method === EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION ||
    method === EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION
  );
}

/**
 * Truncate an address for display (e.g., "0x1234...5678").
 */
export function truncateAddress(address: string, chars = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Extract and decode the message from signing request params.
 * personal_sign: [message, address]
 * eth_sign: [address, message]
 * eth_signTypedData*: [address, typedData]
 * eth_sendTransaction/eth_signTransaction: [txObject]
 */
export function getSignParamsMessage(method: string, params: any[]): string {
  try {
    switch (method) {
      case EIP155_SIGNING_METHODS.PERSONAL_SIGN: {
        const hexMessage = params[0];
        return hexToUtf8(hexMessage);
      }
      case EIP155_SIGNING_METHODS.ETH_SIGN: {
        const hexMessage = params[1];
        return hexToUtf8(hexMessage);
      }
      case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
      case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
      case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4: {
        const typedData =
          typeof params[1] === 'string' ? JSON.parse(params[1]) : params[1];
        return JSON.stringify(typedData, null, 2);
      }
      case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
      case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION: {
        const transaction = params[0];
        return JSON.stringify(transaction, null, 2);
      }
      default:
        return JSON.stringify(params, null, 2);
    }
  } catch {
    return JSON.stringify(params, null, 2);
  }
}

/**
 * Convert a hex string to UTF-8 text.
 * Falls back to the original string if conversion fails.
 */
function hexToUtf8(hex: string): string {
  try {
    // Remove 0x prefix if present
    const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
    // Convert hex to bytes
    const bytes = new Uint8Array(
      cleanHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || [],
    );
    // Decode as UTF-8
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return hex;
  }
}
