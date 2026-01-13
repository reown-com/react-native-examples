import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import type { PaymentOption, PaymentInfo } from '@walletconnect/pay';

import { useTheme } from '@/hooks/useTheme';
import { ActionButton } from '@/components/ActionButton';
import { styles } from './styles';
import { formatAmount } from './utils';

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

      {/* Merchant Info */}
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

      {/* Amount */}
      {info?.amount && (
        <View style={styles.amountContainer}>
          <Text style={[styles.amountValue, { color: Theme['fg-100'] }]}>
            ${formatAmount(info.amount.value, info.amount.display.decimals, 2)}
          </Text>
          <Text style={[styles.amountLabel, { color: Theme['fg-200'] }]}>
            {info.amount.display.assetName}
          </Text>
        </View>
      )}

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
