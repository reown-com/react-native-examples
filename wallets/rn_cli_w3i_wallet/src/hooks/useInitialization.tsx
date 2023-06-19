import {useCallback, useEffect, useState} from 'react';
import {
  createChatClient,
  createPushWalletClient,
  createWeb3Wallet,
} from '../utils/clients';

export default function useInitialization() {
  const [initialized, setInitialized] = useState(false);

  const onInitialize = useCallback(async () => {
    try {
      await createWeb3Wallet();
      await createChatClient();
      await createPushWalletClient();
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
