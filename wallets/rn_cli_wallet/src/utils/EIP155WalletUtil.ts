import EIP155Lib from '../lib/EIP155Lib';
import { storage } from './storage';
import SettingsStore from '@/store/SettingsStore';

export let wallet1: EIP155Lib;
export let wallet2: EIP155Lib;
export let eip155Wallets: Record<string, EIP155Lib>;
export let eip155Addresses: string[];

let address1: string;
// let address2: string;

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
  const isPrivateKey =
    trimmedInput.startsWith('0x') && trimmedInput.length === 66;

  const newWallet = isPrivateKey
    ? EIP155Lib.init({ privateKey: trimmedInput })
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
