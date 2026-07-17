import { JsonRpcProvider } from 'ethers';
import { formatJsonRpcError, formatJsonRpcResult } from '@json-rpc-tools/utils';
import { SignClientTypes } from '@walletconnect/types';
import { getSdkError } from '@walletconnect/utils';

import LogStore, { serializeError } from '@/store/LogStore';
import { eip155Addresses, eip155Wallets } from '@/utils/EIP155WalletUtil';
import {
  getSignParamsMessage,
  getSignTypedDataParamsData,
  getWalletAddressFromParams,
} from '@/utils/HelperUtil';
import { PresetsUtil } from './PresetsUtil';
import { EIP155_SIGNING_METHODS } from '@/constants/Eip155';
type RequestEventArgs = Omit<
  SignClientTypes.EventArguments['session_request'],
  'verifyContext'
>;
export async function approveEIP155Request(requestEvent: RequestEventArgs) {
  const { params, id } = requestEvent;
  const { chainId, request } = params;
  const wallet =
    eip155Wallets[getWalletAddressFromParams(eip155Addresses, params)];

  switch (request.method) {
    // eth_sign signs arbitrary opaque bytes (no message prefix) — a phishing
    // vector — so reject it and steer dApps to personal_sign.
    case EIP155_SIGNING_METHODS.ETH_SIGN:
      LogStore.warn(
        'Rejected eth_sign request (disabled for security)',
        'EIP155RequestHandler',
        'ethSign',
      );
      return formatJsonRpcError(
        id,
        'eth_sign is disabled for security reasons. Use personal_sign instead.',
      );

    case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
      try {
        const message = getSignParamsMessage(request.params);

        if (!message) {
          throw new Error('Message is empty');
        }
        const signedMessage = await wallet.signMessage(message);
        return formatJsonRpcResult(id, signedMessage);
      } catch (error: any) {
        LogStore.error(error.message, 'EIP155RequestHandler', 'personalSign', {
          error: serializeError(error),
        });
        return formatJsonRpcError(id, error.message);
      }

    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4:
      try {
        const {
          domain,
          types,
          message: data,
        } = getSignTypedDataParamsData(request.params);
        // https://github.com/ethers-io/ethers.js/issues/687#issuecomment-714069471
        delete types.EIP712Domain;
        const signedData = await wallet._signTypedData(domain, types, data);
        return formatJsonRpcResult(id, signedData);
      } catch (error: any) {
        LogStore.error(error.message, 'EIP155RequestHandler', 'signTypedData', {
          error: serializeError(error),
        });
        return formatJsonRpcError(id, error.message);
      }

    case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
      try {
        const chainData = PresetsUtil.getChainDataById(chainId);
        const provider = new JsonRpcProvider(chainData?.rpcUrl);
        const sendTransaction = request.params[0];
        const connectedWallet = wallet.connect(provider);
        const { hash } = await connectedWallet.sendTransaction(sendTransaction);
        return formatJsonRpcResult(id, hash);
      } catch (error: any) {
        LogStore.error(
          error.message,
          'EIP155RequestHandler',
          'sendTransaction',
          {
            error: serializeError(error),
          },
        );
        return formatJsonRpcError(id, error.message);
      }

    case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
      try {
        const signTransaction = request.params[0];
        const signature = await wallet.signTransaction(signTransaction);
        return formatJsonRpcResult(id, signature);
      } catch (error: any) {
        LogStore.error(
          error.message,
          'EIP155RequestHandler',
          'signTransaction',
          {
            error: serializeError(error),
          },
        );
        return formatJsonRpcError(id, error.message);
      }

    default:
      throw new Error(getSdkError('INVALID_METHOD').message);
  }
}

export function rejectEIP155Request(request: RequestEventArgs) {
  const { id } = request;

  return formatJsonRpcError(id, getSdkError('USER_REJECTED').message);
}
