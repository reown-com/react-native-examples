import {providers} from 'ethers';
import {formatJsonRpcError, formatJsonRpcResult} from '@json-rpc-tools/utils';
import {SignClientTypes} from '@walletconnect/types';
import {getSdkError} from '@walletconnect/utils';

import {eip155Addresses, eip155Wallets} from '@/utils/EIP155WalletUtil';
import {
  getSignParamsMessage,
  getSignTypedDataParamsData,
  getWalletAddressFromParams,
} from '@/utils/HelperUtil';
import {EIP155_SIGNING_METHODS, PresetsUtil} from './PresetsUtil';
import {parseChainId} from './HelperUtil';
type RequestEventArgs = Omit<
  SignClientTypes.EventArguments['session_request'],
  'verifyContext'
>;
export async function approveEIP155Request(
  requestEvent: RequestEventArgs,
  additionalTransactions: any[] = [],
) {
  const {params, id} = requestEvent;
  const {chainId, request} = params;
  const wallet =
    eip155Wallets[getWalletAddressFromParams(eip155Addresses, params)];

  switch (request.method) {
    case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
    case EIP155_SIGNING_METHODS.ETH_SIGN:
      try {
        const message = getSignParamsMessage(request.params);

        if (!message) {
          throw new Error('Message is empty');
        }
        const signedMessage = await wallet.signMessage(message);
        return formatJsonRpcResult(id, signedMessage);
      } catch (error: any) {
        console.error(error);
        console.log(error.message);
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
        console.error(error);
        console.log(error.message);
        return formatJsonRpcError(id, error.message);
      }

    case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
      try {
        let hash = '';
        if (additionalTransactions.length > 0) {
          console.log(
            'starting processing transactions: ',
            additionalTransactions.length,
          );
          for (const transaction of additionalTransactions) {
            const chain = transaction.chainId
              ? parseChainId(transaction.chainId)
              : parseChainId(chainId);
            const chainData = PresetsUtil.getChainData(chain);
            const provider = new providers.JsonRpcProvider(chainData.rpcUrl);
            const connectedWallet = wallet.connect(provider);
            console.log('sending transaction...', chain, transaction);
            // await new Promise(resolve => setTimeout(resolve, 10_000));
            delete transaction.chainId;
            const result = await connectedWallet.sendTransaction({
              ...transaction,
              nonce: await provider.getTransactionCount(transaction.from),
            });
            console.log('transaction sent - hash:', result.hash);
            console.log('waiting for transaction to be mined...');
            const receipt = await waitForTransaction(result.hash, provider);
            console.log('transaction mined:', receipt);
            hash = result.hash;
          }
        } else {
          const chainData = PresetsUtil.getChainData(parseChainId(chainId));
          const provider = new providers.JsonRpcProvider(chainData.rpcUrl);
          const sendTransaction = request.params[0];
          const connectedWallet = wallet.connect(provider);
          const result = await connectedWallet.sendTransaction(sendTransaction);
          hash = result.hash;
        }

        return formatJsonRpcResult(id, hash);
      } catch (error: any) {
        console.error(error);
        console.log(error.message);
        return formatJsonRpcError(id, error.message);
      }

    case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
      try {
        const signTransaction = request.params[0];
        const signature = await wallet.signTransaction(signTransaction);
        return formatJsonRpcResult(id, signature);
      } catch (error: any) {
        console.error(error);
        console.log(error.message);
        return formatJsonRpcError(id, error.message);
      }

    default:
      throw new Error(getSdkError('INVALID_METHOD').message);
  }
}

export function rejectEIP155Request(request: RequestEventArgs) {
  const {id} = request;

  return formatJsonRpcError(id, getSdkError('USER_REJECTED').message);
}

async function waitForTransaction(
  txHash: string,
  provider: providers.JsonRpcProvider,
) {
  let receipt = null;

  // Loop until the transaction is mined (receipt is not null)
  while (receipt === null) {
    // Wait 2 seconds before checking again
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Get the receipt for the transaction hash
      receipt = await provider.getTransactionReceipt(txHash);
    } catch (error) {
      console.error('Error fetching receipt:', error);
    }
  }

  return receipt;
}
