import { Text } from './Text';
import { Image, StyleSheet, View } from 'react-native';
import { Button } from './Button';
import { PresetsUtil } from '@/utils/PresetsUtil';
import { formatAmount } from '@/modals/PaymentOptionsModal/utils';
import { useTheme } from '@/hooks/useTheme';
import type { PaymentOption } from '@walletconnect/pay';
import { BorderRadius, Spacing } from '@/utils/ThemeUtil';
import GasPump from '@/assets/GasPump';
import { Shimmer } from './Shimmer';

export const OPTION_HEIGHT = 72;
const SMALL_AMOUNT_DECIMALS = 6;

interface OptionItemProps {
  option: PaymentOption;
  renderIconRight?: React.ReactNode;
  gasCostEstimate?: string;
  isEstimatingApprovalGas?: boolean;
  onPress?: (option: PaymentOption) => void;
  onIconRightPress?: () => void;
  testID?: string;
  rightIconTestID?: string;
}

function formatOptionAmount(value: string, decimals: number): string {
  const amount = formatAmount(value, decimals, 2);
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount >= 0.01) {
    return amount;
  }

  if (numericAmount > 0 && numericAmount < 10 ** -SMALL_AMOUNT_DECIMALS) {
    return `<${(10 ** -SMALL_AMOUNT_DECIMALS).toFixed(SMALL_AMOUNT_DECIMALS)}`;
  }

  return numericAmount.toFixed(SMALL_AMOUNT_DECIMALS).replace(/\.?0+$/, '');
}

export function OptionItem({
  option,
  renderIconRight,
  onIconRightPress,
  gasCostEstimate,
  isEstimatingApprovalGas,
  onPress,
  testID,
  rightIconTestID,
}: OptionItemProps) {
  const Theme = useTheme();

  const amount = formatOptionAmount(
    option.amount.value,
    option.amount.display.decimals,
  );

  const chainIcon = PresetsUtil.getIconLogoByName(
    option.amount.display.networkName,
  );
  const tokenIconUrl = option.amount.display.iconUrl?.trim();
  const hasTokenIcon = !!tokenIconUrl;
  const mainIconSource = hasTokenIcon ? { uri: tokenIconUrl } : chainIcon;

  return (
    <Button
      onPress={() => onPress?.(option)}
      testID={testID}
      disabled={!onPress}
      accessibilityLabel={
        option.amount.display?.networkName?.toLowerCase() || ''
      }
      style={[
        styles.optionItem,
        { backgroundColor: Theme['foreground-primary'] },
      ]}
    >
      <View style={styles.optionItemContent}>
        <View style={styles.contentLeftContainer}>
          <View style={styles.optionIconContainer}>
            {mainIconSource && (
              <Image source={mainIconSource} style={styles.optionIcon} />
            )}
            {hasTokenIcon && chainIcon && (
              <Image
                source={chainIcon}
                style={[
                  styles.optionChainIcon,
                  {
                    borderColor: Theme['foreground-secondary'],
                  },
                ]}
              />
            )}
          </View>
          <Text variant="lg-400" color="text-primary">
            {amount} {option.amount.display.assetSymbol}
          </Text>
        </View>
        <View style={styles.contentRightContainer}>
          {gasCostEstimate && (
            <View style={styles.gasFeeContainer}>
              <Text variant="lg-400" color="text-secondary">
                +{gasCostEstimate}{' '}
              </Text>
              <GasPump height={18} width={18} fill={Theme['icon-default']} />
            </View>
          )}
          {!gasCostEstimate && isEstimatingApprovalGas && (
            <Shimmer width={70} height={16} borderRadius={BorderRadius['1']} />
          )}
          {renderIconRight && onIconRightPress && (
            <Button
              testID={rightIconTestID || 'pay-option-icon-right'}
              onPress={onIconRightPress}
              style={[
                {
                  borderColor: Theme['border-secondary'],
                },
                styles.iconRightContainer,
              ]}
            >
              {renderIconRight}
            </Button>
          )}
        </View>
      </View>
    </Button>
  );
}

const styles = StyleSheet.create({
  optionItem: {
    height: OPTION_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
    borderRadius: BorderRadius[4],
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  optionItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
  },
  optionIconContainer: {
    width: Spacing[8],
    height: Spacing[8],
  },
  optionIcon: {
    width: Spacing[8],
    height: Spacing[8],
    borderRadius: BorderRadius.full,
  },
  optionChainIcon: {
    height: 18,
    width: 18,
    position: 'absolute',
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    right: -2,
    bottom: -2,
  },
  contentLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  contentRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
  },
  iconRightContainer: {
    borderWidth: 1,
    height: 38,
    width: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius[3],
  },
  gasFeeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
