import { View, Text, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { ActionButton } from '@/components/ActionButton';

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

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingTop: 20,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    alignItems: 'center',
  },
  closeButton: {
    width: '100%',
    height: 48,
    borderRadius: 100,
  },
  closeButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
});
