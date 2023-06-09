import {useCallback, useEffect, useState} from 'react';
import {createWeb3Wallet} from '../utils/Web3WalletClient';
import {createChatClient} from '../utils/ChatClient';

export default function useInitialization() {
  const [initialized, setInitialized] = useState(false);

  const onInitialize = useCallback(async () => {
    try {
      await createWeb3Wallet();
      await createChatClient();
      // Add in Push Client
      setInitialized(true);
    } catch (err: unknown) {
      console.log('Error for initializing', err);
    }
  }, []);

  useEffect(() => {
    if (!initialized) {
      onInitialize();
    }
  }, [initialized, onInitialize]);

  return initialized;
}
