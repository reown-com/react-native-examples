import TonLib from '../lib/TonLib';
import { storage } from './storage';

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
