import '@walletconnect/react-native-compat';
import UniversalProvider from '@walletconnect/universal-provider';

// @ts-expect-error - `@env` is a virtualised module via Babel config.
import {ENV_PROJECT_ID, ENV_RELAY_URL} from '@env';

export let universalProvider;
export let currentWCURI;
export let universalProviderSession;
export let provider;

export async function createUniversalProvider() {
  //   console.log('[CONFIG] ENV_PROJECT_ID:', ENV_PROJECT_ID);
  //   console.log('[CONFIG] ENV_RELAY_URL:', ENV_RELAY_URL);

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
      client: undefined, // optional instance of @walletconnect/sign-client
    });

    // console.log('provider....tom', provider.session);
    // This is equivalent to: await provider.enable() ? in V1;

    universalProvider.on('display_uri', uri => {
      currentWCURI = uri;
      console.log('UProvider URI:', uri);
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
            1: 'https://rpc.walletconnect.com?chainId=eip155:1&projectId=8a0ba6f700740986e9dce03011f84a4b',
          },
        },
      },
    });

    console.log('UP SESSION', universalProviderSession);
  } catch {
    console.log('Error for connecting');
  }
}
