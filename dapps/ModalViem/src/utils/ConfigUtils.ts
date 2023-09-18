import {IProviderMetadata} from '@walletconnect/modal-react-native';

const PROJECT_ID = '90369b5c91c6f7fffe308df2b30f3ace';

const providerMetadata: IProviderMetadata = {
  name: 'Modal with Viem',
  description: 'RN example using Viem by WalletConnect',
  url: 'https://walletconnect.com/',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
  redirect: {
    native: 'wcmviemsample://',
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
  providerMetadata,
  sessionParams,
};
