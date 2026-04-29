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
import { storage } from '@/utils/storage';
import type { OptionFeeEstimateStatus, Step } from '@/utils/TypesUtil';
import {
  detectErrorType,
  getErrorMessage,
  formatAmount,
} from '@/modals/PaymentOptionsModal/utils';
import type { ErrorType } from '@/modals/PaymentOptionsModal/utils';
import { EIP155_SIGNING_METHODS } from '@/constants/Eip155';
import {
  estimateTransactionFee,
  sendTransactionWithFreshFees,
  waitForTransactionConfirmation,
} from '@/utils/PaymentTransactionUtil';
import type { TransactionFeeEstimate } from '@/utils/PaymentTransactionUtil';
import { getApprovalAction } from '@/utils/PaymentUtil';

interface PaymentState {
  paymentOptions: PaymentOptionsResponse | null;
  loadingMessage: string | null;
  loadingNote: string | null;
  errorMessage: string | null;
  step: Step;
  previousStep: Step | null;
  resultStatus: 'success' | 'error';
  resultMessage: string;
  resultErrorType: ErrorType | null;
  selectedOption: PaymentOption | null;
  optionFeeEstimatesById: Record<string, TransactionFeeEstimate | null>;
  optionFeeEstimateStatusById: Record<string, OptionFeeEstimateStatus>;
  collectDataCompletedIds: string[];
  expiresAt: number | null;
}

const PAY_EXPIRY_GUARD_MS = 10_000;
const FAILED_CONFIRMATION_MESSAGE = 'The payment could not be confirmed.';
const PAY_LAST_TOKEN_UNIT_KEY = 'PAY_LAST_TOKEN_UNIT';
const DEFAULT_FIAT_CURRENCY = 'USD';

function createInitialState(): PaymentState {
  return {
    paymentOptions: null,
    loadingMessage: null,
    loadingNote: null,
    errorMessage: null,
    step: 'loading',
    previousStep: null,
    resultStatus: 'success',
    resultMessage: '',
    resultErrorType: null,
    selectedOption: null,
    optionFeeEstimatesById: {},
    optionFeeEstimateStatusById: {},
    collectDataCompletedIds: [],
    expiresAt: null,
  };
}

const state = proxy<PaymentState>(createInitialState());
let expiryTimerId: ReturnType<typeof setTimeout> | null = null;
let paymentActionsRequestSeq = 0;
let optionFeeEstimateRequestSeq = 0;

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

  LogStore.warn(
    'Unhandled final payment status',
    'PaymentStore',
    'approvePayment',
    {
      status: confirmResult.status,
      isFinal: confirmResult.isFinal,
    },
  );

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
    paymentActionsRequestSeq += 1;
    optionFeeEstimateRequestSeq += 1;
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
    state.loadingNote = null;
    state.errorMessage = null;
    state.resultErrorType = null;
    state.optionFeeEstimatesById = {};
    state.optionFeeEstimateStatusById = {};

    const expiresAt = options.info?.expiresAt;
    if (typeof expiresAt === 'number' && expiresAt > 0) {
      state.expiresAt = expiresAt;
      PaymentStore.startExpiryTimer(expiresAt);
    } else {
      PaymentStore.clearExpiryTimer();
      state.expiresAt = null;
    }

    PaymentStore.preloadOptionFeeEstimates(options);
  },

  setError(errorMessage: string) {
    const errorType = detectErrorType(errorMessage);
    state.errorMessage = errorMessage;
    state.loadingMessage = null;
    state.loadingNote = null;
    state.resultStatus = 'error';
    state.resultMessage = getErrorMessage(errorType, errorMessage);
    state.resultErrorType = errorType;
    state.step = 'result';
  },

  reset() {
    PaymentStore.clearExpiryTimer();
    paymentActionsRequestSeq += 1;
    optionFeeEstimateRequestSeq += 1;
    Object.assign(state, createInitialState());
  },

  setStep(step: Step) {
    if (state.step === step) {
      return;
    }
    state.previousStep = state.step;
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
    state.loadingNote = null;
    state.step = 'result';
  },

  selectOption(option: PaymentOption) {
    state.selectedOption = ref(option);
  },

  clearSelectedOption() {
    state.selectedOption = null;
  },

  markCollectDataCompleted(optionId: string) {
    if (!state.collectDataCompletedIds.includes(optionId)) {
      state.collectDataCompletedIds.push(optionId);
    }
  },

  isCollectDataCompleted(optionId: string): boolean {
    return state.collectDataCompletedIds.includes(optionId);
  },

  getOptionFeeEstimate(optionId: string): TransactionFeeEstimate | null {
    return state.optionFeeEstimatesById[optionId] ?? null;
  },

  getOptionFeeEstimateStatus(optionId: string): OptionFeeEstimateStatus {
    return state.optionFeeEstimateStatusById[optionId] ?? 'idle';
  },

  async loadLastPaidTokenUnit(): Promise<string | undefined> {
    return storage.getItem<string>(PAY_LAST_TOKEN_UNIT_KEY);
  },

  async saveLastPaidTokenUnit(unit: string): Promise<void> {
    await storage.setItem(PAY_LAST_TOKEN_UNIT_KEY, unit);
  },

  async clearLastPaidTokenUnit(): Promise<void> {
    await storage.removeItem(PAY_LAST_TOKEN_UNIT_KEY);
  },

  findPreferredOption(
    options: readonly PaymentOption[],
    tokenUnit?: string,
  ): PaymentOption | null {
    if (!tokenUnit) return null;
    return options.find(option => option.amount.unit === tokenUnit) ?? null;
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
      'gasFee',
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

  async preloadOptionFeeEstimates(options: PaymentOptionsResponse) {
    const requestSeq = ++optionFeeEstimateRequestSeq;
    const paymentId = options.paymentId;

    await Promise.allSettled(
      options.options.map(async option => {
        const approvalAction = getApprovalAction(option.actions);

        if (!approvalAction) {
          state.optionFeeEstimateStatusById[option.id] = 'ready';
          return;
        }

        state.optionFeeEstimateStatusById[option.id] = 'loading';

        try {
          const estimate = await estimateTransactionFee(approvalAction, {
            currency:
              options.info?.amount?.display?.assetSymbol ??
              DEFAULT_FIAT_CURRENCY,
          });

          if (
            requestSeq !== optionFeeEstimateRequestSeq ||
            state.paymentOptions?.paymentId !== paymentId
          ) {
            return;
          }

          if (estimate) {
            state.optionFeeEstimatesById[option.id] = estimate;
          }
          state.optionFeeEstimateStatusById[option.id] = 'ready';

          LogStore.log(
            'Option approval gas estimate resolved',
            'PaymentStore',
            'preloadOptionFeeEstimates',
            {
              optionId: option.id,
              chainId: approvalAction.walletRpc?.chainId,
              estimate,
            },
          );
        } catch (error) {
          if (
            requestSeq !== optionFeeEstimateRequestSeq ||
            state.paymentOptions?.paymentId !== paymentId
          ) {
            return;
          }

          state.optionFeeEstimateStatusById[option.id] = 'error';

          LogStore.warn(
            'Failed to estimate option approval gas fee',
            'PaymentStore',
            'preloadOptionFeeEstimates',
            {
              optionId: option.id,
              chainId: approvalAction.walletRpc?.chainId,
              error: serializeError(error),
            },
          );
        }
      }),
    );
  },

  async fetchPaymentActions(option: PaymentOption): Promise<Action[]> {
    const payClient = walletKit?.pay;
    if (!payClient || !state.paymentOptions) {
      const errorMessage = 'Pay SDK not initialized';
      LogStore.error(errorMessage, 'PaymentStore', 'fetchPaymentActions');
      throw new Error(errorMessage);
    }

    const requestSeq = ++paymentActionsRequestSeq;

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

      if (
        requestSeq !== paymentActionsRequestSeq ||
        state.selectedOption?.id !== option.id
      ) {
        LogStore.warn(
          'Skipping stale payment actions response',
          'PaymentStore',
          'fetchPaymentActions',
          { optionId: option.id },
        );
        return [];
      }

      return actions;
    } catch (error: any) {
      if (
        requestSeq !== paymentActionsRequestSeq ||
        state.selectedOption?.id !== option.id
      ) {
        LogStore.warn(
          'Skipping stale payment actions error',
          'PaymentStore',
          'fetchPaymentActions',
          { optionId: option.id, error: error?.message },
        );
        return [];
      }

      LogStore.error(
        'Error getting payment actions',
        'PaymentStore',
        'fetchPaymentActions',
        { error: error?.message },
      );
      const errorMessage = error?.message || 'Failed to get payment actions';
      throw error instanceof Error ? error : new Error(errorMessage);
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

    const { selectedOption, paymentOptions, expiresAt } = state;
    if (!selectedOption || !paymentOptions) {
      LogStore.warn(
        'Cannot approve payment - missing required state',
        'PaymentStore',
        'approvePayment',
        {
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

    const tokenSymbol = selectedOption.amount.display.assetSymbol || 'token';
    const selectedOptionApprovalAction = getApprovalAction(
      selectedOption.actions,
    );

    state.step = 'confirming';
    if (selectedOptionApprovalAction) {
      state.loadingMessage = `Setting up ${tokenSymbol} for one-time setup...`;
      state.loadingNote = `Future ${tokenSymbol} payments will be instant`;
    } else {
      state.loadingMessage = null;
      state.loadingNote = null;
    }

    try {
      const payClient = walletKit?.pay;
      if (!payClient) {
        throw new Error('Pay SDK not available');
      }

      const wallet = eip155Wallets[SettingsStore.state.eip155Address];
      if (!wallet) {
        throw new Error('Wallet not found for selected EIP155 account');
      }

      const signatures: string[] = [];
      const paymentActions = await PaymentStore.fetchPaymentActions(
        selectedOption,
      );
      if (!paymentActions.length) {
        throw new Error('No payment actions returned for the selected option');
      }
      const totalActions = paymentActions.length;
      const approvalAction = getApprovalAction(paymentActions);

      for (const [index, action] of paymentActions.entries()) {
        const stepLabel = `${index + 1}/${totalActions}`;
        const method = action.walletRpc?.method;

        if (!action.walletRpc) {
          throw new Error(`Payment action ${stepLabel} is missing walletRpc`);
        }

        if (approvalAction && action === approvalAction) {
          state.loadingMessage = `Setting up ${tokenSymbol} for one-time setup...`;
          state.loadingNote = `Future ${tokenSymbol} payments will be instant`;
        } else {
          state.loadingMessage = null;
          state.loadingNote = null;
        }

        LogStore.log(
          'Executing payment action',
          'PaymentStore',
          'approvePayment',
          {
            step: stepLabel,
            method,
          },
        );

        const { params, chainId } = action.walletRpc;
        let parsedParams: unknown;
        try {
          parsedParams =
            typeof params === 'string' ? JSON.parse(params) : params;
        } catch (error) {
          throw new Error(
            `Failed to parse params for ${method} (${stepLabel}): ${
              error instanceof Error ? error.message : String(error)
            }`,
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
              throw new Error(
                `Invalid tx payload for ${method} (${stepLabel})`,
              );
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
              if (typeof typedData === 'string')
                typedData = JSON.parse(typedData);
            } catch (error) {
              throw new Error(
                `Failed to parse typed-data for ${method} (${stepLabel}): ${
                  error instanceof Error ? error.message : String(error)
                }`,
              );
            }

            if (!typedData || typeof typedData !== 'object') {
              throw new Error(
                `Invalid typed-data for ${method} (${stepLabel})`,
              );
            }

            const {
              domain,
              types,
              message: messageData,
            } = typedData as {
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

      const confirmResult = await payClient.confirmPayment({
        paymentId: paymentOptions.paymentId,
        optionId: selectedOption.id,
        signatures,
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

      if (confirmResult.status === 'succeeded') {
        try {
          await PaymentStore.saveLastPaidTokenUnit(selectedOption.amount.unit);
        } catch (error) {
          LogStore.warn(
            'Failed to persist last paid token',
            'PaymentStore',
            'approvePayment',
            { error: serializeError(error) },
          );
        }
      }
    } catch (error: unknown) {
      LogStore.error(
        'Error executing payment actions',
        'PaymentStore',
        'approvePayment',
        { error: serializeError(error) },
      );

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
