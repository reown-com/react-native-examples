import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { ActionButton } from '@/components/ActionButton';
import { Text } from '@/components/Text';
import CheckCircle from '@/assets/CheckCircle';
import CoinStack from '@/assets/CoinStack';
import ClockCircle from '@/assets/ClockCircle';
import WarningCircle from '@/assets/WarningCircle';
import { haptics } from '@/utils/haptics';
import { Spacing } from '@/utils/ThemeUtil';

import type { ErrorType } from './utils';
import { getErrorTitle } from './utils';

interface ResultViewProps {
  status: 'success' | 'error';
  errorType?: ErrorType | null;
  message?: string;
  onClose: () => void;
}

export function ResultView({
  status,
  errorType,
  message,
  onClose,
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
        <CheckCircle width={40} height={40} fill={Theme['text-success']} />
      );
    }

    const iconColor = '#0988F0';

    switch (errorType) {
      case 'insufficient_funds':
        return <CoinStack width={40} height={40} fill={iconColor} />;
      case 'expired':
        return <ClockCircle width={40} height={40} fill={iconColor} />;
      case 'not_found':
      case 'generic':
      default:
        return <WarningCircle width={40} height={40} fill={iconColor} />;
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
        >
          {message || defaultMessage}
        </Text>
      );
    }

    if (!errorType) {
      return (
        <Text variant="h6-400" color="text-primary" center style={styles.title}>
          {message || defaultMessage}
        </Text>
      );
    }

    return (
      <Text variant="h6-400" color="text-primary" center style={styles.title}>
        {getErrorTitle(errorType)}
      </Text>
    );
  };

  return (
    <>
      <View style={styles.contentContainer}>
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
        <ActionButton onPress={onClose} fullWidth>
          {isSuccess ? 'Got it!' : 'Close'}
        </ActionButton>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    alignItems: 'center',
    marginHorizontal: Spacing[5],
  },
  title: {
    marginTop: Spacing[3],
  },
  message: {
    marginTop: Spacing[1],
  },
  footerContainer: {
    paddingTop: Spacing[11],
    alignItems: 'center',
  },
});
