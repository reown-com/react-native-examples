import { useCallback, useEffect } from 'react';
import { useSnapshot } from 'valtio';

import LogStore from '@/store/LogStore';
import ModalStore from '@/store/ModalStore';
import PaymentStore from '@/store/PaymentStore';
import type { PaymentOption } from '@walletconnect/pay';

import { LoadingView } from './LoadingView';
import { CollectDataWebView } from './CollectDataWebView';
import { ConfirmPaymentView } from './ConfirmPaymentView';
import { ResultView } from './ResultView';
import { ViewWrapper } from './ViewWrapper';
import { detectErrorType, getErrorMessage } from './utils';

export default function PaymentOptionsModal() {
  const snap = useSnapshot(PaymentStore.state);

  const collectDataUrl = snap.paymentOptions?.collectData?.url;

  // Transition from loading to the next step when data is available
  useEffect(() => {
    if (snap.step === 'loading') {
      if (snap.errorMessage) {
        LogStore.error(
          'Payment failed with initial error',
          'PaymentOptionsModal',
          'useEffect',
          { error: snap.errorMessage },
        );
        const errorType = detectErrorType(snap.errorMessage);
        PaymentStore.setResult({
          status: 'error',
          message: getErrorMessage(errorType, snap.errorMessage),
          errorType,
        });
      } else if (snap.paymentOptions) {
        // Check for empty options
        if (!snap.paymentOptions.options || snap.paymentOptions.options.length === 0) {
          LogStore.warn(
            'No payment options available',
            'PaymentOptionsModal',
            'useEffect',
            { paymentId: snap.paymentOptions.paymentId },
          );
          PaymentStore.setResult({
            status: 'error',
            errorType: 'insufficient_funds',
            message: getErrorMessage('insufficient_funds'),
          });
        } else {
          if (collectDataUrl) {
            // Collect data via WebView (intro is handled inside the WebView)
            PaymentStore.setStep('collectData');
          } else {
            // No collect data needed, go directly to confirm
            PaymentStore.setStep('confirm');
          }
        }
      }
    }
  }, [snap.step, snap.paymentOptions, snap.errorMessage, collectDataUrl]);

  const handleWebViewComplete = useCallback(() => {
    PaymentStore.setDataCollectionSuccess(true);
    PaymentStore.setStep('confirm');
  }, []);

  const handleWebViewError = useCallback((error: string) => {
    const errorType = detectErrorType(error);
    PaymentStore.setResult({
      status: 'error',
      message: getErrorMessage(errorType, error),
      errorType,
    });
  }, []);

  const onClose = useCallback(() => {
    PaymentStore.reset();
    ModalStore.close();
  }, []);

  const goBack = useCallback(() => {
    const { step } = PaymentStore.state;
    switch (step) {
      case 'confirm':
        PaymentStore.clearSelectedOption();
        if ((PaymentStore.state.paymentOptions?.collectData as { url?: string } | undefined)?.url) {
          PaymentStore.setStep('collectData');
        } else {
          onClose();
        }
        break;
      default:
        onClose();
    }
  }, [onClose]);

  const onSelectOption = useCallback((option: PaymentOption) => {
    PaymentStore.selectOption(option);
    PaymentStore.fetchPaymentActions(option);
  }, []);

  // Auto-select first payment option when entering confirm step
  useEffect(() => {
    if (snap.step === 'confirm') {
      const options = snap.paymentOptions?.options || [];

      // Fallback check (main check is in useEffect)
      if (options.length === 0) {
        PaymentStore.setResult({
          status: 'error',
          errorType: 'insufficient_funds',
          message: getErrorMessage('insufficient_funds'),
        });
        return;
      }

      if (!snap.selectedOption) {
        onSelectOption(options[0] as PaymentOption);
      }
    }
  }, [snap.step, snap.paymentOptions?.options, snap.selectedOption, onSelectOption]);

  const renderContent = useCallback(() => {
    switch (snap.step) {
      case 'loading':
        return (
          <LoadingView
            message={snap.loadingMessage || 'Preparing your payment...'}
          />
        );

      case 'collectData':
        return (
          <CollectDataWebView
            url={collectDataUrl!}
            onComplete={handleWebViewComplete}
            onError={handleWebViewError}
          />
        );

      case 'confirm':
        return (
          <ConfirmPaymentView
            info={snap.paymentOptions?.info}
            options={(snap.paymentOptions?.options || []) as PaymentOption[]}
            selectedOption={snap.selectedOption as PaymentOption | null}
            isLoadingActions={snap.isLoadingActions}
            isSigningPayment={false}
            error={snap.actionsError}
            onSelectOption={onSelectOption}
            onApprove={PaymentStore.approvePayment}
          />
        );

      case 'confirming':
        return <LoadingView message="Confirming your payment..." />;

      case 'result':
        return (
          <ResultView
            status={snap.resultStatus}
            errorType={snap.resultErrorType}
            message={snap.resultMessage}
            onClose={onClose}
          />
        );

      default:
        return <LoadingView message="Loading..." />;
    }
  }, [
    snap.step,
    snap.selectedOption,
    snap.isLoadingActions,
    snap.actionsError,
    snap.resultStatus,
    snap.resultErrorType,
    snap.resultMessage,
    snap.loadingMessage,
    snap.paymentOptions,
    collectDataUrl,
    handleWebViewComplete,
    handleWebViewError,
    onSelectOption,
    onClose,
  ]);

  // Show back button when there's a previous step to go back to
  const showBackButton = snap.step === 'confirm' && !!collectDataUrl;
  const isWebView = snap.step === 'collectData' && !!collectDataUrl;

  return (
    <ViewWrapper
      step={snap.step}
      isWebView={isWebView}
      showBackButton={showBackButton}
      onBack={goBack}
      onClose={onClose}
    >
      {renderContent()}
    </ViewWrapper>
  );
}
