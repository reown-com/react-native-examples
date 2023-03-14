import 'react-native-get-random-values';
import '@ethersproject/shims';

import {useCallback, useEffect, useState} from 'react';
import {createUniversalProvider} from '../utils/UniversalProvider';

export default function useInitialization() {
  const [initialized, setInitialized] = useState(false);

  const onInitialize = useCallback(async () => {
    try {
      await createUniversalProvider();
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
