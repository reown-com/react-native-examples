import { View, Text, ActivityIndicator } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { styles } from './styles';

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
