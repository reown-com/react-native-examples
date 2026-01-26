import { useCallback, useReducer, useEffect } from 'react';
import { useSnapshot } from 'valtio';

import LogStore from '@/store/LogStore';
import ModalStore from '@/store/ModalStore';
import SettingsStore from '@/store/SettingsStore';
import { walletKit } from '@/utils/WalletKitUtil';
import { eip155Wallets } from '@/utils/EIP155WalletUtil';
import type {
  PaymentOptionsResponse,
  PaymentOption,
  CollectDataFieldResult,
} from '@walletconnect/pay';

import { LoadingView } from './LoadingView';
import { IntroView } from './IntroView';
import { CollectDataView } from './CollectDataView';
import { ConfirmPaymentView } from './ConfirmPaymentView';
import { ResultView } from './ResultView';
import { ViewWrapper } from './ViewWrapper';
import {
  formatAmount,
  formatDateInput,
  isValidDateOfBirth,
  validateRequiredFields,
  detectErrorType,
  getErrorMessage,
} from './utils';
import { paymentModalReducer, initialState } from './reducer';

export default function PaymentOptionsModal() {
  const { data } = useSnapshot(ModalStore.state);
  const paymentData = data?.paymentOptions as
    | PaymentOptionsResponse
    | undefined;
  const initialError = data?.errorMessage;

  const [state, dispatch] = useReducer(paymentModalReducer, initialState);

  // Derived values
  const hasCollectData =
    paymentData?.collectData && paymentData.collectData.fields.length > 0;

  // Transition from loading to intro when data is available
  useEffect(() => {
    if (state.step === 'loading') {
      if (initialError) {
        const errorType = detectErrorType(initialError);
        dispatch({
          type: 'SET_RESULT',
          payload: {
            status: 'error',
            message: getErrorMessage(errorType, initialError),
            errorType,
          },
        });
        dispatch({ type: 'SET_STEP', payload: 'result' });
      } else if (paymentData) {
        // Check for empty options BEFORE going to intro
        if (!paymentData.options || paymentData.options.length === 0) {
          dispatch({
            type: 'SET_RESULT',
            payload: {
              status: 'error',
              errorType: 'insufficient_funds',
              message: getErrorMessage('insufficient_funds'),
            },
          });
          dispatch({ type: 'SET_STEP', payload: 'result' });
        } else {
          dispatch({ type: 'SET_STEP', payload: 'intro' });
        }
      }
    }
  }, [state.step, paymentData, initialError]);

  const onClose = useCallback(() => {
    dispatch({ type: 'RESET' });
    ModalStore.close();
  }, []);

  const goBack = useCallback(() => {
    switch (state.step) {
      case 'collectData':
        dispatch({ type: 'SET_STEP', payload: 'intro' });
        break;
      case 'confirm':
        dispatch({ type: 'CLEAR_SELECTED_OPTION' });
        dispatch({
          type: 'SET_STEP',
          payload: hasCollectData ? 'collectData' : 'intro',
        });
        break;
      default:
        onClose();
    }
  }, [state.step, hasCollectData, onClose]);

  const updateCollectedField = useCallback(
    (fieldId: string, value: string, fieldType?: string) => {
      const formattedValue =
        fieldType === 'date' ? formatDateInput(value) : value;
      dispatch({
        type: 'UPDATE_FIELD',
        payload: { fieldId, value: formattedValue },
      });
    },
    [],
  );

  const fetchPaymentActions = useCallback(
    async (option: PaymentOption) => {
      const payClient = walletKit?.pay;
      if (!payClient || !paymentData) {
        dispatch({
          type: 'SET_ACTIONS_ERROR',
          payload: 'Pay SDK not initialized',
        });
        return;
      }

      dispatch({ type: 'SET_LOADING_ACTIONS', payload: true });
      dispatch({ type: 'SET_ACTIONS_ERROR', payload: null });

      try {
        LogStore.log(
          'Getting required payment actions',
          'PaymentOptionsModal',
          'fetchPaymentActions',
          {
            optionId: option.id,
          },
        );
        const actions = await payClient.getRequiredPaymentActions({
          paymentId: paymentData.paymentId,
          optionId: option.id,
        });
        LogStore.log(
          'Required actions received',
          'PaymentOptionsModal',
          'fetchPaymentActions',
          {
            actionsCount: actions.length,
          },
        );
        dispatch({ type: 'SET_PAYMENT_ACTIONS', payload: actions });
      } catch (error: any) {
        LogStore.error(
          'Error getting payment actions',
          'PaymentOptionsModal',
          'fetchPaymentActions',
          {
            error: error?.message,
          },
        );
        dispatch({
          type: 'SET_ACTIONS_ERROR',
          payload: error?.message || 'Failed to get payment actions',
        });
      } finally {
        dispatch({ type: 'SET_LOADING_ACTIONS', payload: false });
      }
    },
    [paymentData],
  );

  // Navigation handlers
  const handleIntroNext = useCallback(() => {
    const options = paymentData?.options || [];

    // Fallback check (main check is in useEffect)
    if (options.length === 0) {
      dispatch({
        type: 'SET_RESULT',
        payload: {
          status: 'error',
          errorType: 'insufficient_funds',
          message: getErrorMessage('insufficient_funds'),
        },
      });
      dispatch({ type: 'SET_STEP', payload: 'result' });
      return;
    }

    dispatch({
      type: 'SET_STEP',
      payload: hasCollectData ? 'collectData' : 'confirm',
    });
  }, [hasCollectData, paymentData?.options]);

  const handleCollectDataNext = useCallback(() => {
    if (!paymentData?.collectData) {
      dispatch({ type: 'SET_STEP', payload: 'confirm' });
      return;
    }

    const fieldErrors: Record<string, string> = {};

    // Check for missing required fields
    paymentData.collectData.fields.forEach(field => {
      if (!state.collectedData[field.id]?.trim()) {
        fieldErrors[field.id] = 'Required';
      }
    });

    // Check for invalid date fields
    paymentData.collectData.fields
      .filter(
        field =>
          field.fieldType === 'date' &&
          state.collectedData[field.id]?.trim() &&
          !isValidDateOfBirth(state.collectedData[field.id]),
      )
      .forEach(field => {
        fieldErrors[field.id] = 'Invalid date format (YYYY-MM-DD)';
      });

    if (Object.keys(fieldErrors).length > 0) {
      dispatch({ type: 'SET_FIELD_ERRORS', payload: fieldErrors });
      return;
    }

    dispatch({ type: 'SET_FIELD_ERRORS', payload: {} });
    dispatch({ type: 'SET_STEP', payload: 'confirm' });
  }, [paymentData, state.collectedData]);

  const onSelectOption = useCallback(
    (option: PaymentOption) => {
      dispatch({ type: 'SELECT_OPTION', payload: option });
      fetchPaymentActions(option);
    },
    [fetchPaymentActions],
  );

  // Auto-select first payment option when entering confirm step
  useEffect(() => {
    if (state.step === 'confirm') {
      const options = paymentData?.options || [];

      // Fallback check (main check is in useEffect)
      if (options.length === 0) {
        dispatch({
          type: 'SET_RESULT',
          payload: {
            status: 'error',
            errorType: 'insufficient_funds',
            message: getErrorMessage('insufficient_funds'),
          },
        });
        dispatch({ type: 'SET_STEP', payload: 'result' });
        return;
      }

      if (!state.selectedOption) {
        onSelectOption(options[0]);
      }
    }
  }, [state.step, paymentData?.options, state.selectedOption, onSelectOption]);

  const onApprovePayment = useCallback(async () => {
    if (
      !state.paymentActions ||
      state.paymentActions.length === 0 ||
      !state.selectedOption ||
      !paymentData
    ) {
      return;
    }

    // Defensive validation for payment flows
    if (paymentData.collectData) {
      const missingFields = validateRequiredFields(
        paymentData.collectData.fields,
        state.collectedData,
      );
      if (missingFields.length > 0) {
        dispatch({
          type: 'SET_ACTIONS_ERROR',
          payload: `Please fill in required fields: ${missingFields.join(
            ', ',
          )}`,
        });
        return;
      }
    }

    dispatch({ type: 'SET_STEP', payload: 'confirming' });
    dispatch({ type: 'SET_ACTIONS_ERROR', payload: null });

    try {
      const payClient = walletKit?.pay;
      const wallet = eip155Wallets[SettingsStore.state.eip155Address];
      const signatures: string[] = [];

      for (const [index, action] of state.paymentActions.entries()) {
        if (action.walletRpc) {
          try {
            const { method, params } = action.walletRpc;
            const parsedParams = JSON.parse(params);

            LogStore.log(
              'Signing action',
              'PaymentOptionsModal',
              'onApprovePayment',
              { method },
            );

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
                'PaymentOptionsModal',
                'onApprovePayment',
              );
              signatures.push(signature);
            } else {
              LogStore.warn(
                `Unsupported wallet RPC method: ${method}`,
                'PaymentOptionsModal',
                'onApprovePayment',
              );
              throw new Error(`Unsupported signature method: ${method}`);
            }
          } catch (error: any) {
            LogStore.error(
              `Error signing action ${index}`,
              'PaymentOptionsModal',
              'onApprovePayment',
              {
                error: error?.message,
              },
            );
            throw new Error(
              `Failed to sign action ${index + 1}: ${
                error?.message || 'Unknown error'
              }`,
            );
          }
        }
      }

      const collectedDataResults: CollectDataFieldResult[] =
        paymentData.collectData
          ? paymentData.collectData.fields
              .filter(field => state.collectedData[field.id]?.trim())
              .map(field => ({
                id: field.id,
                value: state.collectedData[field.id].trim(),
              }))
          : [];

      if (payClient) {
        LogStore.log(
          'Confirming payment',
          'PaymentOptionsModal',
          'onApprovePayment',
          {
            signaturesCount: signatures.length,
            hasCollectedData: collectedDataResults.length > 0,
          },
        );

        const confirmResult = await payClient.confirmPayment({
          paymentId: paymentData.paymentId,
          optionId: state.selectedOption.id,
          signatures,
          collectedData:
            collectedDataResults.length > 0 ? collectedDataResults : undefined,
        });

        LogStore.log(
          'Payment confirmation result',
          'PaymentOptionsModal',
          'onApprovePayment',
          { status: confirmResult?.status },
        );

        // Handle missing response
        if (!confirmResult) {
          throw new Error('Payment confirmation failed - no response received');
        }

        // Handle expired payment from confirmPayment response
        if (confirmResult.status === 'expired') {
          dispatch({
            type: 'SET_RESULT',
            payload: {
              status: 'error',
              errorType: 'expired',
              message: getErrorMessage('expired'),
            },
          });
          dispatch({ type: 'SET_STEP', payload: 'result' });
          return;
        }
      }

      const amount = formatAmount(
        state.selectedOption.amount.value,
        state.selectedOption.amount.display.decimals,
        2,
      );
      dispatch({
        type: 'SET_RESULT',
        payload: {
          status: 'success',
          message: `You've paid ${amount} ${state.selectedOption.amount.display.assetSymbol} to ${paymentData.info?.merchant?.name}`,
        },
      });
      dispatch({ type: 'SET_STEP', payload: 'result' });
    } catch (error: any) {
      LogStore.error(
        'Error signing payment',
        'PaymentOptionsModal',
        'onApprovePayment',
        {
          error: error?.message,
        },
      );
      const errorMessage = error?.message || 'Failed to sign payment';
      const errorType = detectErrorType(errorMessage);
      dispatch({
        type: 'SET_RESULT',
        payload: {
          status: 'error',
          errorType,
          message: getErrorMessage(errorType, errorMessage),
        },
      });
      dispatch({ type: 'SET_STEP', payload: 'result' });
    }
  }, [
    state.paymentActions,
    state.selectedOption,
    state.collectedData,
    paymentData,
  ]);

  const renderContent = useCallback(() => {
    switch (state.step) {
      case 'loading':
        return (
          <LoadingView
            message={data?.loadingMessage || 'Preparing your payment...'}
          />
        );

      case 'intro':
        return (
          <IntroView info={paymentData?.info} onContinue={handleIntroNext} />
        );

      case 'collectData':
        return (
          <CollectDataView
            collectData={paymentData!.collectData!}
            collectedData={state.collectedData}
            fieldErrors={state.fieldErrors}
            onUpdateField={updateCollectedField}
            onContinue={handleCollectDataNext}
          />
        );

      case 'confirm':
        return (
          <ConfirmPaymentView
            info={paymentData?.info}
            options={paymentData?.options || []}
            selectedOption={state.selectedOption}
            isLoadingActions={state.isLoadingActions}
            isSigningPayment={false}
            error={state.actionsError}
            onSelectOption={onSelectOption}
            onApprove={onApprovePayment}
          />
        );

      case 'confirming':
        return <LoadingView message="Confirming your payment..." />;

      case 'result':
        return (
          <ResultView
            status={state.resultStatus}
            errorType={state.resultErrorType}
            message={state.resultMessage}
            onClose={onClose}
          />
        );

      default:
        return <LoadingView message="Loading..." />;
    }
  }, [
    state.step,
    state.collectedData,
    state.fieldErrors,
    state.selectedOption,
    state.isLoadingActions,
    state.actionsError,
    state.resultStatus,
    state.resultErrorType,
    state.resultMessage,
    data?.loadingMessage,
    paymentData,
    handleIntroNext,
    updateCollectedField,
    handleCollectDataNext,
    onSelectOption,
    onApprovePayment,
    onClose,
  ]);

  return (
    <ViewWrapper
      step={state.step}
      hasCollectData={hasCollectData}
      showBackButton={
        !['intro', 'loading', 'confirming', 'result'].includes(state.step)
      }
      onBack={goBack}
      onClose={onClose}
    >
      {renderContent()}
    </ViewWrapper>
  );
}
