import {ENV_PROJECT_ID} from '@env';
import {IProviderMetadata} from '@walletconnect/modal-react-native';

const providerMetadata: IProviderMetadata = {
  name: 'Modal with Ethers',
  description: 'RN example using Ethers 5 by Reown',
  url: 'https://reown.com/appkit',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
  redirect: {
    native: 'wcmetherssample://',
  },
};

const sessionParams = {
  namespaces: {
    eip155: {
      methods: ['eth_sendTransaction', 'personal_sign'],
      chains: ['eip155:1'],
      events: ['chainChanged', 'accountsChanged'],
      rpcMap: {},
    },
  },
};

export default {
  ENV_PROJECT_ID,
  providerMetadata,
  sessionParams,
};
