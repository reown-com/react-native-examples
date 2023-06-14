import {ChatClient, IChatClient} from '@walletconnect/chat-client';
import {Core} from '@walletconnect/core';
import {SyncClient, SyncStore} from '@walletconnect/sync-client';
import {ICore} from '@walletconnect/types';
import {IWeb3Wallet, Web3Wallet} from '@walletconnect/web3wallet';
// @ts-expect-error - env is a virtualised module via Babel config.
import {ENV_PROJECT_ID, ENV_RELAY_URL} from '@env';
import {createOrRestoreEIP155Wallet} from './EIP155Wallet';

export let web3wallet: IWeb3Wallet;
export let chatClient: IChatClient;
export let core: ICore;
export let currentETHAddress: string;

core = new Core({
  // @notice: If you want the debugger / logs
  // logger: 'debug',
  projectId: ENV_PROJECT_ID,
  relayUrl: ENV_RELAY_URL,
});

export async function createWeb3Wallet() {
  console.log('ENV_PROJECT_ID', ENV_PROJECT_ID);
  console.log('ENV_RELAY_URL', ENV_RELAY_URL);

  const {eip155Addresses} = await createOrRestoreEIP155Wallet();
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
  return await core.pairing.pair({uri: params.uri});
}

export async function createChatClient() {
  // SyncClient enables syncing data across devices
  const syncClient = await SyncClient.init({
    projectId: ENV_PROJECT_ID,
    core,
  });

  chatClient = await ChatClient.init({
    core,
    projectId: ENV_PROJECT_ID,
    syncClient,
    SyncStoreController: SyncStore,
  });
}
