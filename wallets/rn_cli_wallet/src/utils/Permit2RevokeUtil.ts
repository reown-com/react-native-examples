import type { Action, PaymentOption } from '@walletconnect/pay';
import { BigNumber, providers, utils } from 'ethers';
import Toast from 'react-native-toast-message';

import { EIP155_SIGNING_METHODS } from '@/constants/Eip155';
import LogStore, { serializeError } from '@/store/LogStore';

const PERMIT2_ADDRESS = '0x000000000022D473030F116dDEE9F6B43aC78BA3';
const ERC20_APPROVE_INTERFACE = new utils.Interface([
  'function approve(address spender, uint256 amount)',
]);

type TransactionWallet = {
  connect: (
    provider: providers.JsonRpcProvider,
  ) =>
    | providers.JsonRpcSigner
    | {
        sendTransaction: (
          tx: providers.TransactionRequest,
        ) => Promise<providers.TransactionResponse>;
      };
};

type SendTransaction = (params: {
  chainId: string;
  baseTx: providers.TransactionRequest;
  wallet: TransactionWallet;
  logContext: string;
}) => Promise<providers.TransactionResponse>;

function isValidEvmAddress(value: unknown): value is string {
  return typeof value === 'string' && /^0x[a-fA-F0-9]{40}$/.test(value);
}

function parseErc20Caip19(
  caip19: string,
): { chainId: string; tokenAddress: string } | null {
  const match = caip19
    .trim()
    .match(/^(?:caip19\/)?(eip155:\d+)\/erc20:(0x[a-fA-F0-9]{40})$/);
  if (!match) return null;
  return { chainId: match[1], tokenAddress: match[2] };
}

function getUnitCaip19(unit: unknown): string | null {
  if (typeof unit === 'string') {
    return unit;
  }
  if (!unit || typeof unit !== 'object') {
    return null;
  }

  const maybeUnit = unit as { Caip19?: unknown; caip19?: unknown };
  if (typeof maybeUnit.Caip19 === 'string') {
    return maybeUnit.Caip19;
  }
  if (typeof maybeUnit.caip19 === 'string') {
    return maybeUnit.caip19;
  }
  return null;
}

function getPermit2RevokeTarget(
  paymentActions: Action[] | null,
  selectedOption: PaymentOption | null,
): { chainId: string; tokenAddress: string } | null {
  const approvalAction = paymentActions?.find(
    a => a.walletRpc?.method === EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION,
  );
  if (approvalAction?.walletRpc) {
    try {
      const params =
        typeof approvalAction.walletRpc.params === 'string'
          ? JSON.parse(approvalAction.walletRpc.params)
          : approvalAction.walletRpc.params;
      const to = params?.[0]?.to;
      if (isValidEvmAddress(to)) {
        return {
          chainId: approvalAction.walletRpc.chainId,
          tokenAddress: to,
        };
      }
    } catch {}
  }

  const selectedOptionAmountUnit = (
    selectedOption as { amount?: { unit?: unknown } } | null
  )?.amount?.unit;
  const caip19 = getUnitCaip19(selectedOptionAmountUnit);
  if (caip19) {
    const parsed = parseErc20Caip19(caip19);
    if (parsed) {
      return parsed;
    }
  }

  const signAction = paymentActions?.find(a =>
    [
      EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA,
      EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3,
      EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4,
    ].includes(a.walletRpc?.method as string),
  );
  if (signAction?.walletRpc) {
    try {
      const params =
        typeof signAction.walletRpc.params === 'string'
          ? JSON.parse(signAction.walletRpc.params)
          : signAction.walletRpc.params;
      let typedData = params?.[1];
      if (typeof typedData === 'string') {
        typedData = JSON.parse(typedData);
      }

      const tokenCandidates = [
        typedData?.message?.permitted?.token,
        typedData?.message?.details?.token,
        typedData?.message?.permit?.details?.token,
        typedData?.message?.permit?.details?.[0]?.token,
      ];
      const tokenAddress = tokenCandidates.find(isValidEvmAddress);
      if (tokenAddress) {
        const actionChainId = signAction.walletRpc.chainId;
        if (actionChainId?.startsWith('eip155:')) {
          return { chainId: actionChainId, tokenAddress };
        }
        const domainChainId = typedData?.domain?.chainId;
        if (domainChainId != null && /^\d+$/.test(String(domainChainId))) {
          return { chainId: `eip155:${domainChainId}`, tokenAddress };
        }
      }
    } catch {}
  }

  return null;
}

export async function revokePermit2ApprovalForTesting({
  paymentActions,
  selectedOption,
  wallet,
  sendTransaction,
}: {
  paymentActions: Action[] | null;
  selectedOption: PaymentOption | null;
  wallet: TransactionWallet | null | undefined;
  sendTransaction: SendTransaction;
}) {
  const target = getPermit2RevokeTarget(paymentActions, selectedOption);
  if (!target) {
    LogStore.warn(
      'Unable to derive Permit2 revoke target from selected option/actions',
      'Permit2RevokeUtil',
      'revokePermit2ApprovalForTesting',
      {
        selectedOptionId: selectedOption?.id,
        selectedOptionAmountUnit: (
          selectedOption as { amount?: { unit?: unknown } } | null
        )?.amount?.unit,
        paymentActionMethods:
          paymentActions?.map(a => a.walletRpc?.method).filter(Boolean) || [],
      },
    );

    Toast.show({
      type: 'error',
      text1: 'Unable to revoke approval',
      text2: 'This payment option is not an ERC-20 token.',
    });
    return;
  }

  if (!wallet) {
    Toast.show({
      type: 'error',
      text1: 'Unable to revoke approval',
      text2: 'Wallet not found.',
    });
    return;
  }

  try {
    const tx = await sendTransaction({
      chainId: target.chainId,
      baseTx: {
        to: target.tokenAddress,
        data: ERC20_APPROVE_INTERFACE.encodeFunctionData('approve', [
          PERMIT2_ADDRESS,
          0,
        ]),
        value: BigNumber.from(0),
      },
      wallet,
      logContext: 'revokePermit2ApprovalForTesting',
    });

    await tx.wait();
    LogStore.log(
      'Permit2 approval revoked',
      'Permit2RevokeUtil',
      'revokePermit2ApprovalForTesting',
      { chainId: target.chainId, tokenAddress: target.tokenAddress, txHash: tx.hash },
    );
    Toast.show({ type: 'success', text1: 'Permit2 approval revoked' });
  } catch (error) {
    LogStore.error(
      'Failed to revoke Permit2 approval',
      'Permit2RevokeUtil',
      'revokePermit2ApprovalForTesting',
      { ...target, error: serializeError(error) },
    );
    Toast.show({
      type: 'error',
      text1: 'Revoke failed',
      text2: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
