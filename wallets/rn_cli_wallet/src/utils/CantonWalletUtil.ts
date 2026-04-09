import CantonLib from '../lib/CantonLib';
import { storage } from './storage';
import SettingsStore from '@/store/SettingsStore';

export let wallet1: CantonLib;
export let cantonWallets: Record<string, CantonLib>;
export let cantonAddresses: string[];

let address1: string;

/**
 * Utilities
 */
export async function createOrRestoreCantonWallet() {
  const secretKey1 = await storage.getItem('CANTON_SECRET_KEY_1');

  if (secretKey1) {
    wallet1 = CantonLib.init({ secretKey: secretKey1 });
  } else {
    wallet1 = CantonLib.init();
    await storage.setItem('CANTON_SECRET_KEY_1', wallet1.getSecretKey());
  }

  address1 = wallet1.getEncodedPartyId();

  cantonWallets = {
    [address1]: wallet1,
  };
  cantonAddresses = Object.keys(cantonWallets);

  return {
    cantonWallets,
    cantonAddresses,
  };
}

export const getWallet = () => {
  return wallet1;
};

export async function loadCantonWallet(input: string): Promise<{
  address: string;
  wallet: CantonLib;
}> {
  const trimmedInput = input.trim();

  // Validate hex format
  if (!/^[0-9a-fA-F]+$/.test(trimmedInput)) {
    throw new Error(
      'Invalid format: must be hexadecimal characters only (128 chars)',
    );
  }

  // Ed25519 secret key is 64 bytes = 128 hex chars
  if (trimmedInput.length !== 128) {
    throw new Error(
      `Invalid length: expected 128 hex chars (Ed25519 secret key), got ${trimmedInput.length}`,
    );
  }

  const newWallet = CantonLib.init({ secretKey: trimmedInput });
  const newAddress = newWallet.getEncodedPartyId();

  // Update module-level exports
  wallet1 = newWallet;
  cantonWallets = { [newAddress]: newWallet };
  cantonAddresses = [newAddress];

  // Persist to storage
  await storage.setItem('CANTON_SECRET_KEY_1', newWallet.getSecretKey());

  // Update store
  SettingsStore.setCantonAddress(newAddress);

  return { address: newAddress, wallet: newWallet };
}
