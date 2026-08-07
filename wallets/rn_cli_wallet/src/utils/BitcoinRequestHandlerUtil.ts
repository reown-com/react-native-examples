import { formatJsonRpcError, formatJsonRpcResult } from '@json-rpc-tools/utils';
import { SignClientTypes } from '@walletconnect/types';
import { getSdkError } from '@walletconnect/utils';

import LogStore, { serializeError } from '@/store/LogStore';
import { getWallet } from './BitcoinWalletUtil';
import { BIP122_SIGNING_METHODS, IBip122ChainId } from '@/constants/Bitcoin';

type RequestEventArgs = Omit<
  SignClientTypes.EventArguments['session_request'],
  'verifyContext'
>;

export async function approveBitcoinRequest(requestEvent: RequestEventArgs) {
  const { params, id } = requestEvent;
  const { chainId, request } = params;
  const bip122ChainId = chainId as IBip122ChainId;

  const wallet = await getWallet();
  if (!wallet) {
    LogStore.error(
      'Bitcoin wallet not initialized',
      'BitcoinRequestHandler',
      'approveBitcoinRequest',
    );
    return formatJsonRpcError(id, 'Bitcoin wallet not initialized');
  }

  const account = wallet.getAddress(bip122ChainId);

  switch (request.method) {
    case BIP122_SIGNING_METHODS.BIP122_SIGN_MESSAGE:
      try {
        const result = await wallet.signMessage({
          message: request.params.message,
          address: request.params.address || account,
          protocol: request.params.protocol,
          chainId: bip122ChainId,
        });
        return formatJsonRpcResult(id, result);
      } catch (error: any) {
        LogStore.error(error.message, 'BitcoinRequestHandler', 'signMessage', {
          error: serializeError(error),
        });
        return formatJsonRpcError(id, error.message);
      }
    case BIP122_SIGNING_METHODS.BIP122_GET_ACCOUNT_ADDRESSES:
      try {
        const addresses = wallet.getAddresses(
          bip122ChainId,
          request.params?.intentions,
        );
        return formatJsonRpcResult(id, Array.from(addresses.values()));
      } catch (error: any) {
        LogStore.error(
          error.message,
          'BitcoinRequestHandler',
          'getAccountAddresses',
          { error: serializeError(error) },
        );
        return formatJsonRpcError(id, error.message);
      }
    case BIP122_SIGNING_METHODS.BIP122_SEND_TRANSACTION:
      try {
        const txid = await wallet.sendTransfer({
          account: request.params.account || account,
          recipientAddress: request.params.recipientAddress,
          amount: request.params.amount,
          changeAddress: request.params.changeAddress,
          memo: request.params.memo,
          chainId: bip122ChainId,
        });
        return formatJsonRpcResult(id, { txid });
      } catch (error: any) {
        LogStore.error(error.message, 'BitcoinRequestHandler', 'sendTransfer', {
          error: serializeError(error),
        });
        return formatJsonRpcError(id, error.message);
      }
    case BIP122_SIGNING_METHODS.BIP122_SIGN_PSBT:
      try {
        const result = await wallet.signPsbt({
          account: request.params.account || account,
          psbt: request.params.psbt,
          signInputs: request.params.signInputs,
          broadcast: request.params.broadcast ?? false,
          chainId: bip122ChainId,
        });
        return formatJsonRpcResult(id, result);
      } catch (error: any) {
        LogStore.error(error.message, 'BitcoinRequestHandler', 'signPsbt', {
          error: serializeError(error),
        });
        return formatJsonRpcError(id, error.message);
      }
    default:
      throw new Error(getSdkError('INVALID_METHOD').message);
  }
}

export function rejectBitcoinRequest(request: RequestEventArgs) {
  const { id } = request;
  return formatJsonRpcError(id, getSdkError('USER_REJECTED').message);
}
