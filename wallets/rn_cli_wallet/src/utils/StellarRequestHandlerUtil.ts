import { formatJsonRpcError, formatJsonRpcResult } from '@json-rpc-tools/utils';
import { SignClientTypes } from '@walletconnect/types';
import { getSdkError } from '@walletconnect/utils';

import LogStore, { serializeError } from '@/store/LogStore';
import { getWallet } from './StellarWalletUtil';
import { STELLAR_CHAINS, STELLAR_SIGNING_METHODS } from '@/constants/Stellar';

type RequestEventArgs = Omit<
  SignClientTypes.EventArguments['session_request'],
  'verifyContext'
>;

export async function approveStellarRequest(requestEvent: RequestEventArgs) {
  const { params, id } = requestEvent;
  const { chainId, request } = params;
  const requestParams = request.params;

  const wallet = await getWallet();
  if (!wallet) {
    LogStore.error(
      'Stellar wallet not initialized',
      'StellarRequestHandler',
      'approveStellarRequest',
    );
    return formatJsonRpcError(id, 'Stellar wallet not initialized');
  }

  // The signer address is echoed back as a CAIP-10 string bound to the session
  // chain (XDR payloads don't carry the plaintext `G…` address).
  const signerAddress = `${chainId}:${wallet.getAddress()}`;

  try {
    switch (request.method) {
      case STELLAR_SIGNING_METHODS.STELLAR_SIGN_XDR: {
        const signedXDR = wallet.signXDR(requestParams.xdr, chainId);
        return formatJsonRpcResult(id, { signedXDR, signerAddress });
      }

      case STELLAR_SIGNING_METHODS.STELLAR_SIGN_AND_SUBMIT_XDR: {
        const rpcUrl = STELLAR_CHAINS[chainId]?.rpcUrl;
        const result = await wallet.signAndSubmitXDR(
          requestParams.xdr,
          chainId,
          rpcUrl,
          requestParams.waitForInclusion,
        );
        return formatJsonRpcResult(id, result);
      }

      case STELLAR_SIGNING_METHODS.STELLAR_SIGN_MESSAGE: {
        const signature = wallet.signMessage(
          requestParams.message,
          requestParams.messageEncoding,
        );
        return formatJsonRpcResult(id, { signature, signerAddress });
      }

      case STELLAR_SIGNING_METHODS.STELLAR_SIGN_AUTH_ENTRY: {
        const signedAuthEntry = await wallet.signAuthEntry(
          requestParams.authEntry,
          chainId,
        );
        return formatJsonRpcResult(id, { signedAuthEntry, signerAddress });
      }

      default:
        throw new Error(getSdkError('INVALID_METHOD').message);
    }
  } catch (error: any) {
    LogStore.error(error.message, 'StellarRequestHandler', request.method, {
      error: serializeError(error),
    });
    return formatJsonRpcError(id, error.message);
  }
}

export function rejectStellarRequest(request: RequestEventArgs) {
  const { id } = request;
  return formatJsonRpcError(id, getSdkError('USER_REJECTED').message);
}
