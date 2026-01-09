import { ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/primitives/button';
import { Text } from '@/components/primitives/text';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useThemeColor } from '@/hooks/use-theme-color';

interface SignMessageContentProps {
  message: string;
  onApprove: () => void;
  onReject: () => void;
  isLoading: boolean;
}

export function SignMessageContent({
  message,
  onApprove,
  onReject,
  isLoading,
}: SignMessageContentProps) {
  const cardBg = useThemeColor('foreground-primary');

  return (
    <>
      {/* Message card */}
      <View style={[styles.messageContainer, { backgroundColor: cardBg }]}>
        <Text fontSize={16} lineHeight={18} color="text-tertiary">
          Message
        </Text>
        <ScrollView
          style={styles.messageScroll}
          contentContainerStyle={styles.messageContent}
          showsVerticalScrollIndicator={false}>
          <Text fontSize={14} lineHeight={16}>
            {message}
          </Text>
        </ScrollView>
      </View>

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
          text="Sign"
          disabled={isLoading}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    borderRadius: BorderRadius['4'],
    padding: Spacing['spacing-5'],
    gap: Spacing['spacing-2'],
  },
  messageScroll: {
    maxHeight: 150,
  },
  messageContent: {
    paddingBottom: Spacing['spacing-1'],
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
