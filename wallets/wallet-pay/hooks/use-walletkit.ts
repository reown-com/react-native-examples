import '@walletconnect/react-native-compat';

import { storage } from '@/utils/storage';
import { IWalletKit, WalletKit, WalletKitTypes } from '@reown/walletkit';
import { Core } from '@walletconnect/core';
import { useEffect, useRef, useState } from 'react';
import { useWalletStore } from '@/stores/use-wallet-store';
import { EIP155_CHAINS, EIP155_SIGNING_METHODS } from '@/constants/eip155';
import type { JsonRpcResponse } from '@json-rpc-tools/types';

const core = new Core({
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  customStoragePrefix: '@walletconnect/expo-wallet',
  storage,
});

export let walletKit: IWalletKit | undefined;
const stateListeners = new Set<(value: boolean) => void>();

/**
 * Initialize WalletKit with wallet addresses.
 * @param walletReady - Whether the wallet has been initialized
 */
export function useInitializeWalletKit(walletReady: boolean = true) {
  const { evmAddress } = useWalletStore();

  useEffect(() => {
    async function init() {
      // Wait for wallet to be ready before initializing WalletKit
      if (!walletReady || !evmAddress) {
        return;
      }

      if (!walletKit) {
        walletKit = await WalletKit.init({
          core,
          metadata: {
            name: 'Expo Wallet',
            description: 'Expo Wallet to interface with Dapps',
            url: 'https://walletconnect.com',
            icons: ['https://your_wallet_icon.png'],
            redirect: {
              native: 'expowallet://',
            },
          },
        });
        console.log('WalletKit initialized with address:', evmAddress);

        stateListeners.forEach((listener) => listener(true));
      }
    }
    init();
  }, [walletReady, evmAddress]);
}

export function useWalletKit() {
  const [isInitialized, setIsInitialized] = useState(!!walletKit);

  useEffect(() => {
    if (walletKit) {
      setIsInitialized(true);
    } else {
      stateListeners.add(setIsInitialized);
    }

    return () => {
      stateListeners.delete(setIsInitialized);
    };
  }, []);

  return { walletKit, isInitialized };
}

export function useWalletKitListener<E extends WalletKitTypes.Event>(
  event: E,
  listener: (args: WalletKitTypes.EventArguments[E]) => void,
) {
  const { isInitialized } = useWalletKit();
  const listenerRef = useRef(listener);

  useEffect(() => {
    listenerRef.current = listener;
  }, [listener]);

  useEffect(() => {
    const stableListener = (args: WalletKitTypes.EventArguments[E]) => {
      listenerRef.current(args);
    };

    if (isInitialized) {
      walletKit?.on(event, stableListener);
      console.log('useWalletKitListener on', event, stableListener);
    }

    return () => {
      walletKit?.off(event, stableListener);
    };
  }, [event, isInitialized]);
}

/**
 * Get supported namespaces for session approval.
 * Includes wallet addresses for each chain.
 */
export function getSupportedNamespaces() {
  const { evmAddress } = useWalletStore.getState();

  if (!evmAddress) {
    return {};
  }

  const eip155Chains = Object.keys(EIP155_CHAINS);
  const eip155Methods = Object.values(EIP155_SIGNING_METHODS);

  return {
    eip155: {
      chains: eip155Chains,
      methods: eip155Methods,
      events: ['accountsChanged', 'chainChanged'],
      accounts: eip155Chains.map((chain) => `${chain}:${evmAddress}`),
    },
  };
}

/**
 * Approve a session proposal with wallet addresses.
 */
export async function approveSession(proposalId: number) {
  if (!walletKit) {
    throw new Error('WalletKit not initialized');
  }

  const { evmAddress } = useWalletStore.getState();
  if (!evmAddress) {
    throw new Error('Wallet not initialized');
  }

  const eip155Chains = Object.keys(EIP155_CHAINS);
  const eip155Methods = Object.values(EIP155_SIGNING_METHODS);

  const namespaces = {
    eip155: {
      chains: eip155Chains,
      methods: eip155Methods,
      events: ['accountsChanged', 'chainChanged'],
      accounts: eip155Chains.map((chain) => `${chain}:${evmAddress}`),
    },
  };

  const session = await walletKit.approveSession({
    id: proposalId,
    namespaces,
  });

  return session;
}

/**
 * Reject a session proposal.
 */
export async function rejectSession(proposalId: number) {
  if (!walletKit) {
    throw new Error('WalletKit not initialized');
  }

  await walletKit.rejectSession({
    id: proposalId,
    reason: {
      code: 4001,
      message: 'User rejected the session',
    },
  });
}

/**
 * Respond to a session request.
 */
export async function respondSessionRequest(
  topic: string,
  response: JsonRpcResponse,
) {
  if (!walletKit) {
    throw new Error('WalletKit not initialized');
  }

  await walletKit.respondSessionRequest({
    topic,
    response,
  });
}
