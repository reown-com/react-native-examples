import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import type { PaymentOption, PaymentInfo } from '@walletconnect/pay';

import { useTheme } from '@/hooks/useTheme';
import { ActionButton } from '@/components/ActionButton';
import { formatAmount } from './utils';
import { MerchantInfo } from './MerchantInfo';

interface PaymentOptionsViewProps {
  info?: PaymentInfo;
  options: PaymentOption[];
  onSelectOption: (option: PaymentOption) => void;
  onCancel: () => void;
}

export function PaymentOptionsView({
  info,
  options,
  onSelectOption,
  onCancel,
}: PaymentOptionsViewProps) {
  const Theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: Theme['bg-175'] }]}>
      <Text style={[styles.headerTitle, { color: Theme['fg-100'] }]}>
        Payment Request
      </Text>

      <MerchantInfo info={info} showAssetName />

      {/* Payment Options */}
      <Text style={[styles.sectionTitle, { color: Theme['fg-100'] }]}>
        Select Payment Method
      </Text>

      <ScrollView style={styles.optionsContainer}>
        {options.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[styles.optionCard, { backgroundColor: Theme['bg-150'] }]}
            onPress={() => onSelectOption(option)}
          >
            <View style={styles.optionInfo}>
              {option.amount.display.iconUrl && (
                <Image
                  source={{ uri: option.amount.display.iconUrl }}
                  style={styles.optionIcon}
                />
              )}
              <View style={styles.optionDetails}>
                <Text style={[styles.optionAmount, { color: Theme['fg-100'] }]}>
                  {formatAmount(
                    option.amount.value,
                    option.amount.display.decimals,
                    2,
                  )}{' '}
                  {option.amount.display.assetSymbol}
                </Text>
                <Text
                  style={[styles.optionNetwork, { color: Theme['fg-200'] }]}
                >
                  {option.amount.display.networkName || 'Unknown Network'}
                </Text>
              </View>
            </View>
            <Text style={[styles.optionEta, { color: Theme['fg-200'] }]}>
              ~{Math.round(option.etaS / 60)} min
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footerContainer}>
        <ActionButton
          style={styles.closeButton}
          textStyle={styles.closeButtonText}
          onPress={onCancel}
          secondary
        >
          Cancel
        </ActionButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingTop: 20,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    maxHeight: 300,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  optionDetails: {
    flex: 1,
  },
  optionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionNetwork: {
    fontSize: 12,
    marginTop: 2,
  },
  optionEta: {
    fontSize: 12,
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    alignItems: 'center',
  },
  closeButton: {
    width: '100%',
    height: 48,
    borderRadius: 100,
  },
  closeButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
});
