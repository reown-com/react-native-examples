import { InteractionManager } from 'react-native';

import SettingsStore from '@/store/SettingsStore';
import LogStore from '@/store/LogStore';
import {
  getWalletAddressCache,
  updateWalletAddressCache,
} from './WalletAddressCache';
import type { WalletAddressCache } from './WalletAddressCache';

export const WALLET_NAMESPACES = [
  'eip155',
  'sui',
  'ton',
  'tron',
  'canton',
  'solana',
  'bip122',
  'stellar',
] as const;

export type WalletNamespace = (typeof WALLET_NAMESPACES)[number];
type Readiness = 'idle' | 'loading' | 'ready' | 'failed';

const restorePromises = new Map<WalletNamespace, Promise<void>>();
let backgroundRestoreStarted = false;

function namespaceForChainId(chainId: string): WalletNamespace | null {
  const namespace = chainId.split(':', 1)[0];
  return WALLET_NAMESPACES.includes(namespace as WalletNamespace)
    ? (namespace as WalletNamespace)
    : null;
}

function setReadiness(namespace: WalletNamespace, readiness: Readiness) {
  SettingsStore.setWalletReadiness(namespace, readiness);
}

function cachedAddressFor(
  namespace: WalletNamespace,
  cache: WalletAddressCache,
): string | string[] | undefined {
  switch (namespace) {
    case 'eip155':
      return cache.eip155Address;
    case 'sui':
      return cache.suiAddress;
    case 'ton':
      return cache.tonAddress;
    case 'tron':
      return cache.tronAddress;
    case 'canton':
      return cache.cantonAddress;
    case 'solana':
      return cache.solanaAddress;
    case 'bip122':
      return cache.bitcoinAddresses;
    case 'stellar':
      return cache.stellarAddress;
  }
}

async function verifyAndCacheAddress(
  namespace: WalletNamespace,
  update: Omit<Partial<WalletAddressCache>, 'version'>,
  cacheBeforeRestore: WalletAddressCache | null,
) {
  const cached = cacheBeforeRestore
    ? cachedAddressFor(namespace, cacheBeforeRestore)
    : undefined;
  const restored = cachedAddressFor(namespace, { version: 1, ...update });

  if (cached && JSON.stringify(cached) !== JSON.stringify(restored)) {
    LogStore.info(
      'Cached address did not match restored signer; cache refreshed',
      'WalletInitialization',
      'verifyAndCacheAddress',
      { namespace },
    );
  }

  await updateWalletAddressCache(update);
}

export async function hydrateCachedWalletAddresses(): Promise<boolean> {
  const cache = await getWalletAddressCache();
  if (!cache) {
    return false;
  }

  if (cache.eip155Address) SettingsStore.setEIP155Address(cache.eip155Address);
  if (cache.suiAddress) SettingsStore.setSuiAddress(cache.suiAddress);
  if (cache.tonAddress) SettingsStore.setTonAddress(cache.tonAddress);
  if (cache.tronAddress) SettingsStore.setTronAddress(cache.tronAddress);
  if (cache.cantonAddress) SettingsStore.setCantonAddress(cache.cantonAddress);
  if (cache.solanaAddress) SettingsStore.setSolanaAddress(cache.solanaAddress);
  if (cache.bitcoinAddresses?.[0]) {
    SettingsStore.setBitcoinAddresses(cache.bitcoinAddresses);
  }
  if (cache.stellarAddress)
    SettingsStore.setStellarAddress(cache.stellarAddress);

  return Boolean(cache.eip155Address);
}

async function restoreWallet(namespace: WalletNamespace) {
  const startedAt = globalThis.performance?.now?.() ?? Date.now();
  const cacheBeforeRestore = await getWalletAddressCache();

  switch (namespace) {
    case 'eip155': {
      const { createOrRestoreEIP155Wallet, eip155Wallets } =
        require('./EIP155WalletUtil') as typeof import('./EIP155WalletUtil');
      const { eip155Addresses } = await createOrRestoreEIP155Wallet();
      const address = eip155Addresses[0];
      SettingsStore.setEIP155Address(address);
      SettingsStore.setWallet(eip155Wallets[address]);
      await verifyAndCacheAddress(
        'eip155',
        { eip155Address: address },
        cacheBeforeRestore,
      );
      break;
    }
    case 'sui': {
      const { createOrRestoreSuiWallet } =
        require('./SuiWalletUtil') as typeof import('./SuiWalletUtil');
      const { suiAddresses, suiWallet } = await createOrRestoreSuiWallet();
      SettingsStore.setSuiAddress(suiAddresses[0]);
      SettingsStore.setSuiWallet(suiWallet);
      await verifyAndCacheAddress(
        'sui',
        { suiAddress: suiAddresses[0] },
        cacheBeforeRestore,
      );
      break;
    }
    case 'ton': {
      const { createOrRestoreTonWallet } =
        require('./TonWalletUtil') as typeof import('./TonWalletUtil');
      const { tonAddresses, tonWallets } = await createOrRestoreTonWallet();
      SettingsStore.setTonAddress(tonAddresses[0]);
      SettingsStore.setTonWallet(tonWallets[tonAddresses[0]]);
      await verifyAndCacheAddress(
        'ton',
        { tonAddress: tonAddresses[0] },
        cacheBeforeRestore,
      );
      break;
    }
    case 'tron': {
      const { createOrRestoreTronWallet } =
        require('./TronWalletUtil') as typeof import('./TronWalletUtil');
      const { tronAddresses, tronWallets } = await createOrRestoreTronWallet();
      SettingsStore.setTronAddress(tronAddresses[0]);
      SettingsStore.setTronWallet(tronWallets[tronAddresses[0]]);
      await verifyAndCacheAddress(
        'tron',
        { tronAddress: tronAddresses[0] },
        cacheBeforeRestore,
      );
      break;
    }
    case 'canton': {
      const { createOrRestoreCantonWallet } =
        require('./CantonWalletUtil') as typeof import('./CantonWalletUtil');
      const { cantonAddresses, cantonWallet } =
        await createOrRestoreCantonWallet();
      SettingsStore.setCantonAddress(cantonAddresses[0]);
      SettingsStore.setCantonWallet(cantonWallet);
      await verifyAndCacheAddress(
        'canton',
        {
          cantonAddress: cantonAddresses[0],
        },
        cacheBeforeRestore,
      );
      break;
    }
    case 'solana': {
      const { createOrRestoreSolanaWallet } =
        require('./SolanaWalletUtil') as typeof import('./SolanaWalletUtil');
      const { solanaAddress, solanaWallet } =
        await createOrRestoreSolanaWallet();
      SettingsStore.setSolanaAddress(solanaAddress);
      SettingsStore.setSolanaWallet(solanaWallet);
      await verifyAndCacheAddress(
        'solana',
        { solanaAddress },
        cacheBeforeRestore,
      );
      break;
    }
    case 'bip122': {
      const { createOrRestoreBitcoinWallet } =
        require('./BitcoinWalletUtil') as typeof import('./BitcoinWalletUtil');
      const { bitcoinAddresses, bitcoinWallet } =
        await createOrRestoreBitcoinWallet();
      SettingsStore.setBitcoinAddresses(bitcoinAddresses);
      SettingsStore.setBitcoinWallet(bitcoinWallet);
      await verifyAndCacheAddress(
        'bip122',
        { bitcoinAddresses },
        cacheBeforeRestore,
      );
      break;
    }
    case 'stellar': {
      const { createOrRestoreStellarWallet } =
        require('./StellarWalletUtil') as typeof import('./StellarWalletUtil');
      const { stellarAddress, stellarWallet } =
        await createOrRestoreStellarWallet();
      SettingsStore.setStellarAddress(stellarAddress);
      SettingsStore.setStellarWallet(stellarWallet);
      await verifyAndCacheAddress(
        'stellar',
        { stellarAddress },
        cacheBeforeRestore,
      );
      break;
    }
  }

  const durationMs =
    (globalThis.performance?.now?.() ?? Date.now()) - startedAt;
  LogStore.info(
    'Wallet signer restored',
    'WalletInitialization',
    'restoreWallet',
    {
      namespace,
      durationMs: Math.round(durationMs),
    },
  );
}

/** Restores one signer once; concurrent callers share the same work. */
export function ensureWalletReady(namespace: WalletNamespace): Promise<void> {
  if (SettingsStore.state.walletReadiness[namespace] === 'ready') {
    return Promise.resolve();
  }

  const pending = restorePromises.get(namespace);
  if (pending) {
    return pending;
  }

  setReadiness(namespace, 'loading');
  const restore = restoreWallet(namespace)
    .then(() => setReadiness(namespace, 'ready'))
    .catch(error => {
      setReadiness(namespace, 'failed');
      throw error;
    })
    .finally(() => restorePromises.delete(namespace));

  restorePromises.set(namespace, restore);
  return restore;
}

export async function ensureWalletsForChainIds(
  chainIds: string[],
): Promise<void> {
  const namespaces = [
    ...new Set(chainIds.map(namespaceForChainId).filter(Boolean)),
  ] as WalletNamespace[];
  await Promise.all(namespaces.map(ensureWalletReady));
}

export async function ensureWalletForChainId(chainId: string): Promise<void> {
  const namespace = namespaceForChainId(chainId);
  if (namespace) {
    await ensureWalletReady(namespace);
  }
}

/**
 * Warm all signers after first render. InteractionManager keeps this work out
 * of the startup critical path; yielding between namespaces avoids one large
 * post-splash task on the JS thread.
 */
export function startBackgroundWalletRestoration() {
  if (backgroundRestoreStarted) return;
  backgroundRestoreStarted = true;

  InteractionManager.runAfterInteractions(async () => {
    for (const namespace of WALLET_NAMESPACES) {
      try {
        await ensureWalletReady(namespace);
      } catch (error) {
        LogStore.error(
          error instanceof Error ? error.message : 'Wallet restore failed',
          'WalletInitialization',
          'backgroundRestore',
          { namespace },
        );
      }
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  });
}
