import SignClient from '@walletconnect/sign-client';
// @ts-expect-error - `@env` is a virtualised module via Babel config.
import {ENV_PROJECT_ID, ENV_RELAY_URL} from '@env';

export let signClient: SignClient;

export async function createSignClient() {
  console.log('[CONFIG] ENV_PROJECT_ID:', '43a917ec9ac926c2e20f0104e96eacde');
  console.log('[CONFIG] ENV_RELAY_URL:', ENV_RELAY_URL);

  signClient = await SignClient.init({
    logger: 'debug',
    projectId: '43a917ec9ac926c2e20f0104e96eacde',
    relayUrl: 'wss://relay.walletconnect.com',
    metadata: {
      name: 'React Native Wallet',
      description: 'React Native Wallet for WalletConnect',
      url: 'https://walletconnect.com/',
      icons: ['https://avatars.githubusercontent.com/u/37784886'],
    },
  });
}
