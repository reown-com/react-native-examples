import { formatJsonRpcError, formatJsonRpcResult } from '@json-rpc-tools/utils';
import { SignClientTypes } from '@walletconnect/types';
import { getSdkError } from '@walletconnect/utils';

import { getWallet } from './SuiWalletUtil';
import { SUI_SIGNING_METHODS } from '@/constants/Sui';

type RequestEventArgs = Omit<
  SignClientTypes.EventArguments['session_request'],
  'verifyContext'
>;
export async function approveSuiRequest(requestEvent: RequestEventArgs) {
  const { params, id } = requestEvent;
  const { chainId, request } = params;

  const wallet = await getWallet();

  switch (request.method) {
    case SUI_SIGNING_METHODS.SUI_SIGN_PERSONAL_MESSAGE:
      try {
        const message = request.params.message;
        const signedMessage = await wallet.signMessage({ message });
        return formatJsonRpcResult(id, signedMessage);
      } catch (error: any) {
        console.error(error);
        return formatJsonRpcError(id, error.message);
      }
    case SUI_SIGNING_METHODS.SUI_SIGN_TRANSACTION:
      try {
        const result = await wallet.signTransaction({
          transaction: request.params.transaction,
          chainId,
        });
        return formatJsonRpcResult(id, result);
      } catch (error: any) {
        console.error(error);
        return formatJsonRpcError(id, error.message);
      }
    case SUI_SIGNING_METHODS.SUI_SIGN_AND_EXECUTE_TRANSACTION:
      try {
        const result = await wallet.signAndExecuteTransaction({
          transaction: request.params.transaction,
          chainId,
        });
        return formatJsonRpcResult(id, result);
      } catch (error: any) {
        console.error(error);
        return formatJsonRpcError(id, error.message);
      }
    default:
      throw new Error(getSdkError('INVALID_METHOD').message);
  }
}
export function rejectSuiRequest(request: RequestEventArgs) {
  const { id } = request;

  return formatJsonRpcError(id, getSdkError('USER_REJECTED').message);
}
