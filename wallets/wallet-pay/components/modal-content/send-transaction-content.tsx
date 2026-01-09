import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Button } from '@/components/primitives/button';
import { Text } from '@/components/primitives/text';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Chain } from '@/utils/types';

const CaretUpDownIcon = require('@/assets/icons/caret-up-down.png');

interface SendTransactionContentProps {
  transaction: Record<string, unknown>;
  chain?: Chain;
  onApprove: () => void;
  onReject: () => void;
  isLoading: boolean;
}

export function SendTransactionContent({
  transaction,
  chain,
  onApprove,
  onReject,
  isLoading,
}: SendTransactionContentProps) {
  const cardBg = useThemeColor('foreground-primary');
  const borderColor = useThemeColor('border-primary');
  const [isExpanded, setIsExpanded] = useState(false);

  const height = useSharedValue(0);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    height.value = withTiming(isExpanded ? 0 : 1, { duration: 200 });
  };

  const contentStyle = useAnimatedStyle(() => ({
    opacity: height.value,
    maxHeight: height.value * 200,
    overflow: 'hidden',
  }));

  return (
    <>
      {/* Send details card with accordion */}
      <View style={[styles.sendCard, { backgroundColor: cardBg }]}>
        {/* Header row - Transaction */}
        <Pressable onPress={toggleExpand} style={styles.headerRow}>
          <Text fontSize={16} lineHeight={18} color="text-tertiary">
            Transaction
          </Text>
          <Image source={CaretUpDownIcon} style={styles.caretIcon} />
        </Pressable>

        {/* Expanded content - Transaction details */}
        <Animated.View style={contentStyle}>
          <ScrollView
            style={styles.messageScroll}
            showsVerticalScrollIndicator={false}>
            <Text fontSize={14} lineHeight={18} style={styles.messageText}>
              {JSON.stringify(transaction, null, 2)}
            </Text>
          </ScrollView>
        </Animated.View>
      </View>

      {/* Network card */}
      {chain && (
        <View style={[styles.networkCard, { backgroundColor: cardBg }]}>
          <Text fontSize={16} lineHeight={18} color="text-tertiary">
            Network
          </Text>
          <View style={[styles.networkIconContainer, { borderColor }]}>
            <Image source={chain.icon} style={styles.networkIcon} />
          </View>
        </View>
      )}

      {/* Footer - Buttons */}
      <View style={styles.buttonsContainer}>
        <Button
          onPress={onReject}
          style={styles.button}
          type="secondary"
          text="Cancel"
          disabled={isLoading}
        />
        <Button
          onPress={onApprove}
          type="primary"
          style={styles.button}
          text="Send"
          disabled={isLoading}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sendCard: {
    borderRadius: BorderRadius['5'],
    padding: Spacing['spacing-5'],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  caretIcon: {
    width: 16,
    height: 16,
  },
  messageScroll: {
    marginTop: Spacing['spacing-4'],
    maxHeight: 150,
  },
  messageText: {
    fontFamily: 'monospace',
  },
  networkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: BorderRadius['5'],
    padding: Spacing['spacing-5'],
  },
  networkIconContainer: {
    borderRadius: BorderRadius['full'],
    borderWidth: 1,
    backgroundColor: 'white',
  },
  networkIcon: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius['full'],
  },
  buttonsContainer: {
    marginTop: Spacing['spacing-2'],
    flexDirection: 'row',
    gap: Spacing['spacing-3'],
  },
  button: {
    flex: 1,
  },
});
