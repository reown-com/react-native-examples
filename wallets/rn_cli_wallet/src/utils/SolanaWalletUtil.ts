import * as bip39 from 'bip39';
import bs58 from 'bs58';

import SolanaLib from '../lib/SolanaLib';
import { storage } from './storage';
import SettingsStore from '@/store/SettingsStore';

const SOLANA_MNEMONIC_KEY = 'SOLANA_MNEMONIC_1';
const SOLANA_SECRET_KEY_KEY = 'SOLANA_SECRET_KEY_1';

export let wallet1: SolanaLib;
export let solanaAddresses: string[];

function isMnemonic(input: string): boolean {
  const words = input.split(/\s+/).filter(Boolean);
  if (![12, 15, 18, 21, 24].includes(words.length)) {
    return false;
  }
  return bip39.validateMnemonic(input);
}

function tryDecodeSecretKey(input: string): Uint8Array | null {
  try {
    const decoded = bs58.decode(input);
    if (decoded.length !== 64) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Utilities
 */
export async function createOrRestoreSolanaWallet() {
  const mnemonic1 = await storage.getItem<string>(SOLANA_MNEMONIC_KEY);
  const secretKey1 = await storage.getItem<string>(SOLANA_SECRET_KEY_KEY);

  if (mnemonic1) {
    wallet1 = await SolanaLib.init({ mnemonic: mnemonic1 });
  } else if (secretKey1) {
    const decoded = tryDecodeSecretKey(secretKey1);
    if (!decoded) {
      throw new Error('Stored Solana secret key is invalid');
    }
    wallet1 = await SolanaLib.init({ secretKey: decoded });
  } else {
    wallet1 = await SolanaLib.init({});
    // Don't store private keys in local storage in a production project!
    await storage.setItem(SOLANA_MNEMONIC_KEY, wallet1.getMnemonic());
  }

  solanaAddresses = [wallet1.getAddress()];

  return {
    solanaWallet: wallet1,
    solanaAddress: solanaAddresses[0],
    solanaAddresses,
  };
}

export const getWallet = async () => {
  return wallet1;
};

export async function loadSolanaWallet(input: string): Promise<{
  address: string;
  wallet: SolanaLib;
}> {
  const trimmedInput = input.trim();

  let newWallet: SolanaLib;
  if (isMnemonic(trimmedInput)) {
    newWallet = await SolanaLib.init({ mnemonic: trimmedInput });
    await storage.setItem(SOLANA_MNEMONIC_KEY, trimmedInput);
    await storage.removeItem(SOLANA_SECRET_KEY_KEY);
  } else {
    const decoded = tryDecodeSecretKey(trimmedInput);
    if (!decoded) {
      throw new Error(
        'Invalid input. Provide a 12-24 word BIP39 mnemonic or a base58-encoded 64-byte secret key.',
      );
    }
    newWallet = await SolanaLib.init({ secretKey: decoded });
    await storage.setItem(SOLANA_SECRET_KEY_KEY, trimmedInput);
    await storage.removeItem(SOLANA_MNEMONIC_KEY);
  }

  const newAddress = newWallet.getAddress();

  // Update module-level exports
  wallet1 = newWallet;
  solanaAddresses = [newAddress];

  if (__DEV__) {
    console.warn(
      '[SECURITY] Solana key material stored in encrypted MMKV on native (key in Keychain/Keystore); unencrypted localStorage on web.',
    );
  }

  // Update store
  SettingsStore.setSolanaAddress(newAddress);
  SettingsStore.setSolanaWallet(newWallet);

  return { address: newAddress, wallet: newWallet };
}
