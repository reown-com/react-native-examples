import { View, Text, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { WalletConnectLoading } from '@/components/WalletConnectLoading';

interface LoadingViewProps {
  message?: string;
}

export function LoadingView({ message }: LoadingViewProps) {
  const Theme = useTheme();

  return (
    <View style={styles.loadingContainer}>
      <WalletConnectLoading size={120} />
      <Text style={[styles.loadingText, { color: Theme['fg-100'] }]}>
        {message || 'Loading payment options'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});
