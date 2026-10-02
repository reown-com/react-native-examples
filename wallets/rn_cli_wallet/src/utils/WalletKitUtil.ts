import { WalletKit, IWalletKit, isPaymentLink } from '@reown/walletkit';
import { Core } from '@walletconnect/core';
import { ENV } from './env';
import { getMetadata } from './misc';
import { storage } from './storage';
import LogStore, { serializeError } from '@/store/LogStore';

export { isPaymentLink };

export let walletKit: IWalletKit;

export async function createWalletKit(relayerRegionURL: string) {
  const core = new Core({
    projectId: ENV.PROJECT_ID,
    storage,
    relayUrl: relayerRegionURL || undefined,
  });
  // Pay defaults to production, authenticating with the WalletConnect project
  // ID. Other environments (e.g. staging, where new chains land first) run
  // their own credential registry, so they need their own gateway URL and
  // Pay app ID.
  const payApiBaseUrl = ENV.PAY_API_BASE_URL || undefined;
  const payAppId = ENV.PAY_APP_ID || undefined;
  const payConfig = {
    ...(payApiBaseUrl ? { baseUrl: payApiBaseUrl } : {}),
    ...(payAppId ? { appId: payAppId } : {}),
  };
  walletKit = await WalletKit.init({
    core,
    metadata: getMetadata(),
    ...(Object.keys(payConfig).length ? { payConfig } : {}),
  });

  try {
    const clientId =
      await walletKit.engine.signClient.core.crypto.getClientId();
    LogStore.log('WalletConnect ClientID', 'WalletKitUtil', 'createWalletKit', {
      clientId,
    });
    storage.setItem('WALLETCONNECT_CLIENT_ID', clientId);
  } catch (error) {
    LogStore.error(
      'Failed to set WalletConnect clientId in localStorage',
      'WalletKitUtil',
      'createWalletKit',
      {
        error: serializeError(error),
      },
    );
  }
}

export async function updateSignClientChainId(
  chainId: string,
  address: string,
) {
  // get most recent session
  const sessions = walletKit.getActiveSessions();
  if (!sessions) {
    return;
  }
  const namespace = chainId.split(':')[0];
  Object.values(sessions).forEach(async session => {
    await walletKit.updateSession({
      topic: session.topic,
      namespaces: {
        ...session.namespaces,
        [namespace]: {
          ...session.namespaces[namespace],
          chains: [
            ...new Set(
              [chainId].concat(
                Array.from(session.namespaces[namespace].chains || []),
              ),
            ),
          ],
          accounts: [
            ...new Set(
              [`${chainId}:${address}`].concat(
                Array.from(session.namespaces[namespace].accounts),
              ),
            ),
          ],
        },
      },
    });
    await new Promise(resolve => setTimeout(resolve, 1000));

    const chainChanged = {
      topic: session.topic,
      event: {
        name: 'chainChanged',
        data: parseInt(chainId.split(':')[1], 10),
      },
      chainId: chainId,
    };

    const accountsChanged = {
      topic: session.topic,
      event: {
        name: 'accountsChanged',
        data: [`${chainId}:${address}`],
      },
      chainId,
    };
    await walletKit.emitSessionEvent(chainChanged);
    await walletKit.emitSessionEvent(accountsChanged);
  });
}

export function formatDomain(url: string | undefined): string {
  if (!url) {
    return 'unknown domain';
  }
  return url.replace(/^https?:\/\//, '').replace(/^www\./, '');
}
