import TronLib from '../lib/TronLib';
import { secureStorage } from './secure-storage';
import SettingsStore from '@/store/SettingsStore';

const TRON_PRIVATE_KEY_KEY = 'TRON_PrivateKey_1';

export let tronWeb1: TronLib;
export let tronWallets: Record<string, TronLib>;
export let tronAddresses: string[];

let address1: string;

/**
 * Utilities
 */
export async function createOrRestoreTronWallet() {
  // Migrate any legacy plaintext-MMKV key material into the secure enclave.
  await secureStorage.migrateSecret(TRON_PRIVATE_KEY_KEY);

  const privateKey1 = await secureStorage.getSecret(TRON_PRIVATE_KEY_KEY);

  if (privateKey1) {
    tronWeb1 = await TronLib.init({ privateKey: privateKey1 });
  } else {
    tronWeb1 = await TronLib.init({ privateKey: '' });

    await secureStorage.setSecret(TRON_PRIVATE_KEY_KEY, tronWeb1.privateKey);
  }

  address1 = tronWeb1.getAddress() as string;

  tronWallets = {
    [address1]: tronWeb1,
  };

  tronAddresses = Object.keys(tronWallets);

  return {
    tronWallets,
    tronAddresses,
  };
}

export async function loadTronWallet(input: string): Promise<{
  address: string;
  wallet: TronLib;
}> {
  let trimmedInput = input.trim();

  // Remove 0x prefix if present
  if (trimmedInput.startsWith('0x')) {
    trimmedInput = trimmedInput.slice(2);
  }

  // Validate hex format and length (64 hex chars = 32 bytes private key)
  if (!/^[0-9a-fA-F]{64}$/.test(trimmedInput)) {
    throw new Error(
      'Invalid private key: must be 64 hexadecimal characters (with optional 0x prefix)',
    );
  }

  // Create wallet from private key
  const newWallet = await TronLib.init({ privateKey: trimmedInput });
  const newAddress = newWallet.getAddress() as string;

  // Update module-level exports
  tronWeb1 = newWallet;
  tronWallets = { [newAddress]: newWallet };
  tronAddresses = [newAddress];

  // Persist to secure storage
  await secureStorage.setSecret(TRON_PRIVATE_KEY_KEY, trimmedInput);

  // Update store
  SettingsStore.setTronAddress(newAddress);
  SettingsStore.setTronWallet(newWallet);

  return { address: newAddress, wallet: newWallet };
}
