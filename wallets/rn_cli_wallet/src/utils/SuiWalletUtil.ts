import * as bip39 from 'bip39';

import SuiLib from '../lib/SuiLib';
import { secureStorage } from './secure-storage';
import SettingsStore from '@/store/SettingsStore';

const SUI_MNEMONIC_KEY = 'SUI_MNEMONIC_1';

export let wallet1: SuiLib;
export let suiAddresses: string[];

/**
 * Utilities
 */
export async function createOrRestoreSuiWallet() {
  // Migrate any legacy plaintext-MMKV key material into the secure enclave.
  await secureStorage.migrateSecret(SUI_MNEMONIC_KEY);

  const mnemonic1 = await secureStorage.getSecret(SUI_MNEMONIC_KEY);

  if (mnemonic1) {
    wallet1 = await SuiLib.init({ mnemonic: mnemonic1 });
  } else {
    wallet1 = await SuiLib.init({});
    await secureStorage.setSecret(SUI_MNEMONIC_KEY, wallet1.getMnemonic());
  }

  suiAddresses = [wallet1.getAddress()];

  return {
    suiWallet: wallet1,
    suiAddresses,
  };
}

export const getWallet = async () => {
  return wallet1;
};

export async function loadSuiWallet(input: string): Promise<{
  address: string;
  wallet: SuiLib;
}> {
  const trimmedInput = input.trim();

  // Validate mnemonic word count
  const words = trimmedInput.split(/\s+/).filter(w => w.length > 0);
  if (![12, 15, 18, 21, 24].includes(words.length)) {
    throw new Error(
      `Mnemonic must be 12, 15, 18, 21, or 24 words (got ${words.length})`,
    );
  }

  // Validate BIP39 mnemonic
  if (!bip39.validateMnemonic(trimmedInput)) {
    throw new Error('Invalid mnemonic phrase');
  }

  // Create wallet from mnemonic
  const newWallet = await SuiLib.init({ mnemonic: trimmedInput });
  const newAddress = newWallet.getAddress();

  // Update module-level exports
  wallet1 = newWallet;
  suiAddresses = [newAddress];

  // Persist to secure storage
  await secureStorage.setSecret(SUI_MNEMONIC_KEY, trimmedInput);

  // Update store
  SettingsStore.setSuiAddress(newAddress);
  SettingsStore.setSuiWallet(newWallet);

  return { address: newAddress, wallet: newWallet };
}
