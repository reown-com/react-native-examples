import { View, Text } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { ActionButton } from '@/components/ActionButton';
import { styles } from './styles';

interface ErrorViewProps {
  message: string;
  onClose: () => void;
}

export function ErrorView({ message, onClose }: ErrorViewProps) {
  const Theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: Theme['bg-175'] }]}>
      <Text style={[styles.headerTitle, { color: Theme['fg-100'] }]}>
        Payment Error
      </Text>
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: Theme['error-100'] }]}>
          {message}
        </Text>
      </View>
      <View style={styles.footerContainer}>
        <ActionButton
          style={styles.closeButton}
          textStyle={styles.closeButtonText}
          onPress={onClose}
          secondary
        >
          Close
        </ActionButton>
      </View>
    </View>
  );
}
