import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import type { PaymentInfo, PaymentOption } from '@walletconnect/pay';

import { useTheme } from '@/hooks/useTheme';
import { ActionButton } from '@/components/ActionButton';
import { formatAmount } from './utils';
import { MerchantInfo } from './MerchantInfo';
import SvgCaretUpDown from '@/assets/CaretUpDown';
import { PresetsUtil } from '@/utils/PresetsUtil';
import { useCallback, useEffect, useState } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { sharedStyles } from './styles';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';

const OPTION_HEIGHT = 64;
const OPTION_GAP = 8;
const COLLAPSED_HEIGHT = 0;
const ANIMATION_DURATION = 250;

// ----- Option Item Component -----

interface OptionItemProps {
  option: PaymentOption;
  isSelected: boolean;
  onSelect: (option: PaymentOption) => void;
}

/**
 * Individual payment option item component.
 * Displays the amount, asset symbol, network name, and selection state.
 */
function OptionItem({ option, isSelected, onSelect }: OptionItemProps) {
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
    <TouchableOpacity
      onPress={() => onSelect(option)}
      style={[
        styles.optionItem,
        {
          backgroundColor: isSelected
            ? Theme['foreground-accent-primary-10-solid']
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
                  ? Theme['foreground-accent-primary-10-solid']
                  : Theme['foreground-secondary'],
              },
            ]}
          />
        </View>
        <Text variant="lg-400" color="text-primary">
          {amount} {option.amount.display.assetSymbol}
        </Text>
      </View>
      {isSelected && (
        <View
          style={[
            styles.radioOuter,
            { borderColor: Theme['bg-accent-primary'] },
          ]}
        >
          <View
            style={[
              styles.radioInner,
              { backgroundColor: Theme['bg-accent-primary'] },
            ]}
          />
        </View>
      )}
    </TouchableOpacity>
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
}

export function ConfirmPaymentView({
  options,
  selectedOption,
  isSigningPayment,
  onSelectOption,
  onApprove,
  info,
  isLoadingActions,
}: ConfirmPaymentViewProps) {
  const Theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const amount = formatAmount(
    info?.amount?.value || '0',
    info?.amount?.display?.decimals || 0,
    2,
  );

  const chainIcon = PresetsUtil.getIconLogoByName(
    selectedOption?.amount?.display?.networkName,
  );

  // Calculate max height based on number of options (max 4 visible, then scroll)
  const maxVisibleOptions = 4;
  const optionsCount = options.length;
  const visibleCount = Math.min(optionsCount, maxVisibleOptions);
  const calculatedHeight =
    visibleCount * OPTION_HEIGHT + (visibleCount - 1) * OPTION_GAP;

  const expandedHeight = useSharedValue(COLLAPSED_HEIGHT);

  useEffect(() => {
    expandedHeight.value = withTiming(
      isExpanded ? calculatedHeight : COLLAPSED_HEIGHT,
      {
        duration: ANIMATION_DURATION,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      },
    );
  }, [isExpanded, calculatedHeight, expandedHeight]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    height: expandedHeight.value,
    opacity: expandedHeight.value > 0 ? 1 : 0,
  }));

  const toggleExpanded = useCallback(() => {
    if (__DEV__) {
      console.log(
        '[ConfirmStep] Toggle pressed, options.length:',
        options.length,
      );
    }
    if (options.length > 1) {
      setIsExpanded(prev => !prev);
    }
  }, [options.length]);

  const handleSelectOption = useCallback(
    (option: PaymentOption) => {
      onSelectOption(option);
      setIsExpanded(false);
    },
    [onSelectOption],
  );

  return (
    <>
      <MerchantInfo info={info} />

      <View
        style={[
          styles.amountRow,
          { backgroundColor: Theme['foreground-primary'] },
        ]}
      >
        <Text variant="lg-400" color="text-tertiary">
          Amount
        </Text>
        <Text variant="lg-400" color="text-primary">
          ${amount}
        </Text>
      </View>

      <View
        style={[
          styles.payWithContainer,
          isExpanded && styles.payWithContainerExpanded,
          { backgroundColor: Theme['foreground-primary'] },
        ]}
      >
        <TouchableOpacity style={styles.payWithRow} onPress={toggleExpanded}>
          <Text variant="lg-400" color="text-tertiary">
            Pay with
          </Text>
          <View style={styles.optionCard}>
            <Text variant="lg-400" color="text-primary">
              {formatAmount(
                selectedOption?.amount?.value || '0',
                selectedOption?.amount?.display?.decimals || 0,
                2,
              )}{' '}
              {selectedOption?.amount?.display?.assetSymbol}
            </Text>
            {selectedOption?.amount?.display?.iconUrl && (
              <View>
                <Image
                  source={{
                    uri: selectedOption?.amount?.display?.iconUrl,
                    cache: 'force-cache',
                  }}
                  style={styles.selectedOptionIcon}
                />
                <Image
                  source={chainIcon}
                  style={[
                    styles.selectedOptionChainIcon,
                    { borderColor: Theme['foreground-primary'] },
                  ]}
                />
              </View>
            )}
            <SvgCaretUpDown
              width={20}
              height={20}
              fill={Theme['text-primary']}
            />
          </View>
        </TouchableOpacity>

        {/* Expandable Options List */}
        <Animated.View
          style={[styles.optionsContainer, animatedContainerStyle]}
        >
          <ScrollView
            style={styles.optionsScrollView}
            contentContainerStyle={styles.optionsScrollContent}
            showsVerticalScrollIndicator={optionsCount > maxVisibleOptions}
            nestedScrollEnabled
          >
            {options.map(option => (
              <OptionItem
                key={option.id}
                option={option}
                isSelected={option.id === selectedOption?.id}
                onSelect={handleSelectOption}
              />
            ))}
          </ScrollView>
        </Animated.View>
      </View>

      {/* Action Buttons */}
      <View style={sharedStyles.buttonContainer}>
        <ActionButton
          onPress={onApprove}
          disabled={isSigningPayment || isLoadingActions || !selectedOption}
          fullWidth
        >
          Pay ${amount}
        </ActionButton>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
    height: Spacing[13],
    borderRadius: BorderRadius[5],
    marginBottom: Spacing[2],
    marginTop: Spacing[4],
  },
  payWithContainer: {
    paddingHorizontal: Spacing[3],
    borderRadius: BorderRadius[5],
  },
  payWithContainerExpanded: {
    paddingBottom: Spacing[3],
  },
  payWithRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: Spacing[13],
    paddingHorizontal: Spacing[2],
  },
  optionsContainer: {
    maxHeight: 300,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
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
  },
  optionIconContainer: {
    width: Spacing[8],
    height: Spacing[8],
  },
  selectedOptionIcon: {
    width: Spacing[6],
    height: Spacing[6],
    borderRadius: BorderRadius.full,
  },
  selectedOptionChainIcon: {
    height: 14,
    width: 14,
    position: 'absolute',
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    right: -1,
    bottom: -2,
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
  radioOuter: {
    height: 22,
    width: 22,
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    height: Spacing[3],
    width: Spacing[3],
    borderRadius: BorderRadius.full,
  },
  optionsScrollView: {
    flex: 1,
  },
  optionsScrollContent: {
    gap: OPTION_GAP,
  },
});
