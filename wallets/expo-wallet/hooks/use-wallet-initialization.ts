import { useEffect, useState } from 'react';
import { useWalletStore } from '@/stores/use-wallet-store';
import { secureStorage } from '@/utils/secure-storage';
import { EvmWallet } from '@/lib/chains/evm/evm-wallet';

/**
 * Hook to initialize wallets on app startup.
 * Checks for existing mnemonic in secure storage and creates/restores wallets.
 *
 * @returns { isReady, error } - isReady when wallet initialization is complete, error if failed
 */
export function useWalletInitialization() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { setEvmWallet, setInitialized } = useWalletStore();

  useEffect(() => {
    async function initialize() {
      try {
        // Check for existing mnemonic in secure storage
        const existingMnemonic = await secureStorage.getMnemonic();

        // Create or restore EVM wallet
        const { wallet, mnemonic } = EvmWallet.create(
          existingMnemonic ? { mnemonic: existingMnemonic } : undefined,
        );

        // Save mnemonic to secure storage if newly created
        if (!existingMnemonic) {
          await secureStorage.saveMnemonic(mnemonic);
          if (__DEV__) {
            console.log('New wallet created:', wallet.getAddress());
          }
        } else {
          if (__DEV__) {
            console.log('Wallet restored:', wallet.getAddress());
          }
        }

        // Update store with wallet
        setEvmWallet(wallet);
        setInitialized(true);
        setIsReady(true);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error('Wallet initialization failed:', error);
        setError(error);
        // TODO: Show toast notification to user when toast component is implemented
        setIsReady(true); // Unblock UI even on error
      }
    }

    initialize();
  }, [setEvmWallet, setInitialized]);

  return { isReady, error };
}
