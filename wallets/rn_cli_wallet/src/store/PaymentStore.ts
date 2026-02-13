import { proxy, ref } from 'valtio';
import type {
  PaymentOptionsResponse,
  PaymentOption,
} from '@walletconnect/pay';

import LogStore from '@/store/LogStore';
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

/**
 * Types
 */
interface PaymentState {
  // Flow-level data (persists across modal open/close)
  paymentOptions: PaymentOptionsResponse | null;
  loadingMessage: string | null;
  errorMessage: string | null;
  dataCollectionSuccess: boolean;

  // Step navigation
  step: Step;

  // Result state
  resultStatus: 'success' | 'error';
  resultMessage: string;
  resultErrorType: ErrorType | null;

  // Payment state
  selectedOption: PaymentOption | null;
  paymentActions: any[] | null;
  isLoadingActions: boolean;
  actionsError: string | null;
}

/**
 * Initial State
 */
const initialState: PaymentState = {
  paymentOptions: null,
  loadingMessage: null,
  errorMessage: null,
  dataCollectionSuccess: false,

  step: 'loading',
  resultStatus: 'success',
  resultMessage: '',
  resultErrorType: null,

  selectedOption: null,
  paymentActions: null,
  isLoadingActions: false,
  actionsError: null,
};

/**
 * State
 */
const state = proxy<PaymentState>({ ...initialState });

/**
 * Store / Actions
 */
const PaymentStore = {
  state,

  // --- Flow lifecycle ---

  startPayment(params: {
    paymentOptions?: PaymentOptionsResponse;
    loadingMessage?: string;
    errorMessage?: string;
  }) {
    Object.assign(state, { ...initialState });

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
  },

  setError(errorMessage: string) {
    const errorType = detectErrorType(errorMessage);
    state.errorMessage = errorMessage;
    state.loadingMessage = null;
    state.resultStatus = 'error';
    state.resultMessage = getErrorMessage(errorType, errorMessage);
    state.resultErrorType = errorType;
    state.step = 'result';
  },

  setDataCollectionSuccess(success: boolean) {
    state.dataCollectionSuccess = success;
    state.errorMessage = null;
  },

  reset() {
    Object.assign(state, { ...initialState });
  },

  // --- Navigation ---

  setStep(step: Step) {
    state.step = step;
  },

  // --- Result ---

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
    state.step = 'result';
  },

  // --- Payment option selection ---

  selectOption(option: PaymentOption) {
    state.selectedOption = ref(option);
  },

  clearSelectedOption() {
    state.selectedOption = null;
    state.paymentActions = null;
    state.actionsError = null;
  },

  setPaymentActions(actions: any[]) {
    state.paymentActions = ref(actions);
  },

  setLoadingActions(loading: boolean) {
    state.isLoadingActions = loading;
  },

  setActionsError(error: string | null) {
    state.actionsError = error;
  },

  // --- Business logic ---

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
      state.paymentActions = ref(actions);
    } catch (error: any) {
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
      state.isLoadingActions = false;
    }
  },

  async approvePayment() {
    const { paymentActions, selectedOption, paymentOptions } = state;

    if (
      !paymentActions ||
      paymentActions.length === 0 ||
      !selectedOption ||
      !paymentOptions
    ) {
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

    state.step = 'confirming';
    state.actionsError = null;

    try {
      const payClient = walletKit?.pay;
      if (!payClient) {
        LogStore.error(
          'Pay client not available for confirmation',
          'PaymentStore',
          'approvePayment',
        );
        throw new Error('Pay SDK not available');
      }

      const wallet = eip155Wallets[SettingsStore.state.eip155Address];
      const signatures: string[] = [];

      for (const [index, action] of paymentActions.entries()) {
        if (action.walletRpc) {
          try {
            const { method, params } = action.walletRpc;
            const parsedParams = JSON.parse(params);

            LogStore.log('Signing action', 'PaymentStore', 'approvePayment', {
              method,
            });

            if (
              method === 'eth_signTypedData_v4' ||
              method === 'eth_signTypedData_v3' ||
              method === 'eth_signTypedData'
            ) {
              const typedData = JSON.parse(parsedParams[1]);
              const { domain, types, message: messageData } = typedData;
              delete types.EIP712Domain;
              const signature = await wallet._signTypedData(
                domain,
                types,
                messageData,
              );
              LogStore.log(
                'Signature received',
                'PaymentStore',
                'approvePayment',
              );
              signatures.push(signature);
            } else {
              LogStore.warn(
                `Unsupported wallet RPC method: ${method}`,
                'PaymentStore',
                'approvePayment',
              );
              throw new Error(`Unsupported signature method: ${method}`);
            }
          } catch (error: any) {
            LogStore.error(
              `Error signing action ${index}`,
              'PaymentStore',
              'approvePayment',
              { error: error?.message },
            );
            throw new Error(
              `Failed to sign action ${index + 1}: ${error?.message || 'Unknown error'}`,
            );
          }
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
        { status: confirmResult?.status },
      );

      if (!confirmResult) {
        throw new Error('Payment confirmation failed - no response received');
      }

      if (confirmResult.status === 'expired') {
        LogStore.warn('Payment expired', 'PaymentStore', 'approvePayment', {
          paymentId: paymentOptions.paymentId,
        });
        state.resultStatus = 'error';
        state.resultErrorType = 'expired';
        state.resultMessage = getErrorMessage('expired');
        state.step = 'result';
        return;
      }

      const amount = formatAmount(
        selectedOption.amount.value,
        selectedOption.amount.display.decimals,
        2,
      );
      state.resultStatus = 'success';
      state.resultMessage = `You've paid ${amount} ${selectedOption.amount.display.assetSymbol} to ${paymentOptions.info?.merchant?.name}`;
      state.step = 'result';
    } catch (error: any) {
      LogStore.error(
        'Error signing payment',
        'PaymentStore',
        'approvePayment',
        { error: error?.message },
      );
      const errorMessage = error?.message || 'Failed to sign payment';
      const errorType = detectErrorType(errorMessage);
      state.resultStatus = 'error';
      state.resultErrorType = errorType;
      state.resultMessage = getErrorMessage(errorType, errorMessage);
      state.step = 'result';
    }
  },
};

export default PaymentStore;
