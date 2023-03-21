import 'react-native-get-random-values';
import '@ethersproject/shims';

import {useCallback, useEffect, useState} from 'react';
import {createUniversalProvider} from '../utils/UniversalProvider';
import {Alert} from 'react-native';

function useInitialization() {
  const [initialized, setInitialized] = useState(false);

  const onInitialize = useCallback(async () => {
    try {
      await createUniversalProvider();
      setInitialized(true);
    } catch (err: unknown) {
      Alert.alert('Error', 'Error initializing');
    }
  }, []);

  useEffect(() => {
    if (!initialized) {
      onInitialize();
    }
  }, [initialized, onInitialize]);

  return initialized;
}

export default useInitialization;
