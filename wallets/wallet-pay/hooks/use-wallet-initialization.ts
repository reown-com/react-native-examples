import { useEffect, useState } from 'react';
import { useWalletStore } from '@/stores/use-wallet-store';
import { secureStorage } from '@/utils/secure-storage';
import { EvmWallet } from '@/lib/chains/evm/evm-wallet';

/**
 * Hook to initialize wallets on app startup.
 * Checks for existing mnemonic in secure storage and creates/restores wallets.
 *
 * @returns isReady - true when wallet initialization is complete
 */
export function useWalletInitialization() {
  const [isReady, setIsReady] = useState(false);
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
          console.log('New wallet created:', wallet.getAddress());
        } else {
          console.log('Wallet restored:', wallet.getAddress());
        }

        // Update store with wallet
        setEvmWallet(wallet);
        setInitialized(true);
        setIsReady(true);
      } catch (error) {
        console.error('Wallet initialization failed:', error);
      }
    }

    initialize();
  }, [setEvmWallet, setInitialized]);

  return isReady;
}
