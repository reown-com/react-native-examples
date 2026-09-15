import * as bip39 from 'bip39';

import StellarLib from '../lib/StellarLib';
import { storage } from './storage';
import SettingsStore from '@/store/SettingsStore';

const STELLAR_MNEMONIC_KEY = 'STELLAR_MNEMONIC_1';
const STELLAR_SECRET_KEY_KEY = 'STELLAR_SECRET_KEY_1';

export let wallet1: StellarLib;
export let stellarAddresses: string[];

function isMnemonic(input: string): boolean {
  const words = input.split(/\s+/).filter(Boolean);
  if (![12, 15, 18, 21, 24].includes(words.length)) {
    return false;
  }
  return bip39.validateMnemonic(input);
}

/**
 * Utilities
 */
export async function createOrRestoreStellarWallet() {
  const mnemonic = await storage.getItem<string>(STELLAR_MNEMONIC_KEY);
  const secret = await storage.getItem<string>(STELLAR_SECRET_KEY_KEY);

  if (mnemonic) {
    wallet1 = await StellarLib.init({ mnemonic });
  } else if (secret) {
    wallet1 = await StellarLib.init({ secret });
  } else {
    wallet1 = await StellarLib.init({});
    // Don't store private keys in local storage in a production project!
    await storage.setItem(STELLAR_MNEMONIC_KEY, wallet1.getMnemonic());
  }

  stellarAddresses = [wallet1.getAddress()];

  return {
    stellarWallet: wallet1,
    stellarAddress: stellarAddresses[0],
    stellarAddresses,
  };
}

export const getWallet = async () => {
  return wallet1;
};

export async function loadStellarWallet(input: string): Promise<{
  address: string;
  wallet: StellarLib;
}> {
  const trimmedInput = input.trim();

  let newWallet: StellarLib;
  if (isMnemonic(trimmedInput)) {
    newWallet = await StellarLib.init({ mnemonic: trimmedInput });
    await storage.setItem(STELLAR_MNEMONIC_KEY, trimmedInput);
    await storage.removeItem(STELLAR_SECRET_KEY_KEY);
  } else {
    // Assume a strkey-encoded Stellar secret seed (`S…`); StellarLib throws if
    // it isn't a valid secret.
    try {
      newWallet = await StellarLib.init({ secret: trimmedInput });
    } catch {
      throw new Error(
        'Invalid input. Provide a 12-24 word BIP39 mnemonic or an S… Stellar secret key.',
      );
    }
    await storage.setItem(STELLAR_SECRET_KEY_KEY, trimmedInput);
    await storage.removeItem(STELLAR_MNEMONIC_KEY);
  }

  const newAddress = newWallet.getAddress();

  // Update module-level exports
  wallet1 = newWallet;
  stellarAddresses = [newAddress];

  if (__DEV__) {
    console.warn(
      '[SECURITY] Stellar key material stored unencrypted. Use secure enclave in production.',
    );
  }

  // Update store
  SettingsStore.setStellarAddress(newAddress);
  SettingsStore.setStellarWallet(newWallet);

  return { address: newAddress, wallet: newWallet };
}
