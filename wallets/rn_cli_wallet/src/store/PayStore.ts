import { WalletConnectPay } from '@walletconnect/pay';
import type { WalletConnectPayOptions } from '@walletconnect/pay';

type WalletConnectPayInstance = InstanceType<typeof WalletConnectPay>;

// Store client outside of valtio proxy since class instances don't work well with proxies
let clientInstance: WalletConnectPayInstance | null = null;

const PayStore = {
  initialize(options: WalletConnectPayOptions) {
    // Check availability at call time, not import time
    if (!WalletConnectPay.isAvailable()) {
      console.warn('[PayStore] Native provider not available');
      return;
    }

    try {
      clientInstance = new WalletConnectPay(options);
      console.log(
        '[PayStore] WalletConnectPay initialized with projectId:',
        clientInstance.projectId,
      );
    } catch (error) {
      console.error('[PayStore] Failed to initialize WalletConnectPay:', error);
      clientInstance = null;
    }
  },

  getClient(): WalletConnectPayInstance | null {
    return clientInstance;
  },

  isAvailable(): boolean {
    return clientInstance !== null;
  },
};

export default PayStore;
