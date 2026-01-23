import { View, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { ActionButton } from '@/components/ActionButton';
import { Text } from '@/components/Text';
import AlertCircle from '@/assets/AlertCircle';
import CheckCircle from '@/assets/CheckCircle';
import { Spacing } from '@/utils/ThemeUtil';

interface ResultViewProps {
  status: 'success' | 'error';
  message?: string;
  onClose: () => void;
}

export function ResultView({ status, message, onClose }: ResultViewProps) {
  const Theme = useTheme();

  const isSuccess = status === 'success';
  const defaultMessage = isSuccess
    ? 'Your payment has been confirmed'
    : 'An error occurred';

  return (
    <>
      <View style={styles.contentContainer}>
        {isSuccess ? (
          <CheckCircle width={40} height={40} fill={Theme['text-success']} />
        ) : (
          <AlertCircle width={40} height={40} fill={Theme['text-error']} />
        )}
        <Text
          variant="large-600"
          color="text-primary"
          style={styles.message}
          numberOfLines={isSuccess ? 2 : 3}
          center
        >
          {message || defaultMessage}
        </Text>
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
    gap: Spacing[4],
    marginBottom: 30,
    alignItems: 'center',
  },
  message: {
    marginHorizontal: 20,
    fontSize: 20,
    fontWeight: '400',
  },
  footerContainer: {
    paddingTop: Spacing[4],
    alignItems: 'center',
  },
});
