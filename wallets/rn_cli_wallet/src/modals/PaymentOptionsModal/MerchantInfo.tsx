import { View, Text, Image, StyleSheet } from 'react-native';
import type { PaymentInfo } from '@walletconnect/pay';

import { useTheme } from '@/hooks/useTheme';
import { formatAmount } from './utils';
import SealCheck from '@/assets/SealCheck';

interface MerchantInfoProps {
  info?: PaymentInfo;
}

export function MerchantInfo({ info }: MerchantInfoProps) {
  const Theme = useTheme();
  const amount = formatAmount(info?.amount?.value || '0', info?.amount?.display?.decimals || 0, 2);

  return (
    <>
      {info?.merchant && (
        <View style={styles.merchantContainer}>
          <Image
            source={{ uri: info.merchant.iconUrl }}
            style={[styles.merchantIcon, { backgroundColor: Theme['bg-300'] }]}
          />
          <View style={styles.paymentInfoContainer}>
          <Text style={[styles.paymentInfo, { color: Theme['fg-100'] }]} numberOfLines={1} ellipsizeMode="tail">
            Pay ${amount} to {info.merchant.name}
          </Text>
          <SealCheck width={22} height={22} fill={Theme['accent-100']} />
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
    gap: 16,
    paddingHorizontal: 60,
  },
  merchantIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
  },
  paymentInfoContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  paymentInfo: {
    fontSize: 20,
    fontWeight: '400',
    textAlign: 'center',
  },
});
