/**
 * Pay Store - Manages PayClient singleton
 *
 * Why a module-level singleton?
 * - PayClient is a class instance with methods
 * - Class instances don't serialize well with Zustand/proxy
 * - Module-level singleton provides simple, direct access
 *
 * Usage:
 * - Call PayStore.initialize() once at app startup
 * - Use PayStore.getClient() to access the client anywhere
 */

import { PayClient } from '@walletconnect/pay';
import type { PayClientOptions } from '@walletconnect/pay';

type PayClientInstance = InstanceType<typeof PayClient>;

// Store client at module level (class instances don't work well with proxies)
let clientInstance: PayClientInstance | null = null;

const PayStore = {
  /**
   * Initialize the PayClient with the given options.
   * Checks availability before initialization.
   */
  initialize(options: PayClientOptions) {
    // Check availability at call time, not import time
    if (!PayClient.isAvailable()) {
      if (__DEV__) {
        console.warn('[PayStore] Native provider not available');
      }
      return;
    }

    try {
      clientInstance = new PayClient(options);
      if (__DEV__) {
        console.log(
          '[PayStore] PayClient initialized with projectId:',
          clientInstance.projectId,
        );
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[PayStore] Failed to initialize PayClient:', error);
      }
      clientInstance = null;
    }
  },

  /**
   * Get the PayClient instance.
   * Returns null if not initialized or initialization failed.
   */
  getClient(): PayClientInstance | null {
    return clientInstance;
  },

  /**
   * Check if PayClient is available and initialized.
   */
  isAvailable(): boolean {
    return clientInstance !== null;
  },
};

export default PayStore;
