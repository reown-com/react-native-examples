import { View, Text, Image, ActivityIndicator } from 'react-native';
import type { PaymentOption } from '@walletconnect/pay';

import { useTheme } from '@/hooks/useTheme';
import { ActionButton } from '@/components/ActionButton';
import { styles } from './styles';
import { formatAmount } from './utils';

interface ConfirmPaymentViewProps {
  selectedOption: PaymentOption;
  paymentActions: any[] | null;
  isLoadingActions: boolean;
  isSigningPayment: boolean;
  error: string | null;
  onApprove: () => void;
  onBack: () => void;
}

export function ConfirmPaymentView({
  selectedOption,
  paymentActions,
  isLoadingActions,
  isSigningPayment,
  error,
  onApprove,
  onBack,
}: ConfirmPaymentViewProps) {
  const Theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: Theme['bg-175'] }]}>
      <Text style={[styles.headerTitle, { color: Theme['fg-100'] }]}>
        Confirm Payment
      </Text>

      {/* Selected Option Info */}
      <View style={styles.confirmationContainer}>
        {selectedOption.amount.display.iconUrl && (
          <Image
            source={{ uri: selectedOption.amount.display.iconUrl }}
            style={styles.confirmIcon}
          />
        )}
        <Text style={[styles.confirmAmount, { color: Theme['fg-100'] }]}>
          {formatAmount(
            selectedOption.amount.value,
            selectedOption.amount.display.decimals,
            2,
          )}{' '}
          {selectedOption.amount.display.assetSymbol}
        </Text>
        <Text style={[styles.confirmNetwork, { color: Theme['fg-200'] }]}>
          on {selectedOption.amount.display.networkName || 'Unknown Network'}
        </Text>
      </View>

      {/* Loading Actions */}
      {isLoadingActions && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme['accent-100']} />
          <Text style={[styles.loadingText, { color: Theme['fg-100'] }]}>
            Preparing payment...
          </Text>
        </View>
      )}

      {/* Actions Error */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: Theme['error-100'] }]}>
            {error}
          </Text>
        </View>
      )}

      {/* Actions Ready */}
      {paymentActions && !isLoadingActions && (
        <View style={styles.actionsContainer}>
          <Text style={[styles.actionsLabel, { color: Theme['fg-200'] }]}>
            This will sign a transfer authorization for this payment.
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.confirmButtonsContainer}>
        {paymentActions && !isLoadingActions && (
          <ActionButton
            style={styles.approveButton}
            textStyle={styles.approveButtonText}
            onPress={onApprove}
            disabled={isSigningPayment}
          >
            {isSigningPayment ? 'Signing...' : 'Approve & Sign'}
          </ActionButton>
        )}
        <ActionButton
          style={styles.closeButton}
          textStyle={styles.closeButtonText}
          onPress={onBack}
          secondary
          disabled={isSigningPayment}
        >
          Back
        </ActionButton>
      </View>
    </View>
  );
}
