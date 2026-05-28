import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

import { ActionButton } from '@/components/ActionButton';
import { Text } from '@/components/Text';
import CoinStack from '@/assets/CoinStack';
import WarningCircle from '@/assets/WarningCircle';
import { haptics } from '@/utils/haptics';
import { Spacing } from '@/utils/ThemeUtil';

import type { ErrorType } from './utils';
import {
  arePayModalAnimationsEnabled,
  getErrorTitle,
  LOTTIE_ICON_SIZE,
  PAY_STATUS_LAYOUT,
} from './utils';

const getResultButtonTestId = (
  isSuccess: boolean,
  errorType?: ErrorType | null,
) =>
  `pay-button-result-action-${isSuccess ? 'success' : errorType || 'generic'}`;

const getActionButtonText = (
  isSuccess: boolean,
  errorType?: ErrorType | null,
) => {
  if (isSuccess) return 'Done';
  if (errorType === 'insufficient_funds') return 'Got it';
  if (errorType === 'expired' || errorType === 'cancelled')
    return 'Scan a new QR code';
  return 'Close';
};

interface ResultViewProps {
  status: 'success' | 'error';
  errorType?: ErrorType | null;
  message?: string;
  onClose: () => void;
  onScanQR?: () => void;
}

export function ResultView({
  status,
  errorType,
  message,
  onClose,
  onScanQR,
}: ResultViewProps) {
  useEffect(() => {
    if (status === 'success') {
      haptics.success();
    } else if (status === 'error') {
      haptics.error();
    }
  }, [status]);

  const isSuccess = status === 'success';
  const defaultMessage = isSuccess
    ? 'Payment confirmed'
    : 'Payment didn’t go through. No funds were moved. Try again, or pay with a different asset.';

  const renderIcon = () => {
    if (isSuccess) {
      return (
        <LottieView
          source={require('@/assets/lottie/Success.json')}
          autoPlay={arePayModalAnimationsEnabled}
          loop={false}
          progress={arePayModalAnimationsEnabled ? undefined : 1}
          style={styles.successAnimation}
          testID="pay-result-success-icon"
        />
      );
    }

    const iconColor = '#0988F0';

    switch (errorType) {
      case 'insufficient_funds':
        return (
          <CoinStack
            width={40}
            height={40}
            fill={iconColor}
            testID="pay-result-insufficient-funds-icon"
          />
        );
      case 'expired':
        return (
          <WarningCircle
            width={40}
            height={40}
            fill={iconColor}
            testID="pay-result-expired-icon"
          />
        );
      case 'cancelled':
        return (
          <WarningCircle
            width={40}
            height={40}
            fill={iconColor}
            testID="pay-result-cancelled-icon"
          />
        );
      case 'not_found':
      case 'generic':
      default:
        return (
          <WarningCircle
            width={40}
            height={40}
            fill={iconColor}
            testID="pay-result-error-icon"
          />
        );
    }
  };

  const renderTitle = () => {
    if (isSuccess) {
      return (
        <Text
          variant="h6-400"
          color="text-primary"
          center
          numberOfLines={2}
          testID="pay-result-title"
        >
          {message || defaultMessage}
        </Text>
      );
    }

    if (!errorType) {
      return (
        <Text
          variant="h6-400"
          color="text-primary"
          center
          testID="pay-result-title"
        >
          {message || defaultMessage}
        </Text>
      );
    }

    return (
      <Text
        variant="h6-400"
        color="text-primary"
        center
        testID="pay-result-title"
      >
        {getErrorTitle(errorType)}
      </Text>
    );
  };

  return (
    <>
      <View
        style={isSuccess ? styles.iconArea : styles.iconAreaCompact}
        testID="pay-result-container"
      >
        {renderIcon()}
      </View>
      <View style={styles.textArea}>
        {renderTitle()}
        {!isSuccess && (
          <Text
            variant="lg-400"
            color="text-tertiary"
            style={styles.message}
            numberOfLines={3}
            center
          >
            {message || defaultMessage}
          </Text>
        )}
      </View>
      <View style={styles.footerContainer}>
        <ActionButton
          onPress={
            (errorType === 'expired' || errorType === 'cancelled') && onScanQR
              ? onScanQR
              : onClose
          }
          fullWidth
          testID={getResultButtonTestId(isSuccess, errorType)}
        >
          {getActionButtonText(isSuccess, errorType)}
        </ActionButton>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  iconArea: {
    height: PAY_STATUS_LAYOUT.iconAreaHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconAreaCompact: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing[4],
  },
  successAnimation: {
    width: LOTTIE_ICON_SIZE,
    height: LOTTIE_ICON_SIZE,
  },
  textArea: {
    width: '100%',
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[4],
    alignItems: 'center',
  },
  message: {
    marginTop: Spacing[1],
  },
  footerContainer: {
    paddingTop: Spacing[2],
    paddingBottom: Spacing[2],
    alignItems: 'center',
  },
});
