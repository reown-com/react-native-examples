import { BorderRadius, Spacing } from '@/constants/spacing';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MerchantInfo } from '@/lib/pay';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/primitives/text';

interface MerchantCardProps {
  merchant: MerchantInfo;
  formattedAmount: string;
}

export function MerchantCard({ merchant, formattedAmount }: MerchantCardProps) {
  const verifiedColor = useThemeColor('icon-accent-primary');
  const logoBackgroundColor = useThemeColor('foreground-accent-primary-10');

  return (
    <View style={styles.container}>
      {merchant.iconUrl ? (
        <Image
          source={{ uri: merchant.iconUrl }}
          style={[styles.logo, { backgroundColor: logoBackgroundColor }]}
        />
      ) : (
        <View
          style={[
            styles.logo,
            styles.placeholderLogo,
            { backgroundColor: logoBackgroundColor },
          ]}>
          <Text fontSize={24} color="text-tertiary">
            {merchant.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.textContainer}>
        <Text fontSize={18} lineHeight={22} center>
          Pay {formattedAmount} to {merchant.name}
        </Text>
        {/* Note: SDK MerchantInfo doesn't have 'verified' field - could be added in future */}
        <Image
          source={require('@/assets/icons/seal-check.png')}
          style={[styles.verifiedBadge, { tintColor: verifiedColor }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing['spacing-3'],
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius['4'],
  },
  placeholderLogo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['spacing-1'],
  },
  verifiedBadge: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
