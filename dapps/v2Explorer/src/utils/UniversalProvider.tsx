import '@walletconnect/react-native-compat';
import UniversalProvider from '@walletconnect/universal-provider';

// @ts-expect-error - `@env` is a virtualised module via Babel config.
import {ENV_PROJECT_ID, ENV_RELAY_URL} from '@env';

export let universalProvider;
export let currentWCURI;
export let universalProviderSession;

export async function createUniversalProvider() {
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
      console.log('UProvider URI:', uri);
    });

    // Subscribe to session ping
    universalProvider.on('session_ping', ({id, topic}) => {
      console.log(id, topic);
    });

    // Subscribe to session event
    universalProvider.on('session_event', ({event, chainId}) => {
      console.log(event, chainId);
    });

    // Subscribe to session update
    universalProvider.on('session_update', ({topic, params}) => {
      console.log(topic, params);
    });

    // Subscribe to session delete
    universalProvider.on('session_delete', ({id, topic}) => {
      console.log(id, topic);
    });

    universalProviderSession = await universalProvider.connect({
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
    });
  } catch {
    console.log('Error for connecting');
  }
}
