import { formatJsonRpcError, formatJsonRpcResult } from '@json-rpc-tools/utils';
import { SignClientTypes } from '@walletconnect/types';
import { getSdkError } from '@walletconnect/utils';

import LogStore, { serializeError } from '@/store/LogStore';
import { getWallet } from './SolanaWalletUtil';
import { SOLANA_SIGNING_METHODS } from '@/constants/Solana';

type RequestEventArgs = Omit<
  SignClientTypes.EventArguments['session_request'],
  'verifyContext'
>;

export async function approveSolanaRequest(requestEvent: RequestEventArgs) {
  const { params, id } = requestEvent;
  const { chainId, request } = params;

  const wallet = await getWallet();

  switch (request.method) {
    case SOLANA_SIGNING_METHODS.SOLANA_SIGN_MESSAGE:
      try {
        const message = request.params.message;
        const result = await wallet.signMessage({ message });
        return formatJsonRpcResult(id, result);
      } catch (error: any) {
        LogStore.error(error.message, 'SolanaRequestHandler', 'signMessage', {
          error: serializeError(error),
        });
        return formatJsonRpcError(id, error.message);
      }
    case SOLANA_SIGNING_METHODS.SOLANA_SIGN_TRANSACTION:
      try {
        const result = await wallet.signTransaction({
          transaction: request.params.transaction,
        });
        return formatJsonRpcResult(id, result);
      } catch (error: any) {
        LogStore.error(
          error.message,
          'SolanaRequestHandler',
          'signTransaction',
          { error: serializeError(error) },
        );
        return formatJsonRpcError(id, error.message);
      }
    case SOLANA_SIGNING_METHODS.SOLANA_SIGN_ALL_TRANSACTIONS:
      try {
        const result = await wallet.signAllTransactions({
          transactions: request.params.transactions,
        });
        return formatJsonRpcResult(id, result);
      } catch (error: any) {
        LogStore.error(
          error.message,
          'SolanaRequestHandler',
          'signAllTransactions',
          { error: serializeError(error) },
        );
        return formatJsonRpcError(id, error.message);
      }
    case SOLANA_SIGNING_METHODS.SOLANA_SIGN_AND_SEND_TRANSACTION:
      try {
        const result = await wallet.signAndSendTransaction({
          transaction: request.params.transaction,
          options: request.params.options,
          chainId,
        });
        return formatJsonRpcResult(id, result);
      } catch (error: any) {
        LogStore.error(
          error.message,
          'SolanaRequestHandler',
          'signAndSendTransaction',
          { error: serializeError(error) },
        );
        return formatJsonRpcError(id, error.message);
      }
    default:
      throw new Error(getSdkError('INVALID_METHOD').message);
  }
}

export function rejectSolanaRequest(request: RequestEventArgs) {
  const { id } = request;
  return formatJsonRpcError(id, getSdkError('USER_REJECTED').message);
}
