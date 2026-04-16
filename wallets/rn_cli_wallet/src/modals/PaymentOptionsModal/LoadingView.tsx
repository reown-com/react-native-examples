import { View, StyleSheet } from 'react-native';

import { WalletConnectLoading } from '@/components/WalletConnectLoading';
import { Spacing } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';

interface LoadingViewProps {
  message?: string;
  size?: number;
}

export function LoadingView({ message, size = 120 }: LoadingViewProps) {
  return (
    <View style={styles.loadingContainer}>
      <WalletConnectLoading size={size} />
      <View style={styles.messageContainer}>
        <Text
          variant="h6-400"
          color="text-primary"
          style={styles.loadingText}
          testID="pay-loading-message"
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {message || 'Loading...'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    padding: Spacing[5],
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContainer: {
    marginTop: Spacing[4],
    minHeight: 48,
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: Spacing[2],
  },
  loadingText: {
    textAlign: 'center',
  },
});
