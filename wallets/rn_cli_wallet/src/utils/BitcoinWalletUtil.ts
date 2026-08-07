import * as bip39 from 'bip39';

import BitcoinLib from '../lib/BitcoinLib';
import { storage } from './storage';
import SettingsStore from '@/store/SettingsStore';
import { BIP122_MAINNET_CAIP2 } from '@/constants/Bitcoin';

const BITCOIN_MNEMONIC_KEY = 'BITCOIN_MNEMONIC_1';

export let wallet1: BitcoinLib;
// [0] = mainnet payment (P2WPKH) address, [1] = mainnet ordinals (P2TR) address
export let bitcoinAddresses: string[];

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
export async function createOrRestoreBitcoinWallet() {
  const mnemonic1 = await storage.getItem<string>(BITCOIN_MNEMONIC_KEY);

  if (mnemonic1) {
    wallet1 = await BitcoinLib.init({ mnemonic: mnemonic1 });
  } else {
    wallet1 = await BitcoinLib.init({});
    // Don't store private keys in local storage in a production project!
    await storage.setItem(BITCOIN_MNEMONIC_KEY, wallet1.getMnemonic());
  }

  bitcoinAddresses = [
    wallet1.getAddress(BIP122_MAINNET_CAIP2),
    wallet1.getOrdinalsAddress(BIP122_MAINNET_CAIP2),
  ];

  return {
    bitcoinWallet: wallet1,
    bitcoinAddress: bitcoinAddresses[0],
    bitcoinAddresses,
  };
}

export const getWallet = async () => {
  return wallet1;
};

export async function loadBitcoinWallet(input: string): Promise<{
  address: string;
  wallet: BitcoinLib;
}> {
  const trimmedInput = input.trim();

  if (!isMnemonic(trimmedInput)) {
    throw new Error('Invalid input. Provide a 12-24 word BIP39 mnemonic.');
  }

  const newWallet = await BitcoinLib.init({ mnemonic: trimmedInput });
  await storage.setItem(BITCOIN_MNEMONIC_KEY, trimmedInput);

  const newAddress = newWallet.getAddress(BIP122_MAINNET_CAIP2);

  // Update module-level exports
  wallet1 = newWallet;
  bitcoinAddresses = [
    newAddress,
    newWallet.getOrdinalsAddress(BIP122_MAINNET_CAIP2),
  ];

  if (__DEV__) {
    console.warn(
      '[SECURITY] Bitcoin key material stored unencrypted. Use secure enclave in production.',
    );
  }

  // Update store
  SettingsStore.setBitcoinAddress(newAddress);
  SettingsStore.setBitcoinWallet(newWallet);

  return { address: newAddress, wallet: newWallet };
}
