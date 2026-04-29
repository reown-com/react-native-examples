import { View, StyleSheet } from 'react-native';
import type { PaymentInfo, PaymentOption } from '@walletconnect/pay';

import { useTheme } from '@/hooks/useTheme';
import { ActionButton } from '@/components/ActionButton';
import { Text } from '@/components/Text';
import { MerchantInfo } from './MerchantInfo';

import { formatAmount, getCurrencySymbol } from './utils';
import { Spacing } from '@/utils/ThemeUtil';
import { OptionItem } from '@/components/OptionItem';
import Pencil from '@/assets/Pencil';
import type { TransactionFeeEstimate } from '@/utils/PaymentTransactionUtil';

interface ReviewPaymentViewProps {
  selectedOption: PaymentOption;
  info?: PaymentInfo;
  requiresApproval: boolean;
  approvalGasEstimate?: TransactionFeeEstimate | null;
  isEstimatingApprovalGas?: boolean;
  onPay: () => void;
  onChangeOption?: () => void;
  onGasFeePress?: () => void;
}

function toDecimalNumber(value: string, decimals: number): number | null {
  const formatted = formatAmount(value, decimals);
  const amount = Number(formatted);
  return Number.isFinite(amount) ? amount : null;
}

export function ReviewPaymentView({
  selectedOption,
  info,
  requiresApproval,
  approvalGasEstimate,
  isEstimatingApprovalGas,
  onPay,
  onChangeOption,
  onGasFeePress,
}: ReviewPaymentViewProps) {
  const Theme = useTheme();

  const payAmount = formatAmount(
    info?.amount?.value || '0',
    info?.amount?.display?.decimals || 0,
    2,
  );
  const paymentCurrency = info?.amount?.display?.assetSymbol?.toUpperCase();
  const currencySymbol = getCurrencySymbol(paymentCurrency);

  const gasCostEstimate = approvalGasEstimate?.display || '';
  const fiatFeeValue = approvalGasEstimate?.fiatValue ?? null;
  const basePaymentAmount = toDecimalNumber(
    info?.amount?.value || '0',
    info?.amount?.display?.decimals || 0,
  );
  const canIncludeGasInTotal =
    basePaymentAmount !== null &&
    fiatFeeValue !== null &&
    approvalGasEstimate?.fiatCurrency === paymentCurrency;
  const totalPayAmount = canIncludeGasInTotal
    ? (basePaymentAmount + fiatFeeValue).toFixed(2)
    : payAmount;

  return (
    <>
      <MerchantInfo info={info} />

      <View style={styles.itemContainer}>
        <OptionItem
          option={selectedOption}
          gasCostEstimate={gasCostEstimate}
          isEstimatingApprovalGas={isEstimatingApprovalGas}
          renderIconRight={
            <Pencil height={20} width={20} fill={Theme['icon-invert']} />
          }
          onIconRightPress={onChangeOption}
          testID={`pay-review-token-${
            selectedOption.amount.display?.networkName?.toLowerCase() || ''
          }`}
        />
      </View>

      <View style={styles.buttonContainer}>
        <ActionButton
          onPress={onPay}
          fullWidth
          testID="pay-button-pay"
          accessibilityLabel={`Pay ${currencySymbol}${totalPayAmount}`}
        >
          {`Pay ${currencySymbol}${totalPayAmount}`}{' '}
          {canIncludeGasInTotal && (
            <Text variant="sm-400" color="text-invert">
              (incl. gas fee)
            </Text>
          )}
        </ActionButton>
        {requiresApproval && approvalGasEstimate && onGasFeePress && (
          <Text
            variant="lg-400"
            color="text-secondary"
            center
            underline
            style={styles.feeText}
            onPress={onGasFeePress}
          >
            Why does {selectedOption.amount.display.assetSymbol?.toUpperCase()}{' '}
            require a gas fee?
          </Text>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    marginTop: Spacing[5],
    marginBottom: Spacing[2],
  },
  buttonContainer: {
    marginTop: Spacing[5],
  },
  feeText: {
    marginTop: Spacing[3],
  },
});
