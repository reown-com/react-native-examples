import * as SecureStore from 'expo-secure-store';

const MNEMONIC_KEY = 'WALLET_MNEMONIC';

/**
 * Secure storage utility for sensitive wallet data.
 * Uses expo-secure-store which leverages:
 * - iOS: Keychain Services
 * - Android: Keystore system
 */
export const secureStorage = {
  /**
   * Save mnemonic phrase securely
   */
  async saveMnemonic(mnemonic: string): Promise<void> {
    await SecureStore.setItemAsync(MNEMONIC_KEY, mnemonic);
  },

  /**
   * Retrieve mnemonic phrase from secure storage
   */
  async getMnemonic(): Promise<string | null> {
    return await SecureStore.getItemAsync(MNEMONIC_KEY);
  },

  /**
   * Delete mnemonic phrase from secure storage
   */
  async clearMnemonic(): Promise<void> {
    await SecureStore.deleteItemAsync(MNEMONIC_KEY);
  },

  /**
   * Check if a mnemonic exists in secure storage
   */
  async hasMnemonic(): Promise<boolean> {
    const mnemonic = await this.getMnemonic();
    return mnemonic !== null;
  },
};
