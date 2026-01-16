import { View, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { ActionButton } from '@/components/ActionButton';
import { Text } from '@reown/appkit-ui-react-native';
import AlertCircle from '@/assets/AlertCircle';
import CheckCircle from '@/assets/CheckCircle';
import { sharedStyles } from './styles';

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
          <CheckCircle width={48} height={48} fill={Theme['success-100']} />
        ) : (
          <AlertCircle width={48} height={48} fill={Theme['error-100']} />
        )}
        <Text style={styles.message} numberOfLines={isSuccess ? 1 : 3} center>
          {message || defaultMessage}
        </Text>
      </View>
      <View style={sharedStyles.footerContainer}>
        <ActionButton
          style={sharedStyles.primaryButton}
          textStyle={sharedStyles.primaryButtonText}
          onPress={onClose}
        >
          {isSuccess ? 'Got it!' : 'Close'}
        </ActionButton>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    gap: 8,
    marginBottom: 30,
    alignItems: 'center',
  },
  message: {
    marginHorizontal: 20,
    fontSize: 20,
    fontWeight: '400',
  },
});
