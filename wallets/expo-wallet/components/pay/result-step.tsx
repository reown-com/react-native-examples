import { BorderRadius, Spacing } from '@/constants/spacing';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatPayAmount, PaymentInfo } from '@/lib/pay';
import { StyleSheet, View } from 'react-native';
import { Button } from '@/components/primitives/button';
import { Text } from '@/components/primitives/text';
import { Image } from 'expo-image';

interface ResultStepProps {
  type: 'success' | 'error';
  paymentInfo?: PaymentInfo;
  errorMessage?: string;
  onDone: () => void;
  onRetry?: () => void;
}

export function ResultStep({
  type,
  paymentInfo,
  errorMessage,
  onDone,
  onRetry,
}: ResultStepProps) {
  const successColor = useThemeColor('icon-success');
  const errorColor = useThemeColor('icon-error');
  const iconColor = type === 'success' ? successColor : errorColor;
  const closeTintColor = useThemeColor('icon-inverse');

  const formattedAmount = paymentInfo
    ? formatPayAmount(paymentInfo.amount)
    : '';

  const title =
    type === 'success'
      ? `You've paid ${formattedAmount} to ${paymentInfo?.merchant.name || 'merchant'}`
      : 'Payment failed';

  const description =
    type === 'error'
      ? errorMessage || 'Something went wrong. Please try again.'
      : undefined;

  return (
    <View style={styles.container}>
      <Button onPress={onDone} hitSlop={10} style={[styles.closeButton]}>
        <Image
          source={require('@/assets/icons/close.png')}
          style={[styles.closeIcon, { tintColor: closeTintColor }]}
        />
      </Button>

      {/* Icon */}
      <Image
        source={
          type === 'success'
            ? require('@/assets/icons/check-circle.png')
            : require('@/assets/icons/warning-circle.png')
        }
        style={[styles.resultIcon, { tintColor: iconColor }]}
      />
      {/* Title */}
      <Text fontSize={18} lineHeight={22} center>
        {title}
      </Text>

      {/* Description (for error) */}
      {description && (
        <Text fontSize={14} lineHeight={18} center color="text-tertiary">
          {description}
        </Text>
      )}

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        {type === 'error' && onRetry && (
          <Button
            onPress={onRetry}
            type="secondary"
            text="Try again"
            style={styles.button}
          />
        )}
        <Button
          onPress={onDone}
          type="primary"
          text={type === 'success' ? 'Got it!' : 'Close'}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing['spacing-5'],
    paddingTop: Spacing['spacing-8'],
    gap: Spacing['spacing-4'],
    alignItems: 'center',
  },
  resultIcon: {
    width: 54,
    height: 54,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['spacing-1'],
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: Spacing['spacing-3'],
    marginTop: Spacing['spacing-6'],
    width: '100%',
  },
  button: {
    flex: 1,
  },
  closeButton: {
    alignSelf: 'flex-end',
    justifyContent: 'center',
    marginRight: Spacing['spacing-2'],
  },
  closeIcon: {
    width: 13,
    height: 13,
  },
});
