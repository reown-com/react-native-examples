import type { Action, PaymentOption } from '@walletconnect/pay';
import { BigNumber, providers, utils } from 'ethers';
import Toast from 'react-native-toast-message';

import { EIP155_SIGNING_METHODS } from '@/constants/Eip155';
import LogStore, { serializeError } from '@/store/LogStore';
import type { TransactionWallet } from '@/utils/PaymentTransactionUtil';

const PERMIT2_ADDRESS = '0x000000000022D473030F116dDEE9F6B43aC78BA3';
const ERC20_APPROVE_INTERFACE = new utils.Interface([
  'function approve(address spender, uint256 amount)',
]);

export type Permit2RevokeTarget = {
  chainId: string;
  tokenAddress: string;
};

export type Permit2Context = {
  approvalAction: Action | null;
  requiresApproval: boolean;
  revokeTarget: Permit2RevokeTarget | null;
};

type SendTransaction = (params: {
  chainId: string;
  baseTx: {
    to: string;
    data: string;
    value: BigNumber;
  };
  wallet: TransactionWallet;
  logContext: string;
}) => Promise<providers.TransactionResponse>;

function parseWalletRpcParams(params: unknown): unknown[] | null {
  if (Array.isArray(params)) {
    return params;
  }
  if (typeof params !== 'string') {
    return null;
  }

  try {
    const parsed = JSON.parse(params);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

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

function getPermit2ApprovalAction(
  actions: readonly Action[] | null,
): Action | null {
  for (const action of actions || []) {
    if (action.walletRpc?.method !== EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION) {
      continue;
    }

    const parsedParams = parseWalletRpcParams(action.walletRpc.params);
    const tx = parsedParams?.[0];
    if (!tx || typeof tx !== 'object') {
      continue;
    }

    const to = (tx as { to?: unknown }).to;
    const data = (tx as { data?: unknown }).data;
    if (!isValidEvmAddress(to) || typeof data !== 'string' || !data.startsWith('0x')) {
      continue;
    }

    try {
      const decoded = ERC20_APPROVE_INTERFACE.decodeFunctionData('approve', data);
      const spender = decoded.spender as string;
      if (spender.toLowerCase() === PERMIT2_ADDRESS.toLowerCase()) {
        return action;
      }
    } catch {
      // Not an ERC-20 approve payload, continue scanning actions.
    }
  }

  return null;
}

function getRevokeTargetFromSelectedOption(
  selectedOption: PaymentOption | null,
): Permit2RevokeTarget | null {
  const selectedOptionAmountUnit = (
    selectedOption as { amount?: { unit?: unknown } } | null
  )?.amount?.unit;
  const caip19 = getUnitCaip19(selectedOptionAmountUnit);
  if (!caip19) {
    return null;
  }

  return parseErc20Caip19(caip19);
}

function getRevokeTargetFromTypedData(
  paymentActions: readonly Action[] | null,
): Permit2RevokeTarget | null {
  const signAction = paymentActions?.find(action =>
    [
      EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA,
      EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3,
      EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4,
    ].includes(action.walletRpc?.method as string),
  );

  if (!signAction?.walletRpc) {
    return null;
  }

  try {
    const params = parseWalletRpcParams(signAction.walletRpc.params);
    if (!params) {
      return null;
    }

    let typedData: unknown = params[1];
    if (typeof typedData === 'string') {
      typedData = JSON.parse(typedData);
    }

    const tokenCandidates = [
      (typedData as { message?: { permitted?: { token?: unknown } } })?.message
        ?.permitted?.token,
      (typedData as { message?: { details?: { token?: unknown } } })?.message
        ?.details?.token,
      (typedData as { message?: { permit?: { details?: { token?: unknown } } } })
        ?.message?.permit?.details?.token,
      (
        typedData as {
          message?: { permit?: { details?: Array<{ token?: unknown }> } };
        }
      )?.message?.permit?.details?.[0]?.token,
    ];

    const tokenAddress = tokenCandidates.find(isValidEvmAddress);
    if (!tokenAddress) {
      return null;
    }

    const actionChainId = signAction.walletRpc.chainId;
    if (actionChainId?.startsWith('eip155:')) {
      return { chainId: actionChainId, tokenAddress };
    }

    const domainChainId = (
      typedData as { domain?: { chainId?: string | number } }
    )?.domain?.chainId;
    if (domainChainId != null && /^\d+$/.test(String(domainChainId))) {
      return { chainId: `eip155:${domainChainId}`, tokenAddress };
    }
  } catch (error) {
    LogStore.warn(
      'Failed to parse typed data for Permit2 revoke target',
      'Permit2Util',
      'getRevokeTargetFromTypedData',
      {
        method: signAction.walletRpc.method,
        chainId: signAction.walletRpc.chainId,
        error: serializeError(error),
      },
    );
  }

  return null;
}

export function getPermit2Context({
  paymentActions,
  selectedOption,
}: {
  paymentActions: readonly Action[] | null;
  selectedOption: PaymentOption | null;
}): Permit2Context {
  const approvalAction = getPermit2ApprovalAction(paymentActions);
  const revokeTarget =
    getRevokeTargetFromSelectedOption(selectedOption) ||
    getRevokeTargetFromTypedData(paymentActions);

  return {
    approvalAction,
    requiresApproval: !!approvalAction,
    revokeTarget,
  };
}

export async function revokePermit2ApprovalForTesting({
  paymentActions,
  selectedOption,
  wallet,
  sendTransaction,
}: {
  paymentActions: readonly Action[] | null;
  selectedOption: PaymentOption | null;
  wallet: TransactionWallet | null | undefined;
  sendTransaction: SendTransaction;
}) {
  const context = getPermit2Context({
    paymentActions,
    selectedOption,
  });

  if (!context.revokeTarget) {
    LogStore.warn(
      'Unable to derive Permit2 revoke target from selected option/actions',
      'Permit2Util',
      'revokePermit2ApprovalForTesting',
      {
        selectedOptionId: selectedOption?.id,
        selectedOptionAmountUnit: (
          selectedOption as { amount?: { unit?: unknown } } | null
        )?.amount?.unit,
        paymentActionMethods:
          paymentActions?.map(action => action.walletRpc?.method).filter(Boolean) ||
          [],
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
      chainId: context.revokeTarget.chainId,
      baseTx: {
        to: context.revokeTarget.tokenAddress,
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
      'Permit2Util',
      'revokePermit2ApprovalForTesting',
      {
        chainId: context.revokeTarget.chainId,
        tokenAddress: context.revokeTarget.tokenAddress,
        txHash: tx.hash,
      },
    );

    Toast.show({
      type: 'success',
      text1: 'Permit2 approval revoked',
    });
  } catch (error) {
    LogStore.error(
      'Failed to revoke Permit2 approval',
      'Permit2Util',
      'revokePermit2ApprovalForTesting',
      {
        ...context.revokeTarget,
        error: serializeError(error),
      },
    );

    Toast.show({
      type: 'error',
      text1: 'Revoke failed',
      text2: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
