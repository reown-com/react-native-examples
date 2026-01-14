import { BorderRadius, Spacing } from '@/constants/spacing';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatPayAmount, PaymentInfo } from '@/lib/pay';
import { StyleSheet, View } from 'react-native';
import { Button } from '@/components/primitives/button';
import { Text } from '@/components/primitives/text';
import { MerchantCard } from './merchant-card';

interface IntroStepProps {
  paymentInfo: PaymentInfo;
  onStart: () => void;
}

export function IntroStep({ paymentInfo, onStart }: IntroStepProps) {
  const stepColor = useThemeColor('border-secondary');

  const formattedAmount = formatPayAmount(paymentInfo.amount);

  return (
    <View style={styles.container}>
      <MerchantCard
        merchant={paymentInfo.merchant}
        formattedAmount={formattedAmount}
      />

      {/* Steps Overview */}
      <View style={styles.stepsCard}>
        {/* Step 1: Provide Information */}
        <View style={styles.stepRow}>
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, { borderColor: stepColor }]} />
            <View style={[styles.stepLine, { backgroundColor: stepColor }]} />
          </View>
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Text fontSize={16} lineHeight={20} type="defaultSemiBold">
                Provide information
              </Text>
              <View style={styles.etaBadge}>
                <Text fontSize={12} lineHeight={14} color="text-tertiary">
                  ≈2min
                </Text>
              </View>
            </View>
            <Text fontSize={14} lineHeight={18} color="text-tertiary">
              A quick one-time check required for regulated payments.
            </Text>
          </View>
        </View>

        {/* Step 2: Confirm Payment */}
        <View style={styles.stepRow}>
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, { borderColor: stepColor }]} />
          </View>
          <View style={styles.stepContent}>
            <Text fontSize={16} lineHeight={20} type="defaultSemiBold">
              Confirm payment
            </Text>
            <Text fontSize={14} lineHeight={18} color="text-tertiary">
              Review the details and approve the payment.
            </Text>
          </View>
        </View>
      </View>

      {/* Start Button */}
      <Button
        onPress={onStart}
        type="primary"
        text="Let's start"
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing['spacing-5'],
    gap: Spacing['spacing-5'],
  },
  stepsCard: {
    borderRadius: BorderRadius['5'],
    paddingVertical: Spacing['spacing-5'],
    gap: Spacing['spacing-4'],
  },
  stepRow: {
    flexDirection: 'row',
    gap: Spacing['spacing-3'],
  },
  stepIndicator: {
    alignItems: 'center',
    width: 16,
  },
  stepDot: {
    marginTop: Spacing['spacing-1'],
    width: 14,
    height: 14,
    borderWidth: 4,
    borderRadius: BorderRadius.full,
  },
  stepLine: {
    width: 2,
    flex: 1,
    marginTop: Spacing['spacing-1'],
    marginBottom: -Spacing['spacing-3'],
  },
  stepContent: {
    flex: 1,
    gap: Spacing['spacing-1'],
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  etaBadge: {
    paddingHorizontal: Spacing['spacing-2'],
    paddingVertical: Spacing['spacing-1'],
    borderRadius: BorderRadius['2'],
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  button: {
    marginTop: Spacing['spacing-2'],
  },
});
