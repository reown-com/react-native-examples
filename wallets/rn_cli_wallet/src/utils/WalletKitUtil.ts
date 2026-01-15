import { WalletKit, IWalletKit } from '@reown/walletkit';
import { Core } from '@walletconnect/core';
import Config from 'react-native-config';
import { getMetadata } from './misc';
import { storage } from './storage';

export let walletKit: IWalletKit;

export async function createWalletKit(relayerRegionURL: string) {
  const core = new Core({
    projectId: Config.ENV_PROJECT_ID,
    storage,
    relayUrl: relayerRegionURL || undefined,
  });
  walletKit = await WalletKit.init({
    core,
    metadata: getMetadata(),
  });

  try {
    const clientId =
      await walletKit.engine.signClient.core.crypto.getClientId();
    console.log('WalletConnect ClientID: ', clientId);
    storage.setItem('WALLETCONNECT_CLIENT_ID', clientId);
  } catch (error) {
    console.error(
      'Failed to set WalletConnect clientId in localStorage: ',
      error,
    );
  }
}

// Check if a URI is a WalletConnect Pay payment link
export function isPaymentLink(uri: string): boolean {
  // Handle WC URI with pay= parameter (e.g., wc:...&pay=https://pay.walletconnect.com/...)
  if (uri.startsWith('wc:')) {
    const queryStart = uri.indexOf('?');
    if (queryStart === -1) {
      return false;
    }
    const queryString = uri.substring(queryStart + 1);
    const params = new URLSearchParams(queryString);
    const payParam = params.get('pay');
    if (payParam) {
      const decodedPayUrl = decodeURIComponent(payParam);
      return isPaymentUrl(decodedPayUrl);
    }
    return false;
  }

  // Handle direct payment URL
  return isPaymentUrl(uri);
}

function isPaymentUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    const isPayHost =
      hostname === 'pay.walletconnect.com' ||
      hostname === 'www.pay.walletconnect.com';
    return isPayHost && parsed.searchParams.has('pid');
  } catch {
    return false;
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
