import { Core } from '@walletconnect/core'
import { ICore } from '@walletconnect/types'
import { Web3Wallet, IWeb3Wallet } from '@walletconnect/web3wallet'

// @ts-expect-error - `@env` is a virtualised module via Babel config.
import {ENV_PROJECT_ID, ENV_RELAY_URL} from '@env';

export let web3wallet: IWeb3Wallet
export let core: ICore

export async function createWeb3Wallet() {
  console.log('[CONFIG] ENV_PROJECT_ID:', ENV_PROJECT_ID);
  console.log('[CONFIG] ENV_RELAY_URL:', ENV_RELAY_URL);

  web3wallet = await Web3Wallet.init({
    logger: 'debug',
    projectId: ENV_PROJECT_ID,
    relayUrl: ENV_RELAY_URL,
    metadata: {
      name: 'React Native Wallet',
      description: 'React Native Wallet for WalletConnect',
      url: 'https://walletconnect.com/',
      icons: ['https://avatars.githubusercontent.com/u/37784886'],
    },
  });

}
