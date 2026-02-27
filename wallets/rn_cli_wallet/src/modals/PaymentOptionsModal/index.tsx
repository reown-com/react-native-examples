import { useCallback, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useSnapshot } from 'valtio';

import LogStore from '@/store/LogStore';
import ModalStore from '@/store/ModalStore';
import PaymentStore from '@/store/PaymentStore';
import type { PaymentOption } from '@walletconnect/pay';
import type { PaymentOptionWithCollectData } from '@/utils/TypesUtil';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/Button';
import { BorderRadius } from '@/utils/ThemeUtil';
import QuestionMark from '@/assets/QuestionMark';

import { LoadingView } from './LoadingView';
import { CollectDataWebView } from './CollectDataWebView';
import { SelectOptionView } from './SelectOptionView';
import { ReviewPaymentView } from './ReviewPaymentView';
import { InfoExplainerView } from './InfoExplainerView';
import { ResultView } from './ResultView';
import { ViewWrapper } from './ViewWrapper';
import { detectErrorType, getErrorMessage } from './utils';

export default function PaymentOptionsModal() {
  const snap = useSnapshot(PaymentStore.state);
  const Theme = useTheme();

  const selectedOptionCollectDataUrl = (
    snap.selectedOption as PaymentOptionWithCollectData | null
  )?.collectData?.url;

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
        if (
          !snap.paymentOptions.options ||
          snap.paymentOptions.options.length === 0
        ) {
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
          const options = snap.paymentOptions.options;
          const singleOptionWithoutCollectData =
            options.length === 1 &&
            !(options[0] as PaymentOptionWithCollectData).collectData?.url;

          if (singleOptionWithoutCollectData) {
            PaymentStore.selectOption(options[0] as PaymentOption);
            PaymentStore.fetchPaymentActions(options[0] as PaymentOption);
            PaymentStore.setStep('review');
          } else {
            PaymentStore.setStep('selectOption');
          }
        }
      }
    }
  }, [snap.step, snap.paymentOptions, snap.errorMessage]);

  const handleWebViewComplete = useCallback(() => {
    const { selectedOption } = PaymentStore.state;
    if (selectedOption) {
      PaymentStore.markCollectDataCompleted(selectedOption.id);
    }
    PaymentStore.setStep('review');
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
      case 'infoExplainer':
        PaymentStore.setStep('selectOption');
        break;
      case 'collectData':
        PaymentStore.setStep('selectOption');
        break;
      case 'review':
        PaymentStore.setStep('selectOption');
        break;
      case 'selectOption':
        onClose();
        break;
      default:
        onClose();
    }
  }, [onClose]);

  const onSelectOption = useCallback((option: PaymentOption) => {
    PaymentStore.selectOption(option);
    PaymentStore.fetchPaymentActions(option);
  }, []);

  const handleContinue = useCallback(() => {
    const { selectedOption, collectDataCompletedIds } = PaymentStore.state;
    if (!selectedOption) return;

    const option = selectedOption as PaymentOptionWithCollectData;
    const needsCollectData = !!option.collectData?.url;
    const alreadyCompleted = collectDataCompletedIds.includes(option.id);

    if (needsCollectData && !alreadyCompleted) {
      PaymentStore.setStep('collectData');
    } else {
      PaymentStore.setStep('review');
    }
  }, []);

  useEffect(() => {
    if (snap.step === 'selectOption') {
      const options = snap.paymentOptions?.options || [];

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
  }, [
    snap.step,
    snap.paymentOptions?.options,
    snap.selectedOption,
    onSelectOption,
  ]);

  const renderContent = useCallback(() => {
    switch (snap.step) {
      case 'loading':
        return (
          <LoadingView
            message={snap.loadingMessage || 'Preparing your payment...'}
          />
        );

      case 'infoExplainer':
        return (
          <InfoExplainerView
            onDismiss={() => PaymentStore.setStep('selectOption')}
          />
        );

      case 'collectData':
        return (
          <CollectDataWebView
            url={selectedOptionCollectDataUrl!}
            onComplete={handleWebViewComplete}
            onError={handleWebViewError}
          />
        );

      case 'selectOption':
        return (
          <SelectOptionView
            info={snap.paymentOptions?.info}
            options={(snap.paymentOptions?.options || []) as PaymentOption[]}
            selectedOption={snap.selectedOption as PaymentOption | null}
            isLoadingActions={snap.isLoadingActions}
            isSigningPayment={false}
            onSelectOption={onSelectOption}
            onContinue={handleContinue}
            collectDataCompletedIds={snap.collectDataCompletedIds as string[]}
          />
        );

      case 'review':
        return snap.selectedOption ? (
          <ReviewPaymentView
            info={snap.paymentOptions?.info}
            selectedOption={snap.selectedOption as PaymentOption}
            isLoadingActions={snap.isLoadingActions}
            isSigningPayment={false}
            onPay={() => PaymentStore.approvePayment()}
          />
        ) : null;

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
    snap.resultStatus,
    snap.resultErrorType,
    snap.resultMessage,
    snap.loadingMessage,
    snap.paymentOptions,
    snap.collectDataCompletedIds,
    selectedOptionCollectDataUrl,
    handleWebViewComplete,
    handleWebViewError,
    handleContinue,
    onSelectOption,
    onClose,
  ]);

  const paymentOptionsCount = snap.paymentOptions?.options?.length ?? 0;
  const showBackButton =
    snap.step === 'collectData' ||
    snap.step === 'infoExplainer' ||
    (snap.step === 'review' && paymentOptionsCount > 1);
  const isWebView =
    snap.step === 'collectData' && !!selectedOptionCollectDataUrl;

  const headerLeftContent =
    snap.step === 'selectOption' ? (
      <Button
        onPress={() => PaymentStore.setStep('infoExplainer')}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={[
          styles.questionButton,
          { borderColor: Theme['border-secondary'] },
        ]}
      >
        <QuestionMark width={20} height={20} fill={Theme['text-primary']} />
      </Button>
    ) : undefined;

  return (
    <ViewWrapper
      step={snap.step}
      isWebView={isWebView}
      showBackButton={showBackButton}
      onBack={goBack}
      onClose={onClose}
      headerLeftContent={headerLeftContent}
    >
      {renderContent()}
    </ViewWrapper>
  );
}

const styles = StyleSheet.create({
  questionButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius[3],
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
