import { View, StyleSheet } from 'react-native';
import type { PaymentInfo } from '@walletconnect/pay';

import { ActionButton } from '@/components/ActionButton';
import { MerchantInfo } from './MerchantInfo';
import { sharedStyles } from './styles';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';

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
          <View style={styles.stepContainer}>
            <Text variant="lg-400" color="text-primary">
              Provide information
            </Text>
            <Text variant="lg-400" color="text-secondary">
              A quick one-time check required for regulated payments.
            </Text>
          </View>
          <View style={styles.stepContainer}>
            <Text variant="lg-400" color="text-primary">
              Confirm payment
            </Text>
            <Text variant="lg-400" color="text-secondary">
              Review the details and approve the payment.
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.etaBadge,
            { backgroundColor: Theme['foreground-secondary'] },
          ]}
        >
          <Text variant="sm-400" color="text-secondary">
            ≈2min
          </Text>
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
    gap: Spacing[8],
    paddingLeft: Spacing[5],
    paddingRight: Spacing[2],
  },
  stepContainer: {
    gap: Spacing[1],
  },
  paymentInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing[6],
  },
  stepIndicator: {
    marginVertical: Spacing[6],
    alignItems: 'center',
    width: Spacing[4],
  },
  stepDot: {
    width: Spacing[4],
    height: Spacing[4],
    borderWidth: 3,
    borderRadius: BorderRadius.full,
  },
  stepLine: {
    width: 2,
    flex: 1,
  },
  etaBadge: {
    alignSelf: 'flex-start',
    marginTop: Spacing[6],
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    borderRadius: BorderRadius[2],
  },
});
