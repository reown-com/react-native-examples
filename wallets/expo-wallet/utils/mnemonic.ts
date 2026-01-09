import {
  generateMnemonic as generate,
  validateMnemonic as validate,
} from 'bip39';

/**
 * Utility functions for mnemonic phrase operations.
 * Uses patched bip39 library that leverages react-native-quick-crypto
 * for native PBKDF2 performance.
 */
export const mnemonicUtils = {
  /**
   * Generate a new BIP39 mnemonic phrase (12 words by default)
   */
  generate(): string {
    return generate();
  },

  /**
   * Validate a mnemonic phrase
   */
  validate(mnemonic: string): boolean {
    return validate(mnemonic);
  },
};
