import CantonLib from '../lib/CantonLib';
import { storage } from './storage';
import SettingsStore from '@/store/SettingsStore';

export let wallet1: CantonLib | undefined;
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
    // Don't store secretKey in local storage in a production project!
    await storage.setItem('CANTON_SECRET_KEY_1', wallet1.getSecretKey());
  }

  address1 = wallet1.getEncodedPartyId();

  cantonWallets = {
    [address1]: wallet1,
  };
  cantonAddresses = Object.keys(cantonWallets);

  return {
    cantonWallet: wallet1,
    cantonWallets,
    cantonAddresses,
  };
}

export const getWallet = (): CantonLib | undefined => {
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
  if (__DEV__) {
    console.warn(
      '[SECURITY] Canton secret key stored unencrypted. Use secure enclave in production.',
    );
  }

  // Update store
  SettingsStore.setCantonAddress(newAddress);
  SettingsStore.setCantonWallet(newWallet);

  return { address: newAddress, wallet: newWallet };
}
