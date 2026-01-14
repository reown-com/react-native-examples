/**
 * Payment Signing Utilities
 *
 * Handles signing of payment actions from the WalletConnect Pay SDK.
 * Supports both EIP-712 typed data and personal_sign methods.
 */

import type { Action } from '@walletconnect/pay';
import type { EvmWallet } from '@/lib/chains/evm/evm-wallet';

/**
 * Supported signing methods for payment actions.
 */
type SigningMethod =
  | 'eth_signTypedData_v4'
  | 'eth_signTypedData_v3'
  | 'eth_signTypedData'
  | 'personal_sign';

/**
 * Sign all required payment actions with the wallet.
 *
 * Payment actions come from the Pay SDK and require cryptographic signatures
 * to authorize the payment. Each action specifies:
 * - chainId: The blockchain network
 * - method: The signing method (typed data or personal sign)
 * - params: JSON-encoded parameters for signing
 *
 * @param actions - Array of payment actions from getRequiredPaymentActions()
 * @param wallet - The EVM wallet instance for signing
 * @returns Array of signatures in the same order as actions
 * @throws Error if an unsupported signing method is requested
 */
export async function signPaymentActions(
  actions: Action[],
  wallet: EvmWallet,
): Promise<string[]> {
  const signatures: string[] = [];

  for (const action of actions) {
    const { method, params } = action.walletRpc;

    if (__DEV__) {
      console.log('[Pay] Signing action:', { method });
    }

    // Parse params - it's a JSON string containing [address, data]
    const parsedParams = JSON.parse(params);

    const signature = await signAction(
      method as SigningMethod,
      parsedParams,
      wallet,
    );
    signatures.push(signature);

    if (__DEV__) {
      console.log('[Pay] Signature obtained');
    }
  }

  return signatures;
}

/**
 * Sign a single payment action based on its method type.
 */
async function signAction(
  method: SigningMethod,
  params: unknown[],
  wallet: EvmWallet,
): Promise<string> {
  switch (method) {
    case 'eth_signTypedData_v4':
    case 'eth_signTypedData_v3':
    case 'eth_signTypedData': {
      // params[1] is the typed data (may be JSON string or object)
      const typedDataRaw = params[1];
      const typedData =
        typeof typedDataRaw === 'string'
          ? JSON.parse(typedDataRaw)
          : typedDataRaw;

      return wallet.signTypedData(typedData);
    }

    case 'personal_sign': {
      // params[0] is the message to sign
      const message = params[0] as string;
      return wallet.signMessage(message);
    }

    default:
      throw new Error(`Unsupported signing method: ${method}`);
  }
}
