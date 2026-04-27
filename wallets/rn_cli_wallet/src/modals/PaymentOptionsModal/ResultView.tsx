import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { ActionButton } from '@/components/ActionButton';
import { Text } from '@/components/Text';
import CheckCircle from '@/assets/CheckCircle';
import CoinStack from '@/assets/CoinStack';
import WarningCircle from '@/assets/WarningCircle';
import { haptics } from '@/utils/haptics';
import { Spacing } from '@/utils/ThemeUtil';

import type { ErrorType } from './utils';
import { getErrorTitle } from './utils';

const getResultButtonTestId = (isSuccess: boolean, errorType?: ErrorType | null) =>
  `pay-button-result-action-${isSuccess ? 'success' : errorType || 'generic'}`;

const getActionButtonText = (isSuccess: boolean, errorType?: ErrorType | null) => {
  if (isSuccess || errorType === 'insufficient_funds') return 'Got it!';
  if (errorType === 'expired' || errorType === 'cancelled') return 'Scan new QR code';
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
  const Theme = useTheme();

  useEffect(() => {
    if (status === 'success') {
      haptics.success();
    } else if (status === 'error') {
      haptics.error();
    }
  }, [status]);

  const isSuccess = status === 'success';
  const defaultMessage = isSuccess
    ? 'Your payment has been confirmed'
    : 'An error occurred';

  const renderIcon = () => {
    if (isSuccess) {
      return (
        <CheckCircle
          width={40}
          height={40}
          fill={Theme['text-success']}
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
          style={styles.title}
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
          style={styles.title}
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
        style={styles.title}
        testID="pay-result-title"
      >
        {getErrorTitle(errorType)}
      </Text>
    );
  };

  return (
    <>
      <View style={styles.contentContainer} testID="pay-result-container">
        {renderIcon()}
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
  contentContainer: {
    alignItems: 'center',
  },
  title: {
    marginTop: Spacing[4],
  },
  message: {
    marginTop: Spacing[1],
  },
  footerContainer: {
    paddingTop: Spacing[7],
    marginBottom: Spacing[2],
    alignItems: 'center',
  },
});
