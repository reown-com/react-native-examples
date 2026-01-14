import { View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';
import type { PaymentOption } from '@walletconnect/pay';

import { useTheme } from '@/hooks/useTheme';
import { ActionButton } from '@/components/ActionButton';
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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  confirmationContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  confirmIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 12,
  },
  confirmAmount: {
    fontSize: 28,
    fontWeight: '700',
  },
  confirmNetwork: {
    fontSize: 14,
    marginTop: 4,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  actionsLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  confirmButtonsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 8,
  },
  approveButton: {
    width: '100%',
    height: 48,
    borderRadius: 100,
  },
  approveButtonText: {
    fontWeight: '600',
    fontSize: 16,
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
