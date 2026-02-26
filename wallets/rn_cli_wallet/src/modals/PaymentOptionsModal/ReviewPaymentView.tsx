import { View, Image, StyleSheet } from 'react-native';
import type { PaymentInfo, PaymentOption } from '@walletconnect/pay';

import { useTheme } from '@/hooks/useTheme';
import { ActionButton } from '@/components/ActionButton';
import { Text } from '@/components/Text';
import { MerchantInfo } from './MerchantInfo';
import { PresetsUtil } from '@/utils/PresetsUtil';
import { formatAmount, getCurrencySymbol } from './utils';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';

interface ReviewPaymentViewProps {
  selectedOption: PaymentOption;
  info?: PaymentInfo;
  isLoadingActions: boolean;
  isSigningPayment: boolean;
  onPay: () => void;
}

export function ReviewPaymentView({
  selectedOption,
  info,
  isLoadingActions,
  isSigningPayment,
  onPay,
}: ReviewPaymentViewProps) {
  const Theme = useTheme();

  const tokenAmount = formatAmount(
    selectedOption.amount.value,
    selectedOption.amount.display.decimals,
    2,
  );

  const payAmount = formatAmount(
    info?.amount?.value || '0',
    info?.amount?.display?.decimals || 0,
    2,
  );
  const currencySymbol = getCurrencySymbol(info?.amount?.display?.assetSymbol);

  const chainIcon = PresetsUtil.getIconLogoByName(
    selectedOption.amount.display.networkName,
  );

  return (
    <>
      <MerchantInfo info={info} />

      <View style={styles.itemContainer}>
        <View
          style={[
            styles.item,
            { backgroundColor: Theme['foreground-primary'] },
          ]}
        >
          <Text variant="lg-400" color="text-tertiary">
            Pay with
          </Text>
          <View style={styles.itemRight}>
            <Text variant="lg-400" color="text-primary">
              {tokenAmount} {selectedOption.amount.display.assetSymbol}
            </Text>
            <View style={styles.iconStack}>
              <Image
                source={{
                  uri: selectedOption.amount.display.iconUrl,
                  cache: 'force-cache',
                }}
                style={styles.tokenIcon}
              />
              <Image
                source={chainIcon}
                style={[
                  styles.chainBadge,
                  { borderColor: Theme['foreground-primary'] },
                ]}
              />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <ActionButton
          onPress={onPay}
          disabled={isSigningPayment || isLoadingActions}
          fullWidth
        >
          {`Pay ${currencySymbol}${payAmount}`}
        </ActionButton>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    marginTop: Spacing[4],
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 68,
    marginTop: Spacing[2],
    paddingHorizontal: Spacing[5],
    borderRadius: BorderRadius[4],
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  iconStack: {
    width: 32,
    height: 32,
  },
  tokenIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
  },
  chainBadge: {
    width: 16,
    height: 16,
    position: 'absolute',
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    right: -2,
    bottom: -2,
  },
  buttonContainer: {
    marginTop: Spacing[5],
    marginBottom: Spacing[2],
  },
});
