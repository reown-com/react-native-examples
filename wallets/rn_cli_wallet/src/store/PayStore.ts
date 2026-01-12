import { PayClient } from '@walletconnect/pay';
import type { PayClientOptions } from '@walletconnect/pay';

type PayClientInstance = InstanceType<typeof PayClient>;

// Store client outside of valtio proxy since class instances don't work well with proxies
let clientInstance: PayClientInstance | null = null;

const PayStore = {
  initialize(options: PayClientOptions) {
    // Check availability at call time, not import time
    if (!PayClient.isAvailable()) {
      console.warn('[PayStore] Native provider not available');
      return;
    }

    try {
      clientInstance = new PayClient(options);
      console.log(
        '[PayStore] PayClient initialized with projectId:',
        clientInstance.projectId,
      );
    } catch (error) {
      console.error('[PayStore] Failed to initialize PayClient:', error);
      clientInstance = null;
    }
  },

  getClient(): PayClientInstance | null {
    return clientInstance;
  },

  isAvailable(): boolean {
    return clientInstance !== null;
  },
};

export default PayStore;
