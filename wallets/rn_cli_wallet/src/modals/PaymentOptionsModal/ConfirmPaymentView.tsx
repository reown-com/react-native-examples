import {
  View,
  Text,
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
          backgroundColor: isSelected ? '#DCE9F3' : Theme['fg-secondary'],
        },
      ]}
    >
      <View style={styles.optionItemContent}>
        <View style={styles.optionIconContainer}>
          <Image
            source={{ uri: option.amount.display.iconUrl }}
            style={styles.optionIcon}
          />
          <Image
            source={chainIcon}
            style={[
              styles.optionChainIcon,
              {
                borderColor: isSelected ? '#DCE9F3' : Theme['fg-secondary'],
              },
            ]}
          />
        </View>
        <Text style={[styles.optionText, { color: Theme['fg-100'] }]}>
          {amount} {option.amount.display.assetSymbol}
        </Text>
      </View>
      {isSelected && (
        <View style={[styles.radioOuter, { borderColor: Theme['accent-100'] }]}>
          <View
            style={[
              styles.radioInner,
              { backgroundColor: Theme['accent-100'] },
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
    if (options.length >= 1) {
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
        style={[styles.amountRow, { backgroundColor: Theme['fg-primary'] }]}
      >
        <Text style={[styles.rowLabel, { color: Theme['text-tertiary'] }]}>
          Amount
        </Text>
        <Text style={[styles.amountValue, { color: Theme['fg-100'] }]}>
          ${amount}
        </Text>
      </View>

      <View
        style={[
          styles.payWithContainer,
          isExpanded && styles.payWithContainerExpanded,
          { backgroundColor: Theme['fg-primary'] },
        ]}
      >
        <TouchableOpacity style={styles.payWithRow} onPress={toggleExpanded}>
          <Text style={[styles.rowLabel, { color: Theme['text-tertiary'] }]}>
            Pay with
          </Text>
          <View key={selectedOption?.id} style={styles.optionCard}>
            <Text style={[styles.optionAmount, { color: Theme['fg-100'] }]}>
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
                  source={{ uri: selectedOption?.amount?.display?.iconUrl }}
                  style={styles.selectedOptionIcon}
                />
                <Image
                  source={chainIcon}
                  style={[
                    styles.selectedOptionChainIcon,
                    { borderColor: Theme['fg-primary'] },
                  ]}
                />
              </View>
            )}
            <SvgCaretUpDown width={20} height={20} fill={Theme['fg-100']} />
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
          style={sharedStyles.primaryButton}
          textStyle={sharedStyles.primaryButtonText}
          onPress={onApprove}
          disabled={isSigningPayment || isLoadingActions || !selectedOption}
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
    paddingHorizontal: 20,
    height: 64,
    borderRadius: 20,
    marginBottom: 8,
    marginTop: 16,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '400',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '400',
  },
  payWithContainer: {
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  payWithContainerExpanded: {
    paddingBottom: 20,
  },
  payWithRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 64,
  },
  optionsContainer: {
    maxHeight: 300,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    justifyContent: 'space-between',
  },
  optionItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionIconContainer: {
    width: 32,
    height: 32,
  },
  selectedOptionIcon: {
    width: 24,
    height: 24,
    borderRadius: 100,
  },
  selectedOptionChainIcon: {
    height: 14,
    width: 14,
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 2,
    right: -1,
    bottom: -2,
  },
  optionIcon: {
    width: 32,
    height: 32,
    borderRadius: 100,
  },
  optionChainIcon: {
    height: 18,
    width: 18,
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 2,
    right: -2,
    bottom: -2,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '400',
  },
  optionAmount: {
    fontSize: 16,
    fontWeight: '400',
  },
  radioOuter: {
    height: 22,
    width: 22,
    borderWidth: 1,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    height: 12,
    width: 12,
    borderRadius: 100,
  },
  optionsScrollView: {
    flex: 1,
  },
  optionsScrollContent: {
    gap: OPTION_GAP,
  },
});
