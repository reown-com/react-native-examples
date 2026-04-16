import { View, Image, StyleSheet } from 'react-native';
import type { Action, PaymentInfo, PaymentOption } from '@walletconnect/pay';
import Config from 'react-native-config';

import { useTheme } from '@/hooks/useTheme';
import { ActionButton } from '@/components/ActionButton';
import { Text } from '@/components/Text';
import { MerchantInfo } from './MerchantInfo';
import { PresetsUtil } from '@/utils/PresetsUtil';
import { EIP155_SIGNING_METHODS } from '@/constants/Eip155';
import { formatAmount, getCurrencySymbol } from './utils';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';

const isTestMode = Config.ENV_TEST_MODE === 'true';

interface ReviewPaymentViewProps {
  selectedOption: PaymentOption;
  info?: PaymentInfo;
  paymentActions?: readonly Action[] | null;
  approvalGasEstimate?: string | null;
  isEstimatingApprovalGas?: boolean;
  isLoadingActions: boolean;
  isSigningPayment: boolean;
  isRevokingPermit?: boolean;
  onPay: () => void;
  onRevokePermitApproval?: () => void;
}

export function ReviewPaymentView({
  selectedOption,
  info,
  paymentActions,
  approvalGasEstimate,
  isEstimatingApprovalGas = false,
  isLoadingActions,
  isSigningPayment,
  isRevokingPermit = false,
  onPay,
  onRevokePermitApproval,
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
  const requiresTokenApproval = (paymentActions || []).some(
    action =>
      action.walletRpc?.method === EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION,
  );
  const networkName =
    selectedOption.amount.display.networkName || 'selected network';
  const tokenSymbol = selectedOption.amount.display.assetSymbol || 'token';
  const gasCostEstimate = approvalGasEstimate || 'Network fee set by wallet';
  const showRevokePermitButton = isTestMode && !!onRevokePermitApproval && !requiresTokenApproval;

  return (
    <>
      <MerchantInfo info={info} />

      <View style={styles.itemContainer}>
        <View
          style={[
            styles.item,
            { backgroundColor: Theme['foreground-primary'] },
          ]}
          testID={`pay-review-token-${selectedOption.amount.display?.networkName?.toLowerCase() || ''}`}
          accessibilityLabel={selectedOption.amount.display?.networkName?.toLowerCase() || ''}
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

      {requiresTokenApproval ? (
        <>

            <Text
              style={styles.approvalNote}
              variant="sm-400"
              color="text-tertiary"
            >
              {`* This is your first ${tokenSymbol} Payment on ${networkName}, a one-time approval is required. Estimated cost: `}
              <Text style={styles.approvalNote} variant="sm-400" color="text-tertiary">
                {isEstimatingApprovalGas ? 'Loading...' : gasCostEstimate}
              </Text>
            </Text>

        </>
      ) : null}

      {showRevokePermitButton ? (
        <ActionButton
          variant="secondary"
          onPress={onRevokePermitApproval!}
          loading={isRevokingPermit}
          disabled={isLoadingActions || isSigningPayment}
          fullWidth
          style={styles.revokeButton}
          testID="pay-button-revoke-permit2"
          accessibilityLabel="Revoke Permit2 approval"
        >
          Revoke Permit2 approval
        </ActionButton>
      ) : null}

      <View style={styles.buttonContainer}>
        <ActionButton
          onPress={onPay}
          disabled={isSigningPayment}
          silentDisabled={isLoadingActions}
          fullWidth
          testID="pay-button-pay"
          accessibilityLabel={`Pay ${currencySymbol}${payAmount}`}
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
  approvalNote: {
    marginTop: Spacing[2],
  },
  revokeButton: {
    marginTop: Spacing[3],
  },
});
