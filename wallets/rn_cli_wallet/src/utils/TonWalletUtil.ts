import TonLib from '../lib/TonLib';
import { storage } from './storage';
import SettingsStore from '@/store/SettingsStore';

export let wallet1: TonLib;
export let wallet2: TonLib;
export let tonWallets: Record<string, TonLib>;
export let tonAddresses: string[];

let address1: string;

/**
 * Utilities
 */
export async function createOrRestoreTonWallet() {
  const secretKey1 = await storage.getItem('TON_SECRET_KEY_1');

  if (secretKey1) {
    wallet1 = await TonLib.init({ secretKey: secretKey1 });
  } else {
    wallet1 = await TonLib.init({});
    // Don't store secretKey in local storage in a production project!
    await storage.setItem('TON_SECRET_KEY_1', wallet1.getSecretKey());
  }

  address1 = await wallet1.getAddress();

  tonWallets = {
    [address1]: wallet1,
  };
  tonAddresses = Object.keys(tonWallets);

  return {
    tonWallets,
    tonAddresses,
  };
}

export const getWallet = async () => {
  return wallet1;
};

export async function loadTonWallet(input: string): Promise<{
  address: string;
  wallet: TonLib;
}> {
  const trimmedInput = input.trim();

  // Validate hex format
  if (!/^[0-9a-fA-F]+$/.test(trimmedInput)) {
    throw new Error('Invalid format: must be hexadecimal characters only');
  }

  // Determine if it's a secret key (128 hex = 64 bytes) or seed (64 hex = 32 bytes)
  const isSecretKey = trimmedInput.length === 128;
  const isSeed = trimmedInput.length === 64;

  if (!isSecretKey && !isSeed) {
    throw new Error(
      `Invalid length: expected 128 hex chars (secret key) or 64 hex chars (seed), got ${trimmedInput.length}`,
    );
  }

  // Create wallet from input
  const newWallet = isSecretKey
    ? await TonLib.init({ secretKey: trimmedInput })
    : await TonLib.init({ seed: trimmedInput });

  const newAddress = await newWallet.getAddress();

  // Update module-level exports
  wallet1 = newWallet;
  tonWallets = { [newAddress]: newWallet };
  tonAddresses = [newAddress];

  // Persist to storage (always store the secret key for consistency)
  await storage.setItem('TON_SECRET_KEY_1', newWallet.getSecretKey());

  // Update store
  SettingsStore.setTonAddress(newAddress);
  SettingsStore.setTonWallet(newWallet);

  return { address: newAddress, wallet: newWallet };
}
