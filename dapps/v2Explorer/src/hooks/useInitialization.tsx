import 'react-native-get-random-values';
import '@ethersproject/shims';

import {useCallback, useEffect, useState} from 'react';
import {createUniversalProvider} from '../utils/UniversalProvider';

interface Props {
  onSessionDisconnect?: ({id, topic}: {id: string; topic: string}) => void;
}

export default function useInitialization({onSessionDisconnect}: Props) {
  const [initialized, setInitialized] = useState(false);

  const onInitialize = useCallback(async () => {
    try {
      await createUniversalProvider({onSessionDisconnect});
      setInitialized(true);
    } catch (err: unknown) {
      console.log('Error for initializing', err);
    }
  }, [onSessionDisconnect]);

  useEffect(() => {
    if (!initialized) {
      onInitialize();
    }
  }, [initialized, onInitialize]);

  return initialized;
}
