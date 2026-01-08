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
