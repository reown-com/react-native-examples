import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useSnapshot } from 'valtio';

import LogStore from '@/store/LogStore';
import ModalStore from '@/store/ModalStore';
import PaymentStore from '@/store/PaymentStore';
import type { PaymentOption } from '@walletconnect/pay';
import type { PaymentOptionWithCollectData } from '@/utils/TypesUtil';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { BorderRadius, Spacing } from '@/utils/ThemeUtil';

import { LoadingView } from './LoadingView';
import { CollectDataWebView } from './CollectDataWebView';
import { ConfirmPaymentView } from './ConfirmPaymentView';
import { InfoExplainerView } from './InfoExplainerView';
import { ResultView } from './ResultView';
import { ViewWrapper } from './ViewWrapper';
import { detectErrorType, getErrorMessage } from './utils';

export default function PaymentOptionsModal() {
  const snap = useSnapshot(PaymentStore.state);
  const Theme = useTheme();
  const [showInfoExplainer, setShowInfoExplainer] = useState(false);

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
          PaymentStore.setStep('confirm');
        }
      }
    }
  }, [snap.step, snap.paymentOptions, snap.errorMessage]);

  const handleWebViewComplete = useCallback(() => {
    const { selectedOption } = PaymentStore.state;
    if (selectedOption) {
      PaymentStore.markCollectDataCompleted(selectedOption.id);
    }
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
      case 'collectData':
        PaymentStore.setStep('confirm');
        break;
      case 'confirm':
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

  const handleConfirmOrNext = useCallback(() => {
    const { selectedOption, collectDataCompletedIds } = PaymentStore.state;
    if (!selectedOption) return;

    const option = selectedOption as PaymentOptionWithCollectData;
    const needsCollectData = !!option.collectData?.url;
    const alreadyCompleted = collectDataCompletedIds.includes(option.id);

    if (needsCollectData && !alreadyCompleted) {
      PaymentStore.setStep('collectData');
    } else {
      PaymentStore.approvePayment();
    }
  }, []);

  useEffect(() => {
    if (snap.step === 'confirm') {
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
  }, [snap.step, snap.paymentOptions?.options, snap.selectedOption, onSelectOption]);

  const selectedNeedsCollectData = !!(
    snap.selectedOption &&
    (snap.selectedOption as PaymentOptionWithCollectData).collectData?.url &&
    !snap.collectDataCompletedIds.includes(snap.selectedOption.id)
  );

  const renderContent = useCallback(() => {
    if (showInfoExplainer) {
      return <InfoExplainerView onDismiss={() => setShowInfoExplainer(false)} />;
    }

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
            url={selectedOptionCollectDataUrl!}
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
            onApprove={handleConfirmOrNext}
            showNextButton={selectedNeedsCollectData}
            collectDataCompletedIds={snap.collectDataCompletedIds as string[]}
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
    snap.collectDataCompletedIds,
    selectedOptionCollectDataUrl,
    selectedNeedsCollectData,
    showInfoExplainer,
    handleWebViewComplete,
    handleWebViewError,
    handleConfirmOrNext,
    onSelectOption,
    onClose,
  ]);

  const showBackButton = snap.step === 'collectData';
  const isWebView = snap.step === 'collectData' && !!selectedOptionCollectDataUrl;

  const headerLeftContent =
    snap.step === 'confirm' && selectedNeedsCollectData && !showInfoExplainer ? (
      <Button
        onPress={() => setShowInfoExplainer(true)}
        style={[
          styles.infoButton,
          { borderColor: Theme['border-secondary'] },
        ]}
      >
        <Text variant="sm-500" color="text-primary">
          Why info required?
        </Text>
      </Button>
    ) : undefined;

  return (
    <ViewWrapper
      step={showInfoExplainer ? 'confirm' : snap.step}
      isWebView={isWebView}
      showBackButton={showBackButton}
      onBack={goBack}
      onClose={showInfoExplainer ? () => setShowInfoExplainer(false) : onClose}
      headerLeftContent={headerLeftContent}
    >
      {renderContent()}
    </ViewWrapper>
  );
}

const styles = StyleSheet.create({
  infoButton: {
    borderRadius: BorderRadius[3],
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2] + 2,
  },
});
