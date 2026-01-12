import { useEffect, useState } from 'react';
import Config from 'react-native-config';

import PayStore from '@/store/PayStore';

const PAY_CONFIG = {
  projectId: Config.ENV_PROJECT_ID || '',
  apiKey: Config.ENV_PAY_API_KEY || '',
  metadata: {
    name: 'RN Web3Wallet',
    bundleId: 'com.walletconnect.web3wallet.rnsample',
  },
};

export default function useInitializePaySDK() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) {
      return;
    }

    PayStore.initialize(PAY_CONFIG);
    setInitialized(PayStore.isAvailable());
  }, [initialized]);

  return initialized;
}
