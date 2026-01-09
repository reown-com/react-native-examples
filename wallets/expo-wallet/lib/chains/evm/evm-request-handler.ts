import { formatJsonRpcError, formatJsonRpcResult } from '@json-rpc-tools/utils';
import { getSdkError } from '@walletconnect/utils';
import { useWalletStore } from '@/stores/use-wallet-store';
import { EIP155_CHAINS, EIP155_SIGNING_METHODS } from '@/constants/eip155';

/**
 * Get the message to sign from request params.
 * personal_sign: [message, address]
 * eth_sign: [address, message]
 */
function getSignMessage(method: string, params: any[]): string {
  if (method === EIP155_SIGNING_METHODS.PERSONAL_SIGN) {
    return params[0];
  }
  // eth_sign has params in reverse order
  return params[1];
}

/**
 * Parse typed data from request params.
 * The data can be a string (JSON) or already parsed object.
 */
function getTypedData(params: any[]): {
  domain: any;
  types: any;
  primaryType: string;
  message: any;
} {
  let data;
  try {
    data = typeof params[1] === 'string' ? JSON.parse(params[1]) : params[1];
  } catch {
    throw new Error('Invalid typed data format');
  }

  // Remove EIP712Domain from types as viem handles it automatically
  const types = { ...data.types };
  delete types.EIP712Domain;

  return {
    domain: data.domain,
    types,
    primaryType: data.primaryType,
    message: data.message,
  };
}

/**
 * Handle EVM signing requests from WalletKit.
 * Routes to the appropriate signing method based on the request method.
 * @param id - JSON-RPC request ID
 * @param method - The signing method (e.g., personal_sign, eth_sendTransaction)
 * @param params - Method parameters
 * @param chainId - Chain identifier in CAIP-2 format (e.g., "eip155:1")
 */
export async function handleEvmRequest(
  id: number,
  method: string,
  params: any[],
  chainId?: string,
) {
  const { evmWallet } = useWalletStore.getState();

  if (!evmWallet) {
    return formatJsonRpcError(id, getSdkError('UNSUPPORTED_ACCOUNTS').message);
  }

  try {
    switch (method) {
      // eth_sign is disabled for security - it can be used for phishing attacks
      case EIP155_SIGNING_METHODS.ETH_SIGN: {
        return formatJsonRpcError(
          id,
          'eth_sign is disabled for security. Use personal_sign instead.',
        );
      }

      case EIP155_SIGNING_METHODS.PERSONAL_SIGN: {
        const message = getSignMessage(method, params);
        const signature = await evmWallet.signMessage(message);
        return formatJsonRpcResult(id, signature);
      }

      case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
      case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
      case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4: {
        const typedData = getTypedData(params);
        const signature = await evmWallet.signTypedData(typedData);
        return formatJsonRpcResult(id, signature);
      }

      case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION: {
        const txParams = params[0];
        const signature = await evmWallet.signTransaction(txParams);
        return formatJsonRpcResult(id, signature);
      }

      case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION: {
        // Get chain data for RPC URL
        const chainData = chainId ? EIP155_CHAINS[chainId] : undefined;
        if (!chainData) {
          return formatJsonRpcError(
            id,
            `Unsupported chain: ${chainId || 'unknown'}`,
          );
        }

        const txParams = params[0];
        const numericChainId = parseInt(chainData.chainId, 10);

        // Send transaction (signs and broadcasts)
        const txHash = await evmWallet.sendTransaction(
          txParams,
          numericChainId,
          chainData.rpcUrl,
        );
        return formatJsonRpcResult(id, txHash);
      }

      default:
        return formatJsonRpcError(id, getSdkError('INVALID_METHOD').message);
    }
  } catch (error: any) {
    console.error('EVM request handler error:', error);
    return formatJsonRpcError(id, error.message || 'Unknown error');
  }
}

/**
 * Reject an EVM request with USER_REJECTED error.
 */
export function rejectEvmRequest(id: number) {
  return formatJsonRpcError(id, getSdkError('USER_REJECTED').message);
}
