import { useCallback, useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { useNavigation } from '@react-navigation/native';

import LogStore from '@/store/LogStore';
import ModalStore from '@/store/ModalStore';
import PaymentStore from '@/store/PaymentStore';
import type {
  CollectDataField,
  CollectDataFieldResult,
  PaymentOption,
} from '@walletconnect/pay';
import type { PaymentOptionWithCollectData } from '@/utils/TypesUtil';

import { LoadingView } from './LoadingView';
import { CollectDataWebView } from './CollectDataWebView';
import { SelectOptionView } from './SelectOptionView';
import { ReviewPaymentView } from './ReviewPaymentView';
import { InfoExplainerView } from './InfoExplainerView';
import { ExpiryWarningView } from './ExpiryWarningView';
import { ResultView } from './ResultView';
import { ViewWrapper } from './ViewWrapper';
import { detectErrorType, getLoadingContent } from './utils';
import { GasFeeView } from './GasFeeView';
import { requiresApproval } from '@/utils/PaymentUtil';

export default function PaymentOptionsModal() {
  const snap = useSnapshot(PaymentStore.state);
  const navigation = useNavigation();

  const selectedOptionCollectData = (
    snap.selectedOption as PaymentOptionWithCollectData | null
  )?.collectData;
  const selectedOptionCollectDataUrl = selectedOptionCollectData?.url;
  const selectedOptionCollectDataFields = selectedOptionCollectData?.fields;
  const selectedOptionCollectDataSchema = selectedOptionCollectData?.schema;

  useEffect(() => {
    let isActive = true;

    const resolveLoadingStep = async () => {
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
          message: snap.errorMessage,
          errorType,
        });
        return;
      }

      if (!snap.paymentOptions) {
        return;
      }

      // A terminal payment (cancelled/expired/failed) comes back with its status
      // in `info` and empty options. Surface that status instead of treating the
      // empty options as "insufficient funds". (getPaymentOptions used to throw
      // for these — masking it as an error string — but pay >=1.0.9 returns
      // `options: []`, so we must read the status explicitly.)
      const paymentStatus = snap.paymentOptions.info?.status;
      if (paymentStatus === 'cancelled' || paymentStatus === 'expired') {
        PaymentStore.setResult({ status: 'error', errorType: paymentStatus });
        return;
      }
      // Only 'requires_action' is payable. Any other terminal/in-flight status
      // (succeeded / processing / failed — e.g. re-scanning an already-completed
      // payment) can't be paid, so show a generic error rather than falling
      // through to the empty-options "insufficient funds" path.
      if (paymentStatus && paymentStatus !== 'requires_action') {
        PaymentStore.setResult({ status: 'error', errorType: 'generic' });
        return;
      }

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
        });
        return;
      }

      const options = snap.paymentOptions.options as PaymentOption[];
      const firstOption = options[0] as PaymentOptionWithCollectData;

      if (options.length === 1) {
        PaymentStore.selectOption(firstOption as PaymentOption);
        if (isActive) {
          if (firstOption.collectData?.url) {
            PaymentStore.setStep('collectData');
          } else {
            PaymentStore.setStep('review');
          }
        }
        return;
      }

      try {
        const lastPaidTokenUnit = await PaymentStore.loadLastPaidTokenUnit();
        if (!isActive) return;

        const preferredOption = PaymentStore.findPreferredOption(
          options,
          lastPaidTokenUnit,
        ) as PaymentOptionWithCollectData | null;

        if (!preferredOption) {
          PaymentStore.setStep('selectOption');
          return;
        }

        const needsCollectData = !!preferredOption.collectData?.url;
        if (needsCollectData) {
          PaymentStore.selectOption(preferredOption as PaymentOption);
          PaymentStore.setStep('selectOption');
          return;
        }

        PaymentStore.selectOption(preferredOption as PaymentOption);
        PaymentStore.setStep('review');
      } catch (error) {
        LogStore.warn(
          'Failed to load last paid token',
          'PaymentOptionsModal',
          'useEffect',
          {
            error:
              error instanceof Error ? error.message : 'unknown storage error',
          },
        );
        PaymentStore.setStep('selectOption');
      }
    };

    if (snap.step === 'loading') {
      resolveLoadingStep().catch(error => {
        LogStore.error(
          'Failed to resolve payment loading step',
          'PaymentOptionsModal',
          'useEffect',
          {
            error:
              error instanceof Error
                ? error.message
                : 'unknown loading step error',
          },
        );
        PaymentStore.setStep('selectOption');
      });
    }

    return () => {
      isActive = false;
    };
  }, [snap.step, snap.paymentOptions, snap.errorMessage]);

  const handleWebViewComplete = useCallback(
    (collectedData?: CollectDataFieldResult[]) => {
      const { selectedOption } = PaymentStore.state;
      if (selectedOption) {
        PaymentStore.markCollectDataCompleted(selectedOption.id);
        // Web's in-app form returns the values; native's hosted webview submits
        // server-side and passes nothing, so confirmPayment omits collectedData.
        if (collectedData?.length) {
          PaymentStore.setCollectedData(selectedOption.id, collectedData);
        }
      }
      PaymentStore.setStep('review');
    },
    [],
  );

  const handleWebViewError = useCallback((error: string) => {
    const errorType = detectErrorType(error);
    PaymentStore.setResult({
      status: 'error',
      message: error,
      errorType,
    });
  }, []);

  const onClose = useCallback(() => {
    PaymentStore.reset();
    ModalStore.close();
  }, []);

  const onScanQR = useCallback(() => {
    PaymentStore.reset();
    ModalStore.close();
    navigation.navigate('Scan');
  }, [navigation]);

  const handleInfoPress = useCallback(() => {
    PaymentStore.setStep('infoExplainer');
  }, []);

  const handleExpiryComplete = useCallback(() => {
    PaymentStore.setStep('review');
  }, []);

  const handleExpired = useCallback(() => {
    PaymentStore.setResult({
      status: 'error',
      errorType: 'expired',
    });
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
      case 'gasFee':
        PaymentStore.setStep('review');
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
  }, []);

  const handleSelectOption = useCallback(
    (option: PaymentOption) => {
      onSelectOption(option);
      const { collectDataCompletedIds } = PaymentStore.state;

      const needsCollectData = !!option.collectData?.url;
      const alreadyCompleted = collectDataCompletedIds.includes(option.id);

      if (needsCollectData && !alreadyCompleted) {
        PaymentStore.setStep('collectData');
      } else {
        PaymentStore.setStep('review');
      }
    },
    [onSelectOption],
  );

  useEffect(() => {
    if (snap.step === 'selectOption') {
      const options = snap.paymentOptions?.options || [];

      if (options.length === 0) {
        PaymentStore.setResult({
          status: 'error',
          errorType: 'insufficient_funds',
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
            variant="spinner"
            message={
              getLoadingContent('loading', {
                setupTokenSymbol: snap.setupTokenSymbol,
              }).message
            }
          />
        );

      case 'infoExplainer':
        return (
          <InfoExplainerView
            onDismiss={() => PaymentStore.setStep('selectOption')}
          />
        );

      case 'gasFee':
        return (
          <GasFeeView
            onDismiss={() => PaymentStore.setStep('review')}
            imageSource={snap.selectedOption?.amount.display?.iconUrl || ''}
            tokenName={snap.selectedOption?.amount.display?.assetSymbol || ''}
            gasCostEstimate={
              snap.selectedOption
                ? snap.optionFeeEstimatesById[snap.selectedOption.id]
                    ?.display || ''
                : ''
            }
          />
        );

      case 'collectData':
        return (
          <CollectDataWebView
            url={selectedOptionCollectDataUrl!}
            fields={selectedOptionCollectDataFields as CollectDataField[]}
            schema={selectedOptionCollectDataSchema}
            onComplete={handleWebViewComplete}
            onError={handleWebViewError}
          />
        );

      case 'selectOption':
        return (
          <SelectOptionView
            info={snap.paymentOptions?.info}
            options={(snap.paymentOptions?.options || []) as PaymentOption[]}
            onOptionPress={handleSelectOption}
            onInfoPress={handleInfoPress}
            collectDataCompletedIds={snap.collectDataCompletedIds as string[]}
            optionFeeEstimatesById={snap.optionFeeEstimatesById}
            optionFeeEstimateStatusById={snap.optionFeeEstimateStatusById}
          />
        );

      case 'review': {
        if (!snap.selectedOption) {
          return null;
        }

        const selectedOption = snap.selectedOption as PaymentOption;

        return (
          <ReviewPaymentView
            info={snap.paymentOptions?.info}
            selectedOption={selectedOption}
            requiresApproval={requiresApproval(selectedOption.actions)}
            approvalGasEstimate={
              snap.optionFeeEstimatesById[selectedOption.id] ?? null
            }
            isEstimatingApprovalGas={
              snap.optionFeeEstimateStatusById[selectedOption.id] === 'loading'
            }
            onPay={() => PaymentStore.approvePayment()}
            onGasFeePress={() => PaymentStore.setStep('gasFee')}
            onChangeOption={
              snap.paymentOptions?.options?.length &&
              snap.paymentOptions?.options?.length > 1
                ? () => PaymentStore.setStep('selectOption')
                : undefined
            }
          />
        );
      }

      case 'confirming': {
        const confirming = getLoadingContent('confirming', {
          setupTokenSymbol: snap.setupTokenSymbol,
        });
        return (
          <LoadingView message={confirming.message} note={confirming.note} />
        );
      }

      case 'expiryWarning':
        if (!snap.expiresAt) return null;
        return (
          <ExpiryWarningView
            expiresAt={snap.expiresAt}
            onComplete={handleExpiryComplete}
            onExpired={handleExpired}
          />
        );

      case 'result':
        return (
          <ResultView
            status={snap.resultStatus}
            errorType={snap.resultErrorType}
            message={snap.resultMessage}
            onClose={onClose}
            onScanQR={onScanQR}
          />
        );

      default:
        return <LoadingView message="Loading…" />;
    }
  }, [
    snap.step,
    snap.selectedOption,
    snap.resultStatus,
    snap.resultErrorType,
    snap.resultMessage,
    snap.setupTokenSymbol,
    snap.paymentOptions,
    snap.optionFeeEstimatesById,
    snap.optionFeeEstimateStatusById,
    snap.collectDataCompletedIds,
    snap.expiresAt,
    selectedOptionCollectDataUrl,
    selectedOptionCollectDataFields,
    selectedOptionCollectDataSchema,
    handleWebViewComplete,
    handleWebViewError,
    handleSelectOption,
    handleInfoPress,
    onClose,
    onScanQR,
    handleExpiryComplete,
    handleExpired,
  ]);

  const paymentOptionsCount = snap.paymentOptions?.options?.length ?? 0;
  const showBackButton =
    snap.step === 'collectData' ||
    snap.step === 'infoExplainer' ||
    snap.step === 'gasFee' ||
    (snap.step === 'review' &&
      paymentOptionsCount > 1 &&
      (snap.previousStep === 'selectOption' ||
        snap.previousStep === 'collectData'));
  const isWebView =
    snap.step === 'collectData' && !!selectedOptionCollectDataUrl;

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
