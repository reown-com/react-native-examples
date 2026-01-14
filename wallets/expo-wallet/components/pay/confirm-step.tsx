import { BorderRadius, Spacing } from '@/constants/spacing';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatPayAmount, PaymentInfo, PaymentOption } from '@/lib/pay';
import { getChainIcon } from '@/utils/chain';
import { StyleSheet, View, Pressable, ScrollView } from 'react-native';
import { Button } from '@/components/primitives/button';
import { Text } from '@/components/primitives/text';
import { MerchantCard } from './merchant-card';
import { Image } from 'expo-image';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useCallback, useState, useEffect } from 'react';

interface ConfirmStepProps {
  paymentInfo: PaymentInfo;
  options: PaymentOption[];
  selectedOption: PaymentOption;
  onSelectOption: (option: PaymentOption) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const OPTION_HEIGHT = 64;
const OPTION_GAP = 8;
const COLLAPSED_HEIGHT = 0;
const ANIMATION_DURATION = 250;

// Helper function to get a color for token icon based on symbol
function getTokenColor(symbol: string): string {
  const colors: Record<string, string> = {
    USDC: '#2775CA',
    USDT: '#26A17B',
    ETH: '#627EEA',
    WETH: '#627EEA',
    DAI: '#F5AC37',
    MATIC: '#8247E5',
    BNB: '#F3BA2F',
    AVAX: '#E84142',
    FTM: '#1969FF',
    OP: '#FF0420',
    ARB: '#28A0F0',
  };
  return colors[symbol.toUpperCase()] || '#6B7280';
}

export function ConfirmStep({
  paymentInfo,
  options,
  selectedOption,
  onSelectOption,
  onConfirm,
  isLoading = false,
}: ConfirmStepProps) {
  const cardBackgroundColor = useThemeColor('foreground-primary');
  const selectedBorderColor = useThemeColor('border-accent-primary');
  const caretColor = useThemeColor('icon-default');
  const optionSelectedBackgroundColor = useThemeColor(
    'foreground-accent-primary-10',
  );

  const [isExpanded, setIsExpanded] = useState(false);

  // Debug logging
  if (__DEV__) {
    console.log('[ConfirmStep] Options count:', options.length);
  }
  const expandedHeight = useSharedValue(COLLAPSED_HEIGHT);

  const formattedAmount = formatPayAmount(paymentInfo.amount);
  const formattedPayAmount = formatPayAmount(selectedOption.amount);

  // Calculate max height based on number of options (max 4 visible, then scroll)
  const maxVisibleOptions = 4;
  const optionsCount = options.length;
  const visibleCount = Math.min(optionsCount, maxVisibleOptions);
  const calculatedHeight =
    visibleCount * OPTION_HEIGHT + (visibleCount - 1) * OPTION_GAP;

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
      setIsExpanded((prev) => !prev);
    }
  }, [options.length]);

  const handleSelectOption = useCallback(
    (option: PaymentOption) => {
      onSelectOption(option);
      setIsExpanded(false);
    },
    [onSelectOption],
  );

  const renderOptionItem = (option: PaymentOption, isSelected: boolean) => {
    const optionAmount = formatPayAmount(option.amount);

    return (
      <Pressable
        key={option.id}
        onPress={() => handleSelectOption(option)}
        style={({ pressed }) => [
          styles.optionItem,
          {
            backgroundColor: isSelected
              ? optionSelectedBackgroundColor
              : cardBackgroundColor,
            opacity: pressed ? 0.7 : 1,
          },
        ]}>
        <View style={styles.optionLeft}>
          <View
            style={[
              styles.tokenIconLarge,
              {
                backgroundColor: getTokenColor(
                  option.amount.display.assetSymbol,
                ),
              },
            ]}>
            {option.amount.display.iconUrl ? (
              <View>
                <Image
                  source={{ uri: option.amount.display.iconUrl }}
                  style={styles.tokenIconImage}
                />
                {getChainIcon(option.actions[0]?.walletRpc.chainId) && (
                  <Image
                    source={getChainIcon(option.actions[0]?.walletRpc.chainId)}
                    style={[
                      styles.chainIconImage,
                      { borderColor: cardBackgroundColor },
                    ]}
                  />
                )}
              </View>
            ) : (
              <Text
                fontSize={14}
                color="text-invert"
                center
                type="defaultSemiBold">
                {option.amount.display.assetSymbol.charAt(0)}
              </Text>
            )}
          </View>
          <View style={styles.optionDetails}>
            <Text fontSize={16} lineHeight={20} type="defaultSemiBold">
              {optionAmount}
            </Text>
            {option.amount.display.networkName && (
              <Text fontSize={12} lineHeight={16} color="text-tertiary">
                on {option.amount.display.networkName}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.optionRight}>
          {isSelected && (
            <View
              style={[
                styles.checkmarkOuter,
                { borderColor: selectedBorderColor },
              ]}>
              <View
                style={[
                  styles.checkmarkInner,
                  { backgroundColor: selectedBorderColor },
                ]}
              />
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      bounces={false}>
      <View style={styles.container}>
        <MerchantCard
          merchant={paymentInfo.merchant}
          formattedAmount={formattedAmount}
        />

        {/* Payment Details */}
        <View style={styles.detailsContainer}>
          {/* Amount Row */}
          <View
            style={[
              styles.detailRow,
              { backgroundColor: cardBackgroundColor },
            ]}>
            <Text fontSize={16} lineHeight={20} color="text-tertiary">
              Amount
            </Text>
            <Text fontSize={16} lineHeight={20}>
              {formattedAmount}
            </Text>
          </View>

          {/* Pay With Row - Expandable */}
          <Pressable
            onPress={toggleExpanded}
            style={[
              styles.detailRow,
              { backgroundColor: cardBackgroundColor },
            ]}>
            <Text fontSize={16} lineHeight={20} color="text-tertiary">
              Pay with
            </Text>
            <View style={styles.payWithContainer}>
              <Text fontSize={16} lineHeight={20}>
                {formattedPayAmount}
              </Text>
              {/* Token icon */}
              <View
                style={[
                  styles.tokenIcon,
                  {
                    backgroundColor: getTokenColor(
                      selectedOption.amount.display.assetSymbol,
                    ),
                  },
                ]}>
                {selectedOption.amount.display.iconUrl ? (
                  <Image
                    source={{ uri: selectedOption.amount.display.iconUrl }}
                    style={styles.tokenIconImageSmall}
                  />
                ) : (
                  <Text fontSize={10} color="text-invert" center>
                    {selectedOption.amount.display.assetSymbol.charAt(0)}
                  </Text>
                )}
              </View>
              {/* Caret icon - only show if multiple options (no rotation per Figma) */}
              {options.length > 1 && (
                <Image
                  source={require('@/assets/icons/caret-up-down.png')}
                  style={[styles.caretIcon, { tintColor: caretColor }]}
                />
              )}
            </View>
          </Pressable>

          {/* Expandable Options List */}
          <Animated.View
            style={[styles.optionsContainer, animatedContainerStyle]}>
            <ScrollView
              style={styles.optionsScrollView}
              contentContainerStyle={styles.optionsScrollContent}
              showsVerticalScrollIndicator={optionsCount > maxVisibleOptions}
              nestedScrollEnabled>
              {options.map((option) =>
                renderOptionItem(option, option.id === selectedOption.id),
              )}
            </ScrollView>
          </Animated.View>
        </View>

        {/* Pay Button */}
        <Button
          onPress={onConfirm}
          type="primary"
          text={`Pay ${formattedAmount}`}
          style={styles.button}
          disabled={isLoading || isExpanded}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    paddingHorizontal: Spacing['spacing-5'],
    gap: Spacing['spacing-5'],
  },
  detailsContainer: {
    gap: Spacing['spacing-2'],
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing['spacing-4'],
    paddingVertical: Spacing['spacing-4'],
    borderRadius: BorderRadius['3'],
  },
  payWithContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['spacing-2'],
  },
  tokenIcon: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenIconLarge: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenIconImage: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
  },
  tokenIconImageSmall: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
  },
  caretIcon: {
    width: 20,
    height: 20,
  },
  optionsContainer: {
    overflow: 'hidden',
    borderRadius: BorderRadius['3'],
  },
  optionsScrollView: {
    flex: 1,
  },
  optionsScrollContent: {
    gap: OPTION_GAP,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing['spacing-3'],
    paddingVertical: Spacing['spacing-3'],
    borderRadius: BorderRadius['3'],
    height: OPTION_HEIGHT,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['spacing-3'],
    flex: 1,
  },
  optionDetails: {
    flex: 1,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['spacing-2'],
  },
  checkmarkOuter: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkInner: {
    width: 12,
    height: 12,
    borderRadius: BorderRadius.full,
  },
  button: {
    marginTop: Spacing['spacing-2'],
  },
  chainIconImage: {
    width: 18,
    height: 18,
    borderRadius: BorderRadius.full,
    position: 'absolute',
    borderWidth: 2,
    bottom: -2,
    right: -2,
  },
});
