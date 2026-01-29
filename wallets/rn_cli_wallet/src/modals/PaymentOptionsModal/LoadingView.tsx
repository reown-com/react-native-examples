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
      <Text variant="h6-400" color="text-primary" style={styles.loadingText}>
        {message || 'Loading...'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    padding: Spacing[5],
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing[4],
  },
});
