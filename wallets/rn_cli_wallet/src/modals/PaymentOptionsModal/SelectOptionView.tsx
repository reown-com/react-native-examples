import { View, Image, StyleSheet, ScrollView } from 'react-native';
import type { PaymentInfo, PaymentOption } from '@walletconnect/pay';
import { useTheme } from '@/hooks/useTheme';
import { FadeGradient } from '@/components/FadeGradient';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';
import { formatAmount, getCurrencySymbol } from './utils';
import type { PaymentOptionWithCollectData } from '@/utils/TypesUtil';
import { OptionItem, OPTION_HEIGHT } from '@/components/OptionItem';
import Info from '@/assets/Info';
import SvgSelectToken from '@/assets/SelectToken';
import type { TransactionFeeEstimate } from '@/utils/PaymentTransactionUtil';

const OPTION_GAP = 8;
const MAX_VISIBLE_OPTIONS = 4;

interface SelectOptionViewProps {
  options: PaymentOption[];
  selectedOption: PaymentOption | null;
  onOptionPress: (option: PaymentOption) => void;
  onInfoPress: () => void;
  info?: PaymentInfo;
  collectDataCompletedIds: string[];
  optionFeeEstimatesById: Record<string, TransactionFeeEstimate | null>;
  optionFeeEstimateStatusById: Record<
    string,
    'idle' | 'loading' | 'ready' | 'error'
  >;
}

export function SelectOptionView({
  options,
  onOptionPress,
  onInfoPress,
  info,
  collectDataCompletedIds,
  optionFeeEstimatesById,
  optionFeeEstimateStatusById,
}: SelectOptionViewProps) {
  const Theme = useTheme();
  const visibleCount = options.length;
  const scrollable = visibleCount > MAX_VISIBLE_OPTIONS;
  const listMaxHeight =
    MAX_VISIBLE_OPTIONS * OPTION_HEIGHT +
    (MAX_VISIBLE_OPTIONS - 1) * OPTION_GAP +
    Spacing[4] * 2;

  const amount = formatAmount(
    info?.amount?.value || '0',
    info?.amount?.display?.decimals || 0,
    2,
  );
  const currencySymbol = getCurrencySymbol(info?.amount?.display?.assetSymbol);

  return (
    <>
      <View style={styles.header}>
        <SvgSelectToken height={58} width={58} />
        <Text variant="h6-400" color="text-primary">
          Select a token to pay with
        </Text>
      </View>

      <View>
        {scrollable && (
          <FadeGradient position="top" style={{ top: Spacing[3] }} />
        )}
        <ScrollView
          style={[
            styles.optionsList,
            scrollable && { maxHeight: listMaxHeight },
          ]}
          contentContainerStyle={styles.optionsListContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {options.map((option, index) => {
            const hasCollectData =
              !!(option as PaymentOptionWithCollectData).collectData?.url &&
              !collectDataCompletedIds.includes(option.id);

            return (
              <OptionItem
                key={option.id}
                option={option}
                gasCostEstimate={
                  optionFeeEstimatesById[option.id]?.display ?? undefined
                }
                isEstimatingApprovalGas={
                  optionFeeEstimateStatusById[option.id] === 'loading'
                }
                testID={`pay-option-${index}`}
                renderIconRight={
                  <Info height={20} width={20} fill={Theme['icon-invert']} />
                }
                onIconRightPress={hasCollectData ? onInfoPress : undefined}
                onPress={() => onOptionPress(option)}
              />
            );
          })}
        </ScrollView>
        {scrollable && <FadeGradient position="bottom" />}
      </View>
      <View style={styles.bottomContainer}>
        <Text variant="lg-400" color="text-secondary">
          Pay {currencySymbol}
          {amount} to {info?.merchant?.name}
        </Text>
        {info?.merchant?.iconUrl ? (
          <Image
            source={{ uri: info.merchant.iconUrl, cache: 'force-cache' }}
            style={[
              styles.merchantIcon,
              { backgroundColor: Theme['foreground-tertiary'] },
            ]}
          />
        ) : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing[4],
    alignItems: 'center',
  },
  optionsList: {
    marginTop: Spacing[3],
    flexGrow: 0,
  },
  optionsListContent: {
    gap: OPTION_GAP,
    paddingVertical: Spacing[4],
  },
  bottomContainer: {
    flexDirection: 'row',
    marginTop: Spacing[5],
    marginBottom: Spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
  },
  merchantIcon: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius[1],
  },
});
