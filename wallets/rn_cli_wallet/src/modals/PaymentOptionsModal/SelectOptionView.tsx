import { View, Image, StyleSheet, ScrollView } from 'react-native';
import type { PaymentInfo, PaymentOption } from '@walletconnect/pay';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { ActionButton } from '@/components/ActionButton';
import { FadeGradient } from '@/components/FadeGradient';
import { MerchantInfo } from './MerchantInfo';
import { PresetsUtil } from '@/utils/PresetsUtil';
import { useCallback, useEffect } from 'react';
import { Spacing, BorderRadius, FontFamily } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { formatAmount } from './utils';
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

const ANIMATION_DURATION = 250;

function OptionItem({
  option,
  isSelected,
  hasCollectData,
  onSelect,
}: OptionItemProps) {
  const Theme = useTheme();
  const progress = useSharedValue(isSelected ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isSelected ? 1 : 0, {
      duration: ANIMATION_DURATION,
    });
  }, [isSelected, progress]);

  const animatedCardStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [
        Theme['foreground-primary'],
        Theme['foreground-accent-primary-10-solid'],
      ],
    ),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [Theme['foreground-primary'], Theme['border-accent-primary']],
    ),
  }));

  const animatedPillStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [
        Theme['foreground-tertiary'],
        Theme['foreground-accent-primary-90-solid'],
      ],
    ),
  }));

  const animatedPillTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      progress.value,
      [0, 1],
      [Theme['text-primary'], Theme['text-invert']],
    ),
  }));

  const amount = formatAmount(
    option.amount.value,
    option.amount.display.decimals,
    2,
  );

  const chainIcon = PresetsUtil.getIconLogoByName(
    option.amount.display.networkName,
  );

  return (
    <Button onPress={() => onSelect(option)} style={styles.optionItem}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.optionItemOverlay,
          animatedCardStyle,
        ]}
      />
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
          <Animated.View style={[styles.collectDataPill, animatedPillStyle]}>
            <Animated.Text style={[styles.pillText, animatedPillTextStyle]}>
              Info required
            </Animated.Text>
          </Animated.View>
        )}
      </View>
    </Button>
  );
}

// ----- Select Option View -----

interface SelectOptionViewProps {
  options: PaymentOption[];
  selectedOption: PaymentOption | null;
  isLoadingActions: boolean;
  isSigningPayment: boolean;
  onSelectOption: (option: PaymentOption) => void;
  onContinue: () => void;
  info?: PaymentInfo;
  collectDataCompletedIds: string[];
}

export function SelectOptionView({
  options,
  selectedOption,
  isSigningPayment,
  onSelectOption,
  onContinue,
  info,
  isLoadingActions,
  collectDataCompletedIds,
}: SelectOptionViewProps) {
  const visibleCount = options.length;
  const scrollable = visibleCount > MAX_VISIBLE_OPTIONS;
  const listMaxHeight =
    MAX_VISIBLE_OPTIONS * OPTION_HEIGHT +
    (MAX_VISIBLE_OPTIONS - 1) * OPTION_GAP +
    Spacing[4] * 2;

  const handleSelectOption = useCallback(
    (option: PaymentOption) => {
      onSelectOption(option);
    },
    [onSelectOption],
  );

  return (
    <>
      <MerchantInfo info={info} />

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
          {options.map(option => (
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
        {scrollable && <FadeGradient position="bottom" />}
      </View>

      <View style={styles.buttonContainer}>
        <ActionButton
          onPress={onContinue}
          disabled={isSigningPayment || !selectedOption}
          silentDisabled={isLoadingActions}
          fullWidth
        >
          Continue
        </ActionButton>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  optionsList: {
    marginTop: Spacing[3],
    flexGrow: 0,
  },
  optionsListContent: {
    gap: OPTION_GAP,
    paddingVertical: Spacing[4],
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[5],
    borderRadius: BorderRadius[4],
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  optionItemOverlay: {
    borderRadius: BorderRadius[4],
    borderWidth: 1,
  },
  optionItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    flex: 1,
  },
  collectDataPill: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 6,
    borderRadius: BorderRadius[2],
    marginLeft: 'auto',
  },
  pillText: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
    fontWeight: '500',
    letterSpacing: -0.14,
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
