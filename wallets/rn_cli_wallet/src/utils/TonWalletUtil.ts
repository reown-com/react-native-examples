import TonLib from '../lib/TonLib';
import { secureStorage } from './secure-storage';
import SettingsStore from '@/store/SettingsStore';

const TON_SECRET_KEY_KEY = 'TON_SECRET_KEY_1';

export let wallet1: TonLib;
export let wallet2: TonLib;
export let tonWallets: Record<string, TonLib>;
export let tonAddresses: string[];

let address1: string;

/**
 * Utilities
 */
export async function createOrRestoreTonWallet() {
  // Migrate any legacy plaintext-MMKV key material into the secure enclave.
  await secureStorage.migrateSecret(TON_SECRET_KEY_KEY);

  const secretKey1 = await secureStorage.getSecret(TON_SECRET_KEY_KEY);

  if (secretKey1) {
    wallet1 = await TonLib.init({ secretKey: secretKey1 });
  } else {
    wallet1 = await TonLib.init({});
    await secureStorage.setSecret(TON_SECRET_KEY_KEY, wallet1.getSecretKey());
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
    throw new Error(
      'Invalid format: must be hexadecimal characters only (128 or 64 chars)',
    );
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

  // Persist to secure storage (always store the secret key for consistency)
  await secureStorage.setSecret(TON_SECRET_KEY_KEY, newWallet.getSecretKey());

  // Update store
  SettingsStore.setTonAddress(newAddress);
  SettingsStore.setTonWallet(newWallet);

  return { address: newAddress, wallet: newWallet };
}
