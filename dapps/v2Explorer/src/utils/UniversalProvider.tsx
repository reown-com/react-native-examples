import '@walletconnect/react-native-compat';
import UniversalProvider from '@walletconnect/universal-provider';

// @ts-expect-error - `@env` is a virtualised module via Babel config.
import {ENV_PROJECT_ID, ENV_RELAY_URL} from '@env';
import {SessionTypes} from '@walletconnect/types';
import {ethers} from 'ethers';

export let universalProvider: UniversalProvider;
export let web3Provider: ethers.providers.Web3Provider | undefined;
export let currentWCURI: string;
export let universalProviderSession: SessionTypes.Struct | undefined;

interface Props {
  onSessionDisconnect?: ({id, topic}: {id: string; topic: string}) => void;
}

export async function createUniversalProvider({onSessionDisconnect}: Props) {
  console.log('[CONFIG] ENV_PROJECT_ID:', ENV_PROJECT_ID);
  console.log('[CONFIG] ENV_RELAY_URL:', ENV_RELAY_URL);

  try {
    universalProvider = await UniversalProvider.init({
      logger: 'info',
      relayUrl: ENV_RELAY_URL,
      projectId: ENV_PROJECT_ID,
      metadata: {
        name: 'React Native V2 dApp',
        description: 'RN dApp by WalletConnect',
        url: 'https://walletconnect.com/',
        icons: ['https://avatars.githubusercontent.com/u/37784886'],
      },
    });

    universalProvider.on('display_uri', uri => {
      currentWCURI = uri;
      console.log('UniversalProvider display_uri event:', uri);
    });

    // Subscribe to session ping
    universalProvider.on('session_ping', ({id, topic}) => {
      console.log('session_ping', id, topic);
    });

    // Subscribe to session event
    universalProvider.on('session_event', ({event, chainId}) => {
      console.log('session_event', event, chainId);
    });

    // Subscribe to session update
    universalProvider.on('session_update', ({topic, params}) => {
      console.log('session_update', topic, params);
    });

    // Subscribe to session delete
    universalProvider.on(
      'session_delete',
      ({id, topic}: {id: string; topic: string}) => {
        onSessionDisconnect?.({id, topic});
        console.log('session_delete', id, topic);
      },
    );
  } catch {
    console.log('Error for connecting');
  }
}

export function clearSession() {
  universalProviderSession = undefined;
  web3Provider = undefined;
}

export async function createUniversalProviderSession(callbacks?: {
  onSuccess?: () => void;
  onFailure?: (error: any) => void;
}) {
  await universalProvider
    .connect({
      namespaces: {
        eip155: {
          methods: [
            'eth_sendTransaction',
            'eth_signTransaction',
            'eth_sign',
            'personal_sign',
            'eth_signTypedData',
          ],
          chains: ['eip155:1'],
          events: ['chainChanged', 'accountsChanged'],
          rpcMap: {
            1: `https://rpc.walletconnect.com?chainId=eip155:1&projectId=${ENV_PROJECT_ID}`,
          },
        },
      },
    })
    .then(session => {
      universalProviderSession = session;
      web3Provider = new ethers.providers.Web3Provider(universalProvider);
      callbacks?.onSuccess?.();
    })
    .catch(error => {
      console.log('Error creating session', error);
      callbacks?.onFailure?.(error);
    });
}
