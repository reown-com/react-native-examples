import { View, Text, Image, StyleSheet } from 'react-native';
import type { PaymentInfo } from '@walletconnect/pay';

import { useTheme } from '@/hooks/useTheme';
import { formatAmount } from './utils';

interface MerchantInfoProps {
  info?: PaymentInfo;
  showAssetName?: boolean;
}

export function MerchantInfo({ info, showAssetName }: MerchantInfoProps) {
  const Theme = useTheme();

  return (
    <>
      {info?.merchant && (
        <View style={styles.merchantContainer}>
          {info.merchant.iconUrl && (
            <Image
              source={{ uri: info.merchant.iconUrl }}
              style={styles.merchantIcon}
            />
          )}
          <Text style={[styles.merchantName, { color: Theme['fg-100'] }]}>
            {info.merchant.name}
          </Text>
        </View>
      )}
      {info?.amount && (
        <View style={styles.amountContainer}>
          <Text style={[styles.amountValue, { color: Theme['fg-100'] }]}>
            ${formatAmount(info.amount.value, info.amount.display.decimals, 2)}
          </Text>
          {showAssetName && (
            <Text style={[styles.amountLabel, { color: Theme['fg-200'] }]}>
              {info.amount.display.assetName}
            </Text>
          )}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  merchantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  merchantIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  merchantName: {
    fontSize: 18,
    fontWeight: '600',
  },
  amountContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  amountLabel: {
    fontSize: 14,
    marginTop: 4,
  },
});
