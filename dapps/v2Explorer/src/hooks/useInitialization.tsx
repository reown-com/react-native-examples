import 'react-native-get-random-values';
import '@ethersproject/shims';
import {ethers} from 'ethers';

import {useCallback, useEffect, useState} from 'react';
import {
  createUniversalProvider,
  universalProvider,
} from '../utils/UniversalProvider';

export let web3Provider;

export default function useInitialization() {
  const [initialized, setInitialized] = useState(false);

  const onInitialize = useCallback(async () => {
    try {
      await createUniversalProvider();
      web3Provider = new ethers.providers.Web3Provider(universalProvider);
      console.log('initialization web3Provier', web3Provider);
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
