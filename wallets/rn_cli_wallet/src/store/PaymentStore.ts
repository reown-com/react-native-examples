import { proxy, ref } from 'valtio';
import type {
  Action,
  ConfirmPaymentResponse,
  PaymentOptionsResponse,
  PaymentOption,
} from '@walletconnect/pay';
import { providers } from 'ethers';

import LogStore, { serializeError } from '@/store/LogStore';
import SettingsStore from '@/store/SettingsStore';
import { walletKit } from '@/utils/WalletKitUtil';
import { eip155Wallets } from '@/utils/EIP155WalletUtil';
import type { Step } from '@/utils/TypesUtil';
import {
  detectErrorType,
  getErrorMessage,
  formatAmount,
} from '@/modals/PaymentOptionsModal/utils';
import type { ErrorType } from '@/modals/PaymentOptionsModal/utils';
import { EIP155_SIGNING_METHODS } from '@/constants/Eip155';
import {
  ConfirmPaymentPollingTimeoutError,
  confirmPaymentWithPolling,
} from '@/utils/PaymentConfirmUtil';
import {
  estimateTransactionFee,
  sendTransactionWithFreshFees,
  waitForTransactionConfirmation,
} from '@/utils/PaymentTransactionUtil';
import {
  getPermit2Context,
  revokePermit2ApprovalForTesting,
} from '@/utils/Permit2Util';

interface PaymentState {
  paymentOptions: PaymentOptionsResponse | null;
  loadingMessage: string | null;
  errorMessage: string | null;
  step: Step;
  resultStatus: 'success' | 'error';
  resultMessage: string;
  resultErrorType: ErrorType | null;
  selectedOption: PaymentOption | null;
  paymentActions: Action[] | null;
  isLoadingActions: boolean;
  isEstimatingApprovalGas: boolean;
  actionsError: string | null;
  approvalGasEstimate: string | null;
  isRevokingPermit: boolean;
  collectDataCompletedIds: string[];
  expiresAt: number | null;
}

const PAY_EXPIRY_GUARD_MS = 10_000;
const POLL_CONFIRMATION_TIMEOUT_MESSAGE =
  'Payment confirmation is taking longer than expected. Please check the merchant status and try again.';
const FAILED_CONFIRMATION_MESSAGE = 'The payment could not be confirmed.';

function createInitialState(): PaymentState {
  return {
    paymentOptions: null,
    loadingMessage: null,
    errorMessage: null,
    step: 'loading',
    resultStatus: 'success',
    resultMessage: '',
    resultErrorType: null,
    selectedOption: null,
    paymentActions: null,
    isLoadingActions: false,
    isEstimatingApprovalGas: false,
    actionsError: null,
    approvalGasEstimate: null,
    isRevokingPermit: false,
    collectDataCompletedIds: [],
    expiresAt: null,
  };
}

const state = proxy<PaymentState>(createInitialState());
let expiryTimerId: ReturnType<typeof setTimeout> | null = null;
let paymentActionsRequestSeq = 0;

function isPaymentExpiredLocally(expiresAt: number | null): boolean {
  if (!expiresAt) return false;
  const expiresAtMs = expiresAt * 1000;
  return Date.now() + PAY_EXPIRY_GUARD_MS >= expiresAtMs;
}

function setPaymentResultFromConfirmStatus({
  confirmResult,
  selectedOption,
  paymentOptions,
}: {
  confirmResult: ConfirmPaymentResponse;
  selectedOption: PaymentOption;
  paymentOptions: PaymentOptionsResponse;
}): void {
  if (confirmResult.status === 'succeeded') {
    const amount = formatAmount(
      selectedOption.amount.value,
      selectedOption.amount.display.decimals,
      2,
    );
    PaymentStore.setResult({
      status: 'success',
      message: `You've paid ${amount} ${selectedOption.amount.display.assetSymbol} to ${paymentOptions.info?.merchant?.name}`,
    });
    return;
  }

  if (confirmResult.status === 'expired') {
    PaymentStore.setResult({
      status: 'error',
      errorType: 'expired',
      message: getErrorMessage('expired'),
    });
    return;
  }

  if ((confirmResult.status as string) === 'cancelled') {
    PaymentStore.setResult({
      status: 'error',
      errorType: 'cancelled',
      message: getErrorMessage('cancelled'),
    });
    return;
  }

  if (confirmResult.status === 'failed') {
    PaymentStore.setResult({
      status: 'error',
      errorType: 'generic',
      message: FAILED_CONFIRMATION_MESSAGE,
    });
    return;
  }

  LogStore.warn('Unhandled final payment status', 'PaymentStore', 'approvePayment', {
    status: confirmResult.status,
    isFinal: confirmResult.isFinal,
  });

  PaymentStore.setResult({
    status: 'error',
    errorType: 'generic',
    message: FAILED_CONFIRMATION_MESSAGE,
  });
}

const PaymentStore = {
  state,

  startPayment(params: {
    paymentOptions?: PaymentOptionsResponse;
    loadingMessage?: string;
    errorMessage?: string;
  }) {
    PaymentStore.clearExpiryTimer();
    Object.assign(state, createInitialState());
    if (params.paymentOptions) {
      state.paymentOptions = ref(params.paymentOptions);
    }
    state.loadingMessage = params.loadingMessage ?? null;
    state.errorMessage = params.errorMessage ?? null;
  },

  setPaymentOptions(options: PaymentOptionsResponse) {
    state.paymentOptions = ref(options);
    state.loadingMessage = null;
    state.errorMessage = null;
    state.resultErrorType = null;

    const expiresAt = options.info?.expiresAt;
    if (typeof expiresAt === 'number' && expiresAt > 0) {
      state.expiresAt = expiresAt;
      PaymentStore.startExpiryTimer(expiresAt);
    } else {
      PaymentStore.clearExpiryTimer();
      state.expiresAt = null;
    }
  },

  setError(errorMessage: string) {
    const errorType = detectErrorType(errorMessage);
    state.errorMessage = errorMessage;
    state.loadingMessage = null;
    state.isRevokingPermit = false;
    state.resultStatus = 'error';
    state.resultMessage = getErrorMessage(errorType, errorMessage);
    state.resultErrorType = errorType;
    state.step = 'result';
  },

  reset() {
    PaymentStore.clearExpiryTimer();
    Object.assign(state, createInitialState());
  },

  setStep(step: Step) {
    state.step = step;
  },

  setResult(payload: {
    status: 'success' | 'error';
    message: string;
    errorType?: ErrorType;
  }) {
    state.resultStatus = payload.status;
    state.resultMessage = payload.message;
    state.resultErrorType = payload.errorType ?? null;
    state.errorMessage = null;
    state.loadingMessage = null;
    state.isRevokingPermit = false;
    state.step = 'result';
  },

  selectOption(option: PaymentOption) {
    state.selectedOption = ref(option);
    state.paymentActions = null;
    state.actionsError = null;
    state.approvalGasEstimate = null;
    state.isEstimatingApprovalGas = false;
  },

  clearSelectedOption() {
    state.selectedOption = null;
    state.paymentActions = null;
    state.actionsError = null;
    state.approvalGasEstimate = null;
    state.isEstimatingApprovalGas = false;
    state.isRevokingPermit = false;
  },

  markCollectDataCompleted(optionId: string) {
    if (!state.collectDataCompletedIds.includes(optionId)) {
      state.collectDataCompletedIds.push(optionId);
    }
  },

  isCollectDataCompleted(optionId: string): boolean {
    return state.collectDataCompletedIds.includes(optionId);
  },

  setPaymentActions(actions: Action[]) {
    state.paymentActions = ref(actions);
    state.approvalGasEstimate = null;
    state.isEstimatingApprovalGas = false;
  },

  setLoadingActions(loading: boolean) {
    state.isLoadingActions = loading;
  },

  setActionsError(error: string | null) {
    state.actionsError = error;
  },

  async revokePermit2Approval() {
    if (state.isRevokingPermit) return;
    state.isRevokingPermit = true;

    try {
      await revokePermit2ApprovalForTesting({
        paymentActions: state.paymentActions,
        selectedOption: state.selectedOption,
        wallet: eip155Wallets[SettingsStore.state.eip155Address],
        sendTransaction: sendTransactionWithFreshFees,
      });
    } finally {
      state.isRevokingPermit = false;
    }
  },

  startExpiryTimer(expiresAt: number) {
    PaymentStore.clearExpiryTimer();
    const TWO_MINUTES_MS = 2 * 60 * 1000;
    const now = Date.now();
    const expiresAtMs = expiresAt * 1000;
    const warningTime = expiresAtMs - TWO_MINUTES_MS;
    const delay = warningTime - now;
    const interruptibleSteps: Step[] = [
      'selectOption',
      'review',
      'collectData',
      'infoExplainer',
    ];

    if (delay <= 0) {
      if (expiresAtMs > now && interruptibleSteps.includes(state.step)) {
        state.step = 'expiryWarning';
      }
      return;
    }

    expiryTimerId = setTimeout(() => {
      if (interruptibleSteps.includes(state.step)) {
        state.step = 'expiryWarning';
      }
    }, delay);
  },

  clearExpiryTimer() {
    if (expiryTimerId !== null) {
      clearTimeout(expiryTimerId);
      expiryTimerId = null;
    }
  },

  async fetchPaymentActions(option: PaymentOption) {
    const payClient = walletKit?.pay;
    if (!payClient || !state.paymentOptions) {
      LogStore.error(
        'Pay SDK not initialized',
        'PaymentStore',
        'fetchPaymentActions',
      );
      state.actionsError = 'Pay SDK not initialized';
      return;
    }

    state.isLoadingActions = true;
    state.actionsError = null;
    state.approvalGasEstimate = null;
    state.isEstimatingApprovalGas = false;
    const requestSeq = ++paymentActionsRequestSeq;

    const isStaleRequest = () =>
      requestSeq !== paymentActionsRequestSeq ||
      state.selectedOption?.id !== option.id;

    try {
      LogStore.log(
        'Getting required payment actions',
        'PaymentStore',
        'fetchPaymentActions',
        { optionId: option.id },
      );

      const actions = await payClient.getRequiredPaymentActions({
        paymentId: state.paymentOptions.paymentId,
        optionId: option.id,
      });

      LogStore.log(
        'Required actions received',
        'PaymentStore',
        'fetchPaymentActions',
        { actionsCount: actions.length },
      );

      if (isStaleRequest()) {
        LogStore.warn(
          'Skipping stale payment actions response',
          'PaymentStore',
          'fetchPaymentActions',
          { optionId: option.id },
        );
        return;
      }

      const permit2Context = getPermit2Context({
        paymentActions: actions,
        selectedOption: option,
      });
      state.paymentActions = ref(actions);
      state.isLoadingActions = false;

      LogStore.log('Resolved Permit2 context', 'PaymentStore', 'fetchPaymentActions', {
        optionId: option.id,
        requiresApproval: permit2Context.requiresApproval,
        hasRevokeTarget: !!permit2Context.revokeTarget,
      });

      if (permit2Context.approvalAction) {
        state.isEstimatingApprovalGas = true;
        try {
          const estimate = await estimateTransactionFee(permit2Context.approvalAction);
          if (!isStaleRequest()) {
            state.approvalGasEstimate = estimate;
          }
          LogStore.log(
            'Approval gas estimate resolved',
            'PaymentStore',
            'fetchPaymentActions',
            {
              optionId: option.id,
              chainId: permit2Context.approvalAction.walletRpc?.chainId,
              estimate,
            },
          );
        } catch (error) {
          LogStore.warn(
            'Failed to estimate approval gas fee',
            'PaymentStore',
            'fetchPaymentActions',
            {
              optionId: option.id,
              chainId: permit2Context.approvalAction.walletRpc?.chainId,
              error: serializeError(error),
            },
          );
        } finally {
          if (!isStaleRequest()) {
            state.isEstimatingApprovalGas = false;
          }
        }
      }
    } catch (error: any) {
      if (isStaleRequest()) {
        LogStore.warn(
          'Skipping stale payment actions error',
          'PaymentStore',
          'fetchPaymentActions',
          { optionId: option.id, error: error?.message },
        );
        return;
      }

      LogStore.error(
        'Error getting payment actions',
        'PaymentStore',
        'fetchPaymentActions',
        { error: error?.message },
      );
      const errorMessage = error?.message || 'Failed to get payment actions';
      const errorType = detectErrorType(errorMessage);
      state.resultStatus = 'error';
      state.resultMessage = getErrorMessage(errorType, errorMessage);
      state.resultErrorType = errorType;
      state.step = 'result';
    } finally {
      if (requestSeq === paymentActionsRequestSeq && state.isLoadingActions) {
        state.isLoadingActions = false;
      }
    }
  },

  async approvePayment() {
    if (state.step === 'confirming') {
      LogStore.warn(
        'Payment already in progress',
        'PaymentStore',
        'approvePayment',
      );
      return;
    }

    const {
      paymentActions,
      selectedOption,
      paymentOptions,
      expiresAt,
    } = state;
    if (!paymentActions?.length || !selectedOption || !paymentOptions) {
      LogStore.warn(
        'Cannot approve payment - missing required state',
        'PaymentStore',
        'approvePayment',
        {
          hasPaymentActions: !!paymentActions?.length,
          hasSelectedOption: !!selectedOption,
          hasPaymentData: !!paymentOptions,
        },
      );
      return;
    }

    if (isPaymentExpiredLocally(expiresAt)) {
      LogStore.warn(
        'Payment expired locally before approval',
        'PaymentStore',
        'approvePayment',
        {
          paymentId: paymentOptions.paymentId,
          expiresAt,
          now: Math.floor(Date.now() / 1000),
          guardMs: PAY_EXPIRY_GUARD_MS,
        },
      );
      PaymentStore.setResult({
        status: 'error',
        errorType: 'expired',
        message: getErrorMessage('expired'),
      });
      return;
    }

    state.step = 'confirming';
    state.actionsError = null;
    state.loadingMessage = null;

    try {
      const payClient = walletKit?.pay;
      if (!payClient) {
        throw new Error('Pay SDK not available');
      }

      const wallet = eip155Wallets[SettingsStore.state.eip155Address];
      if (!wallet) {
        throw new Error('Wallet not found for selected EIP155 account');
      }

      const tokenSymbol = selectedOption.amount.display.assetSymbol || 'token';
      const signatures: string[] = [];
      const totalActions = paymentActions.length;
      const permit2Context = getPermit2Context({
        paymentActions,
        selectedOption,
      });

      for (const [index, action] of paymentActions.entries()) {
        const stepLabel = `${index + 1}/${totalActions}`;
        const method = action.walletRpc?.method;

        if (!action.walletRpc) {
          throw new Error(`Payment action ${stepLabel} is missing walletRpc`);
        }

        if (
          permit2Context.approvalAction &&
          action === permit2Context.approvalAction
        ) {
          state.loadingMessage = `Setting up ${tokenSymbol} for the first time...`;
        } else if (
          method === EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA ||
          method === EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3 ||
          method === EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4
        ) {
          state.loadingMessage = 'Finalizing your payment...';
        }

        LogStore.log('Executing payment action', 'PaymentStore', 'approvePayment', {
          step: stepLabel,
          method,
        });

        const { params, chainId } = action.walletRpc;
        let parsedParams: unknown;
        try {
          parsedParams = typeof params === 'string' ? JSON.parse(params) : params;
        } catch (error) {
          throw new Error(
            `Failed to parse params for ${method} (${stepLabel}): ${error instanceof Error ? error.message : String(error)}`,
          );
        }

        if (!Array.isArray(parsedParams)) {
          throw new Error(
            `Invalid params for ${method} (${stepLabel}): expected array`,
          );
        }

        switch (method) {
          case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION: {
            const txPayload = parsedParams[0];
            if (!txPayload || typeof txPayload !== 'object') {
              throw new Error(`Invalid tx payload for ${method} (${stepLabel})`);
            }

            const tx = await sendTransactionWithFreshFees({
              chainId,
              baseTx: { ...(txPayload as providers.TransactionRequest) },
              wallet,
              logContext: 'approvePayment',
            });

            try {
              await waitForTransactionConfirmation(tx);
            } catch (error) {
              LogStore.error(
                'Action transaction confirmation failed',
                'PaymentStore',
                'approvePayment',
                {
                  chainId,
                  step: stepLabel,
                  txHash: tx.hash,
                  error: serializeError(error),
                },
              );
              throw new Error('Action transaction confirmation failed');
            }

            LogStore.log(
              'Action transaction confirmed',
              'PaymentStore',
              'approvePayment',
              { chainId, step: stepLabel, txHash: tx.hash },
            );
            break;
          }

          case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
          case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
          case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4: {
            let typedData: unknown = parsedParams[1];
            try {
              if (typeof typedData === 'string') typedData = JSON.parse(typedData);
            } catch (error) {
              throw new Error(
                `Failed to parse typed-data for ${method} (${stepLabel}): ${error instanceof Error ? error.message : String(error)}`,
              );
            }

            if (!typedData || typeof typedData !== 'object') {
              throw new Error(`Invalid typed-data for ${method} (${stepLabel})`);
            }

            const { domain, types, message: messageData } = typedData as {
              domain: Record<string, unknown>;
              types: Record<string, Array<Record<string, unknown>>>;
              message: Record<string, unknown>;
            };

            if (!types || typeof types !== 'object') {
              throw new Error(
                `Typed-data missing types for ${method} (${stepLabel})`,
              );
            }

            delete types.EIP712Domain;
            const signature = await wallet._signTypedData(
              domain,
              types,
              messageData,
            );
            signatures.push(signature);
            break;
          }

          default:
            throw new Error(`Unsupported wallet RPC method: ${method}`);
        }
      }

      LogStore.log('Confirming payment', 'PaymentStore', 'approvePayment', {
        signaturesCount: signatures.length,
      });

      const confirmResult = await confirmPaymentWithPolling({
        confirm: params => payClient.confirmPayment(params),
        params: {
          paymentId: paymentOptions.paymentId,
          optionId: selectedOption.id,
          signatures,
        },
        onPending: ({ attempt, response, nextPollMs, elapsedMs }) => {
          state.loadingMessage = 'Waiting for payment confirmation...';
          LogStore.log(
            'Payment confirmation pending',
            'PaymentStore',
            'approvePayment',
            {
              attempt,
              status: response.status,
              isFinal: response.isFinal,
              nextPollMs,
              elapsedMs,
            },
          );
        },
      });

      LogStore.log(
        'Payment confirmation result',
        'PaymentStore',
        'approvePayment',
        {
          status: confirmResult.status,
          isFinal: confirmResult.isFinal,
        },
      );

      setPaymentResultFromConfirmStatus({
        confirmResult,
        selectedOption,
        paymentOptions,
      });
    } catch (error: unknown) {
      LogStore.error(
        'Error executing payment actions',
        'PaymentStore',
        'approvePayment',
        { error: serializeError(error) },
      );

      if (error instanceof ConfirmPaymentPollingTimeoutError) {
        LogStore.warn(
          'Payment confirmation polling timed out',
          'PaymentStore',
          'approvePayment',
          {
            lastStatus: error.lastStatus,
            elapsedMs: error.elapsedMs,
          },
        );
        PaymentStore.setResult({
          status: 'error',
          errorType: 'generic',
          message: POLL_CONFIRMATION_TIMEOUT_MESSAGE,
        });
        return;
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to execute payment actions';
      const errorType = detectErrorType(errorMessage);
      PaymentStore.setResult({
        status: 'error',
        errorType,
        message: getErrorMessage(errorType, errorMessage),
      });
    }
  },
};

export default PaymentStore;
