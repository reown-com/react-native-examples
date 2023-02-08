import '@walletconnect/react-native-compat';
import UniversalProvider from '@walletconnect/universal-provider';

// @ts-expect-error - `@env` is a virtualised module via Babel config.
import {ENV_PROJECT_ID, ENV_RELAY_URL} from '@env';

export let universalProvider;

export async function createUniversalProvider() {
  //   console.log('[CONFIG] ENV_PROJECT_ID:', ENV_PROJECT_ID);
  //   console.log('[CONFIG] ENV_RELAY_URL:', ENV_RELAY_URL);

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

  await universalProvider?.client?.connect({
    namespaces: {
      eip155: {
        methods: [
          'eth_sendTransaction',
          'eth_signTransaction',
          'eth_sign',
          'personal_sign',
          'eth_signTypedData',
        ],
        chains: ['eip155:80001'],
        events: ['chainChanged', 'accountsChanged'],
        rpcMap: {
          80001:
            'https://rpc.walletconnect.com?chainId=eip155:80001&projectId=<your walletconnect project id>',
        },
      },
      //   pairingTopic: '<123...topic>', // optional topic to connect to
      skipPairing: false, // optional to skip pairing ( later it can be resumed by invoking .pair())
    },
  });
}
