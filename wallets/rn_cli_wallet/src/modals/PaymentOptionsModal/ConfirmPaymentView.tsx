import { View, Image, StyleSheet, ScrollView } from 'react-native';
import type { PaymentInfo, PaymentOption } from '@walletconnect/pay';

import { useTheme } from '@/hooks/useTheme';
import { ActionButton } from '@/components/ActionButton';
import { formatAmount, getCurrencySymbol } from './utils';
import { MerchantInfo } from './MerchantInfo';
import { PresetsUtil } from '@/utils/PresetsUtil';
import { useCallback } from 'react';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import type { PaymentOptionWithCollectData } from '@/utils/TypesUtil';

const OPTION_GAP = 8;
const MAX_VISIBLE_OPTIONS = 4;
const OPTION_HEIGHT = 64;

// ----- Option Item Component -----

interface OptionItemProps {
  option: PaymentOption;
  isSelected: boolean;
  hasCollectData: boolean;
  onSelect: (option: PaymentOption) => void;
}

function OptionItem({ option, isSelected, hasCollectData, onSelect }: OptionItemProps) {
  const Theme = useTheme();

  const amount = formatAmount(
    option.amount.value,
    option.amount.display.decimals,
    2,
  );

  const chainIcon = PresetsUtil.getIconLogoByName(
    option.amount.display.networkName,
  );

  return (
    <Button
      onPress={() => onSelect(option)}
      style={[
        styles.optionItem,
        {
          backgroundColor: isSelected
            ? Theme['foreground-accent-primary-10']
            : Theme['foreground-secondary'],
        },
      ]}
    >
      <View style={styles.optionItemContent}>
        <View style={styles.optionIconContainer}>
          <Image
            source={{
              uri: option.amount.display.iconUrl,
              cache: 'force-cache',
            }}
            style={styles.optionIcon}
          />
          <Image
            source={chainIcon}
            style={[
              styles.optionChainIcon,
              {
                borderColor: isSelected
                  ? Theme['foreground-accent-primary-10']
                  : Theme['foreground-secondary'],
              },
            ]}
          />
        </View>
        <Text variant="lg-400" color="text-primary">
          {amount} {option.amount.display.assetSymbol}
        </Text>
        {hasCollectData && (
          <View
            style={[
              styles.collectDataPill,
              { backgroundColor: Theme['foreground-accent-secondary-10'] },
            ]}
          >
            <Text variant="sm-500" color="text-accent-secondary">
              Info required
            </Text>
          </View>
        )}
      </View>
    </Button>
  );
}

// ----- Confirm Payment View -----

interface ConfirmPaymentViewProps {
  options: PaymentOption[];
  selectedOption: PaymentOption | null;
  isLoadingActions: boolean;
  isSigningPayment: boolean;
  error: string | null;
  onSelectOption: (option: PaymentOption) => void;
  onApprove: () => void;
  info?: PaymentInfo;
  showNextButton: boolean;
  collectDataCompletedIds: string[];
}

export function ConfirmPaymentView({
  options,
  selectedOption,
  isSigningPayment,
  onSelectOption,
  onApprove,
  info,
  isLoadingActions,
  showNextButton,
  collectDataCompletedIds,
}: ConfirmPaymentViewProps) {
  const Theme = useTheme();

  const payAmount = formatAmount(
    info?.amount?.value || '0',
    info?.amount?.display?.decimals || 0,
    2,
  );
  const currencySymbol = getCurrencySymbol(info?.amount?.display?.assetSymbol);

  const selectedCompleted =
    selectedOption && collectDataCompletedIds.includes(selectedOption.id);
  const visibleOptions = selectedCompleted
    ? options.filter(o => o.id === selectedOption.id)
    : options;

  const visibleCount = visibleOptions.length;
  const scrollable = visibleCount > MAX_VISIBLE_OPTIONS;
  const listMaxHeight =
    MAX_VISIBLE_OPTIONS * OPTION_HEIGHT + (MAX_VISIBLE_OPTIONS - 1) * OPTION_GAP;

  const handleSelectOption = useCallback(
    (option: PaymentOption) => {
      onSelectOption(option);
    },
    [onSelectOption],
  );

  return (
    <>
      <MerchantInfo info={info} />

      <ScrollView
        style={[styles.optionsList, scrollable && { maxHeight: listMaxHeight }]}
        contentContainerStyle={styles.optionsListContent}
        showsVerticalScrollIndicator={scrollable}
        nestedScrollEnabled
      >
        {visibleOptions.map(option => (
          <OptionItem
            key={option.id}
            option={option}
            isSelected={option.id === selectedOption?.id}
            hasCollectData={
              !!(option as PaymentOptionWithCollectData).collectData?.url &&
              !collectDataCompletedIds.includes(option.id)
            }
            onSelect={handleSelectOption}
          />
        ))}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <ActionButton
          onPress={onApprove}
          disabled={isSigningPayment || isLoadingActions || !selectedOption}
          fullWidth
        >
          {showNextButton ? 'Next' : `Pay ${currencySymbol}${payAmount}`}
        </ActionButton>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  optionsList: {
    marginTop: Spacing[4],
    flexGrow: 0,
  },
  optionsListContent: {
    gap: OPTION_GAP,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[5],
    borderRadius: BorderRadius[4],
    justifyContent: 'space-between',
  },
  optionItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    flex: 1,
  },
  collectDataPill: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginLeft: 'auto',
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
  buttonContainer: {
    marginTop: Spacing[5],
    marginBottom: Spacing[2],
    gap: Spacing[2],
  },
});
