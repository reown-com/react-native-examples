import SettingsStore from '@/store/SettingsStore';
import LogStore from '@/store/LogStore';

export const WALLET_NAMESPACES = [
  'eip155',
  'sui',
  'ton',
  'tron',
  'solana',
  'bip122',
  'stellar',
  // Canton has no balance card, so restore it after visible wallet addresses.
  'canton',
] as const;

export type WalletNamespace = (typeof WALLET_NAMESPACES)[number];
type Readiness = 'idle' | 'loading' | 'ready' | 'failed';

const restorePromises = new Map<WalletNamespace, Promise<void>>();
let backgroundRestoreStarted = false;

const BACKGROUND_RESTORE_GRACE_MS = 750;
const IDLE_RESTORE_TIMEOUT_MS = 2000;

function runWhenIdle(callback: () => void) {
  if (typeof globalThis.requestIdleCallback === 'function') {
    globalThis.requestIdleCallback(callback, {
      timeout: IDLE_RESTORE_TIMEOUT_MS,
    });
    return;
  }

  // Older web runtimes (notably Safari versions without requestIdleCallback)
  // still get the same one-wallet-per-turn behavior.
  setTimeout(callback, 0);
}

function namespaceForChainId(chainId: string): WalletNamespace | null {
  const namespace = chainId.split(':', 1)[0];
  return WALLET_NAMESPACES.includes(namespace as WalletNamespace)
    ? (namespace as WalletNamespace)
    : null;
}

function setReadiness(namespace: WalletNamespace, readiness: Readiness) {
  SettingsStore.setWalletReadiness(namespace, readiness);
}

async function restoreWallet(namespace: WalletNamespace) {
  const startedAt = globalThis.performance?.now?.() ?? Date.now();

  switch (namespace) {
    case 'eip155': {
      const { createOrRestoreEIP155Wallet, eip155Wallets } =
        require('./EIP155WalletUtil') as typeof import('./EIP155WalletUtil');
      const { eip155Addresses } = await createOrRestoreEIP155Wallet();
      const address = eip155Addresses[0];
      SettingsStore.setEIP155Address(address);
      SettingsStore.setWallet(eip155Wallets[address]);
      break;
    }
    case 'sui': {
      const { createOrRestoreSuiWallet } =
        require('./SuiWalletUtil') as typeof import('./SuiWalletUtil');
      const { suiAddresses, suiWallet } = await createOrRestoreSuiWallet();
      SettingsStore.setSuiAddress(suiAddresses[0]);
      SettingsStore.setSuiWallet(suiWallet);
      break;
    }
    case 'ton': {
      const { createOrRestoreTonWallet } =
        require('./TonWalletUtil') as typeof import('./TonWalletUtil');
      const { tonAddresses, tonWallets } = await createOrRestoreTonWallet();
      SettingsStore.setTonAddress(tonAddresses[0]);
      SettingsStore.setTonWallet(tonWallets[tonAddresses[0]]);
      break;
    }
    case 'tron': {
      const { createOrRestoreTronWallet } =
        require('./TronWalletUtil') as typeof import('./TronWalletUtil');
      const { tronAddresses, tronWallets } = await createOrRestoreTronWallet();
      SettingsStore.setTronAddress(tronAddresses[0]);
      SettingsStore.setTronWallet(tronWallets[tronAddresses[0]]);
      break;
    }
    case 'canton': {
      const { createOrRestoreCantonWallet } =
        require('./CantonWalletUtil') as typeof import('./CantonWalletUtil');
      const { cantonAddresses, cantonWallet } =
        await createOrRestoreCantonWallet();
      SettingsStore.setCantonAddress(cantonAddresses[0]);
      SettingsStore.setCantonWallet(cantonWallet);
      break;
    }
    case 'solana': {
      const { createOrRestoreSolanaWallet } =
        require('./SolanaWalletUtil') as typeof import('./SolanaWalletUtil');
      const { solanaAddress, solanaWallet } =
        await createOrRestoreSolanaWallet();
      SettingsStore.setSolanaAddress(solanaAddress);
      SettingsStore.setSolanaWallet(solanaWallet);
      break;
    }
    case 'bip122': {
      const { createOrRestoreBitcoinWallet } =
        require('./BitcoinWalletUtil') as typeof import('./BitcoinWalletUtil');
      const { bitcoinAddresses, bitcoinWallet } =
        await createOrRestoreBitcoinWallet();
      SettingsStore.setBitcoinAddresses(bitcoinAddresses);
      SettingsStore.setBitcoinWallet(bitcoinWallet);
      break;
    }
    case 'stellar': {
      const { createOrRestoreStellarWallet } =
        require('./StellarWalletUtil') as typeof import('./StellarWalletUtil');
      const { stellarAddress, stellarWallet } =
        await createOrRestoreStellarWallet();
      SettingsStore.setStellarAddress(stellarAddress);
      SettingsStore.setStellarWallet(stellarWallet);
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
 * Warm one signer per idle period after the first screen has had time to become
 * interactive. Any user-triggered flow can pre-empt this queue by calling an
 * ensure function directly; concurrent callers share the same restore.
 */
export function startBackgroundWalletRestoration() {
  if (backgroundRestoreStarted) return;
  backgroundRestoreStarted = true;

  const scheduleRestore = (index: number) => {
    const namespace = WALLET_NAMESPACES[index];
    if (!namespace) return;

    runWhenIdle(() => {
      ensureWalletReady(namespace)
        .catch(error => {
          LogStore.error(
            error instanceof Error ? error.message : 'Wallet restore failed',
            'WalletInitialization',
            'backgroundRestore',
            { namespace },
          );
        })
        .finally(() => scheduleRestore(index + 1));
    });
  };

  setTimeout(() => scheduleRestore(0), BACKGROUND_RESTORE_GRACE_MS);
}
