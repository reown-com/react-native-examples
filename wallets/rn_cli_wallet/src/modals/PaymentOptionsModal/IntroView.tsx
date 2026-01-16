import { View, StyleSheet, Text } from 'react-native';
import type { PaymentInfo } from '@walletconnect/pay';

import { ActionButton } from '@/components/ActionButton';
import { MerchantInfo } from './MerchantInfo';
import { sharedStyles } from './styles';
import { useTheme } from '@/hooks/useTheme';

interface IntroViewProps {
  info?: PaymentInfo;
  onContinue: () => void;
}

export function IntroView({ info, onContinue }: IntroViewProps) {
  const Theme = useTheme();
  return (
    <>
      <MerchantInfo info={info} />

      <View style={styles.paymentInfoContainer}>
        <View style={[styles.stepIndicator]}>
          <View
            style={[styles.stepDot, { borderColor: Theme['border-secondary'] }]}
          />
          <View
            style={[
              styles.stepLine,
              { backgroundColor: Theme['border-secondary'] },
            ]}
          />
          <View
            style={[styles.stepDot, { borderColor: Theme['border-secondary'] }]}
          />
        </View>

        <View style={styles.textContainer}>
          <View style={{ gap: 4 }}>
            <Text style={styles.stepTitle}>Provide information</Text>
            <Text style={styles.stepDescription}>
              A quick one-time check required for regulated payments.
            </Text>
          </View>
          <View style={{ gap: 4 }}>
            <Text style={styles.stepTitle}>Confirm payment</Text>
            <Text style={styles.stepDescription}>
              Review the details and approve the payment.
            </Text>
          </View>
        </View>

        <View style={[styles.etaBadge]}>
          <Text>≈2min</Text>
        </View>
      </View>

      <View style={sharedStyles.footerContainer}>
        <ActionButton
          style={sharedStyles.primaryButton}
          textStyle={sharedStyles.primaryButtonText}
          onPress={onContinue}
        >
          Let's start
        </ActionButton>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  textContainer: {
    flex: 2,
    flexDirection: 'column',
    gap: 32,
    paddingLeft: 20,
    paddingRight: 8,
  },
  paymentInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  stepDescription: {
    fontSize: 16,
    color: '#9A9A9A',
  },
  stepIndicator: {
    marginVertical: 24,
    alignItems: 'center',
    width: 16,
  },
  stepDot: {
    width: 16,
    height: 16,
    borderWidth: 3,
    borderRadius: 100,
  },
  stepLine: {
    width: 2,
    flex: 1,
  },
  etaBadge: {
    alignSelf: 'flex-start',
    marginTop: 24,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
});
