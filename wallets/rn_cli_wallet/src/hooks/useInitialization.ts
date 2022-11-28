import {useCallback, useEffect, useState} from 'react';
import {createSignClient} from '../utils/SignClient';

export default function useInitialization() {
  const [initialized, setInitialized] = useState(false);

  const onInitialize = useCallback(async () => {
    try {
      await createSignClient();

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
