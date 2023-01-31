import {Core} from '@walletconnect/core';
import {ICore} from '@walletconnect/types';
import {Web3Wallet, IWeb3Wallet} from '@walletconnect/web3wallet';
export let web3wallet: IWeb3Wallet;
export let core: ICore;
export let currentETHAddress: string;

// @ts-expect-error - env is a virtualised module via Babel config.
import {ENV_PROJECT_ID, ENV_RELAY_URL} from '@env';
import {createOrRestoreEIP155Wallet} from './EIP155Wallet';

export async function createWeb3Wallet() {
  core = new Core({
    logger: 'debug',
    projectId: ENV_PROJECT_ID,
    relayUrl: ENV_RELAY_URL,
  });

  const {eip155Addresses} = createOrRestoreEIP155Wallet();
  currentETHAddress = eip155Addresses[0];

  web3wallet = await Web3Wallet.init({
    core,
    metadata: {
      name: 'React Native Web3Wallet',
      description: 'ReactNative Web3Wallet',
      url: 'https://walletconnect.com/',
      icons: ['https://avatars.githubusercontent.com/u/37784886'],
    },
  });
}

export async function _pair(params: {uri: string}) {
  console.log('[PAIR] params:...', params);
  return await core.pairing.pair({uri: params.uri});
}
