import {PROJECT_ID, SENTRY_DSN} from '@env';
import {IProviderMetadata} from '@walletconnect/modal-react-native';

const providerMetadata: IProviderMetadata = {
  name: 'Modal with UProvider',
  description: 'RN example using Universal Provider by WalletConnect',
  url: 'https://walletconnect.com/',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
  redirect: {
    native: 'wcmuprovidersample://',
  },
};

const sessionParams = {
  namespaces: {
    eip155: {
      methods: ['eth_sendTransaction', 'personal_sign'],
      chains: ['eip155:5'],
      events: ['chainChanged', 'accountsChanged'],
      rpcMap: {},
    },
  },
};

export default {
  PROJECT_ID,
  SENTRY_DSN,
  providerMetadata,
  sessionParams,
};
