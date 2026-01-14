/**
 * Payment Screen
 *
 * Full-screen modal for processing WalletConnect Pay payments.
 * Uses usePaymentFlow hook for state management and business logic.
 */

import { UnknownOutputParams, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  SlideInRight,
  SlideOutLeft,
  SlideInLeft,
  SlideOutRight,
} from 'react-native-reanimated';

import { Modal, ModalRef } from '@/components/modal';
import {
  PayHeader,
  IntroStep,
  CollectNameStep,
  CollectDobStep,
  CollectPobStep,
  ConfirmStep,
  ProcessingStep,
  ResultStep,
} from '@/components/pay';
import { usePaymentFlow } from '@/hooks/use-payment-flow';

interface ScreenParams extends UnknownOutputParams {
  paymentLink: string;
}

export default function PayScreen() {
  const { paymentLink } = useLocalSearchParams<ScreenParams>();
  const modalRef = useRef<ModalRef>(null);
  const { bottom } = useSafeAreaInsets();
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  const { state, actions, computed } = usePaymentFlow(paymentLink);

  const handleClose = useCallback(() => {
    modalRef.current?.close();
  }, []);

  // Wrap actions to track navigation direction
  const handleGoBack = useCallback(() => {
    setDirection('back');
    actions.goBack();
  }, [actions]);

  const handleStartCollection = useCallback(() => {
    setDirection('forward');
    actions.startCollection();
  }, [actions]);

  const handleSubmitName = useCallback(
    (firstName: string, lastName: string) => {
      setDirection('forward');
      actions.submitName(firstName, lastName);
    },
    [actions],
  );

  const handleSubmitDob = useCallback(
    (dateOfBirth: Date) => {
      setDirection('forward');
      actions.submitDob(dateOfBirth);
    },
    [actions],
  );

  const handleSubmitPob = useCallback(
    (city: string, country: string) => {
      setDirection('forward');
      actions.submitPob(city, country);
    },
    [actions],
  );

  const renderContent = () => {
    switch (state.step) {
      case 'initial-loading':
        return <ProcessingStep message="Loading payment..." />;

      case 'intro':
        if (!state.paymentInfo) return null;
        return (
          <IntroStep
            paymentInfo={state.paymentInfo}
            onStart={handleStartCollection}
          />
        );

      case 'collect-name': {
        const firstName =
          state.collectedData.find((d) => d.id === 'firstName')?.value || '';
        const lastName =
          state.collectedData.find((d) => d.id === 'lastName')?.value || '';
        return (
          <CollectNameStep
            initialFirstName={firstName}
            initialLastName={lastName}
            onContinue={handleSubmitName}
          />
        );
      }

      case 'collect-dob': {
        const dobValue = state.collectedData.find(
          (d) => d.id === 'dateOfBirth',
        )?.value;
        const initialDate = dobValue ? new Date(dobValue) : undefined;
        return (
          <CollectDobStep
            initialDate={initialDate}
            onContinue={handleSubmitDob}
          />
        );
      }

      case 'collect-pob': {
        const city =
          state.collectedData.find((d) => d.id === 'placeOfBirthCity')?.value ||
          '';
        const country =
          state.collectedData.find((d) => d.id === 'placeOfBirthCountry')
            ?.value || '';
        return (
          <CollectPobStep
            initialCity={city}
            initialCountry={country}
            onContinue={handleSubmitPob}
          />
        );
      }

      case 'confirm':
        if (!state.paymentInfo || !computed.selectedOption) return null;
        return (
          <ConfirmStep
            paymentInfo={state.paymentInfo}
            options={state.options}
            selectedOption={computed.selectedOption}
            onSelectOption={actions.selectOption}
            onConfirm={actions.confirm}
          />
        );

      case 'processing':
        return <ProcessingStep />;

      case 'success':
        return (
          <ResultStep
            type="success"
            paymentInfo={state.paymentInfo}
            onDone={handleClose}
          />
        );

      case 'error': {
        const canRetry = state.options.length > 0 && computed.selectedOption;
        return (
          <ResultStep
            type="error"
            paymentInfo={state.paymentInfo}
            errorMessage={state.error}
            onDone={handleClose}
            onRetry={canRetry ? actions.retry : undefined}
          />
        );
      }

      default:
        return null;
    }
  };

  // Check if we should animate this step
  const shouldAnimate = [
    'collect-name',
    'collect-dob',
    'collect-pob',
    'confirm',
  ].includes(state.step);

  return (
    <Modal ref={modalRef}>
      <Animated.View style={{ paddingBottom: bottom }}>
        {computed.showHeader && (
          <PayHeader
            currentStep={computed.progress.current}
            totalSteps={computed.progress.total}
            showBack={computed.canGoBack}
            showSteps={computed.showProgressSteps}
            onBack={handleGoBack}
            onClose={handleClose}
          />
        )}
        {shouldAnimate ? (
          <Animated.View
            key={state.step}
            entering={direction === 'forward' ? SlideInRight : SlideInLeft}
            exiting={direction === 'forward' ? SlideOutLeft : SlideOutRight}>
            {renderContent()}
          </Animated.View>
        ) : (
          renderContent()
        )}
      </Animated.View>
    </Modal>
  );
}
