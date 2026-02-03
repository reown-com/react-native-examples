import { View, Image, StyleSheet } from 'react-native';
import type { PaymentInfo } from '@walletconnect/pay';

import { useTheme } from '@/hooks/useTheme';
import { formatAmount, getCurrencySymbol } from './utils';
import SealCheck from '@/assets/SealCheck';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';

interface MerchantInfoProps {
  info?: PaymentInfo;
}

export function MerchantInfo({ info }: MerchantInfoProps) {
  const Theme = useTheme();
  const amount = formatAmount(
    info?.amount?.value || '0',
    info?.amount?.display?.decimals || 0,
    2,
  );
  const currencySymbol = getCurrencySymbol(info?.amount?.display?.assetSymbol);

  return (
    <>
      {info?.merchant && (
        <View style={styles.merchantContainer}>
          {info.merchant.iconUrl ? (
            <Image
              source={{ uri: info.merchant.iconUrl, cache: 'force-cache' }}
              style={[
                styles.merchantIcon,
                { backgroundColor: Theme['foreground-tertiary'] },
              ]}
            />
          ) : (
            <View
              style={[
                styles.merchantIcon,
                { backgroundColor: Theme['foreground-tertiary'] },
              ]}
            />
          )}
          <View style={styles.paymentInfoContainer}>
            <Text
              variant="h6-400"
              color="text-primary"
              numberOfLines={1}
              ellipsizeMode="tail"
              center
            >
              Pay {currencySymbol}
              {amount} to {info.merchant.name}
            </Text>
            <SealCheck
              width={22}
              height={22}
              fill={Theme['bg-accent-primary']}
            />
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  merchantContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[4],
    paddingHorizontal: 60,
  },
  merchantIcon: {
    width: Spacing[13],
    height: Spacing[13],
    borderRadius: BorderRadius[4],
  },
  paymentInfoContainer: {
    flexDirection: 'row',
    gap: Spacing[1],
  },
});
