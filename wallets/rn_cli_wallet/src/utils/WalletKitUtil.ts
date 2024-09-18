import {WalletKit, IWalletKit} from '@reown/walletkit';
import {Core} from '@walletconnect/core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import {getMetadata} from './misc';

export let walletKit: IWalletKit;

export async function createWalletKit(relayerRegionURL: string) {
  const core = new Core({
    projectId: Config.ENV_PROJECT_ID,
    relayUrl: relayerRegionURL ?? Config.ENV_RELAY_URL,
  });
  walletKit = await WalletKit.init({
    core,
    metadata: getMetadata(),
  });

  try {
    const clientId =
      await walletKit.engine.signClient.core.crypto.getClientId();
    console.log('WalletConnect ClientID: ', clientId);
    AsyncStorage.setItem('WALLETCONNECT_CLIENT_ID', clientId);
  } catch (error) {
    console.error(
      'Failed to set WalletConnect clientId in localStorage: ',
      error,
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
