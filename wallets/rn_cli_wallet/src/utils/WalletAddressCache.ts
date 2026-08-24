import { storage } from './storage';

export const WALLET_ADDRESS_CACHE_KEY = 'WALLET_ADDRESS_CACHE_V1';

export interface WalletAddressCache {
  version: 1;
  eip155Address?: string;
  suiAddress?: string;
  tonAddress?: string;
  tronAddress?: string;
  cantonAddress?: string;
  solanaAddress?: string;
  bitcoinAddresses?: string[];
  stellarAddress?: string;
}

let writeQueue: Promise<void> = Promise.resolve();

export async function getWalletAddressCache(): Promise<WalletAddressCache | null> {
  const cache = await storage.getItem<WalletAddressCache>(
    WALLET_ADDRESS_CACHE_KEY,
  );
  return cache?.version === 1 ? cache : null;
}

/**
 * Address cache updates are serialized so concurrent signer restores cannot
 * overwrite one another. This cache intentionally contains public data only.
 */
export function updateWalletAddressCache(
  update: Omit<Partial<WalletAddressCache>, 'version'>,
): Promise<void> {
  writeQueue = writeQueue
    .catch(() => undefined)
    .then(async () => {
      const previous = (await getWalletAddressCache()) ?? { version: 1 };
      await storage.setItem(WALLET_ADDRESS_CACHE_KEY, {
        ...previous,
        ...update,
      });
    });

  return writeQueue;
}
