import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

interface LoadingViewProps {
  message?: string;
}

export function LoadingView({ message }: LoadingViewProps) {
  const Theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: Theme['bg-175'] }]}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme['accent-100']} />
        <Text style={[styles.loadingText, { color: Theme['fg-100'] }]}>
          {message || 'Loading payment options...'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingTop: 20,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});
