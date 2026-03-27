import { utils } from 'ethers';

import EIP155Lib from '../lib/EIP155Lib';
import { storage } from './storage';
import SettingsStore from '@/store/SettingsStore';

export let wallet1: EIP155Lib;
export let eip155Wallets: Record<string, EIP155Lib>;
export let eip155Addresses: string[];

let address1: string;

export async function createOrRestoreEIP155Wallet() {
  const mnemonic1 = await storage.getItem('EIP155_MNEMONIC_1');
  const privateKey1 = await storage.getItem('EIP155_PRIVATE_KEY_1');

  if (mnemonic1) {
    wallet1 = EIP155Lib.init({ mnemonic: mnemonic1 });
  } else if (privateKey1) {
    wallet1 = EIP155Lib.init({ privateKey: privateKey1 });
  } else {
    wallet1 = EIP155Lib.init({});
    storage.setItem('EIP155_MNEMONIC_1', wallet1.getMnemonic());
  }

  address1 = wallet1.getAddress();

  eip155Wallets = {
    [address1]: wallet1,
  };
  eip155Addresses = Object.keys(eip155Wallets);

  return {
    eip155Wallets,
    eip155Addresses,
  };
}

export function loadEIP155Wallet(input: string): {
  address: string;
  wallet: EIP155Lib;
} {
  const trimmedInput = input.trim();

  // Validate input and determine type
  const isPrivateKeyWith0x =
    trimmedInput.startsWith('0x') && trimmedInput.length === 66;
  const isPrivateKeyWithout0x =
    !trimmedInput.startsWith('0x') &&
    trimmedInput.length === 64 &&
    /^[0-9a-fA-F]+$/.test(trimmedInput);
  const isPrivateKey = isPrivateKeyWith0x || isPrivateKeyWithout0x;

  if (isPrivateKey) {
    // Validate hex characters for private keys with 0x prefix
    if (isPrivateKeyWith0x && !/^0x[0-9a-fA-F]{64}$/.test(trimmedInput)) {
      throw new Error('Private key must contain only hexadecimal characters');
    }
  } else {
    // Validate mnemonic
    const words = trimmedInput.split(/\s+/).filter(w => w.length > 0);
    if (![12, 15, 18, 21, 24].includes(words.length)) {
      throw new Error(
        `Mnemonic must be 12, 15, 18, 21, or 24 words (got ${words.length})`,
      );
    }
    if (!utils.isValidMnemonic(trimmedInput)) {
      throw new Error('Invalid mnemonic phrase');
    }
  }

  // Normalize private key to include 0x prefix
  const normalizedInput = isPrivateKeyWithout0x
    ? `0x${trimmedInput}`
    : trimmedInput;

  const newWallet = isPrivateKey
    ? EIP155Lib.init({ privateKey: normalizedInput })
    : EIP155Lib.init({ mnemonic: trimmedInput });

  const newAddress = newWallet.getAddress();

  // Update module-level exports
  wallet1 = newWallet;
  address1 = newAddress;
  eip155Wallets = { [newAddress]: newWallet };
  eip155Addresses = [newAddress];

  // Persist to storage
  if (newWallet.hasMnemonic()) {
    storage.setItem('EIP155_MNEMONIC_1', newWallet.getMnemonic());
    storage.removeItem('EIP155_PRIVATE_KEY_1');
  } else {
    storage.setItem('EIP155_PRIVATE_KEY_1', newWallet.getPrivateKey());
    storage.removeItem('EIP155_MNEMONIC_1');
  }

  // Update store
  SettingsStore.setEIP155Address(newAddress);
  SettingsStore.setWallet(newWallet);

  return { address: newAddress, wallet: newWallet };
}
