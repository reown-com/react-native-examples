import {createOrRestoreEIP155Wallet} from '@/utils/EIP155WalletUtil';
import {useState, useCallback, useEffect} from 'react';
import {Core} from '@walletconnect/core';
import {IWeb3Wallet, Web3Wallet} from '@walletconnect/web3wallet';
// import SignClient from '@walletconnect/sign-client';
import {SessionTypes} from '@walletconnect/types';
import {ICore} from '@walletconnect/types';

export let web3wallet: IWeb3Wallet;
export let core: ICore;

export default function useInitialization() {
  const [initialized, setInitialized] = useState(false);

  async function createWeb3WalletClient() {
    try {
      const core = new Core({
        projectId: '43a917ec9ac926c2e20f0104e96eacde',
        relayUrl: 'wss://relay.walletconnect.com',
      });

      const client = await Web3Wallet.init({
        core,
        metadata: {
          name: 'React Native Example',
          description: 'React Native Web3Wallet for WalletConnect',
          url: 'https://walletconnect.com/',
          icons: ['https://avatars.githubusercontent.com/u/37784886'],
        },
      });
      console.log('createWeb3WalletClient2', client);
      //   setWeb3WalletClient(client);
    } catch (e) {
      console.log(e);
    }
  }

  const onInitialize = useCallback(async () => {
    try {
      //   const {eip155Addresses} = createOrRestoreEIP155Wallet();
      await createWeb3WalletClient();
      setInitialized(true);
    } catch (err: unknown) {
      alert(err);
    }
  }, []);

  useEffect(() => {
    if (!initialized) {
      onInitialize();
    }
  });

  return initialized;
}

export async function pair(params: {uri: string}) {
  return await core.pairing.pair({uri: params.uri});
}
