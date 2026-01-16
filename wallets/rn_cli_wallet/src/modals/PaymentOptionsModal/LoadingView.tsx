import { View, StyleSheet } from 'react-native';

import { WalletConnectLoading } from '@/components/WalletConnectLoading';
import { Spacing } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';

interface LoadingViewProps {
  message?: string;
}

export function LoadingView({ message }: LoadingViewProps) {
  return (
    <View style={styles.loadingContainer}>
      <WalletConnectLoading size={120} />
      <Text variant="lg-400" color="text-primary" style={styles.loadingText}>
        {message || 'Loading payment options'}
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
