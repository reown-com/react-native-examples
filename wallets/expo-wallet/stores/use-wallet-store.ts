import { create } from 'zustand';
import { EvmWallet } from '@/lib/chains/evm/evm-wallet';

/**
 * Unified wallet store for all blockchain wallets.
 * Currently supports EVM, extensible for future chains.
 */
interface WalletStore {
  // EVM wallet state
  evmWallet: EvmWallet | null;
  evmAddress: string | null;

  // Future chains can be added here:
  // solanaWallet: SolanaWallet | null;
  // suiWallet: SuiWallet | null;

  // Initialization status
  isInitialized: boolean;

  // Actions
  setEvmWallet: (wallet: EvmWallet | null) => void;
  setInitialized: (value: boolean) => void;
  clear: () => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
  evmWallet: null,
  evmAddress: null,
  isInitialized: false,

  setEvmWallet: (wallet) =>
    set({
      evmWallet: wallet,
      evmAddress: wallet?.getAddress() ?? null,
    }),

  setInitialized: (value) => set({ isInitialized: value }),

  clear: () =>
    set({
      evmWallet: null,
      evmAddress: null,
      isInitialized: false,
    }),
}));
