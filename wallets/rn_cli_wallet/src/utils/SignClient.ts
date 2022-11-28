import SignClient from '@walletconnect/sign-client';

export let signClient: SignClient;

export async function createSignClient() {
  signClient = await SignClient.init({
    logger: 'debug',
    projectId: process.env.REACT_NATIVE_APP_PROJECT_ID,
    relayUrl: process.env.REACT_NATIVE_RELAY_URL,
    metadata: {
      name: 'React Native Wallet',
      description: 'React Native Wallet for WalletConnect',
      url: 'https://walletconnect.com/',
      icons: ['https://avatars.githubusercontent.com/u/37784886'],
    },
  });
}
