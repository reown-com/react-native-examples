import { View, StyleSheet } from 'react-native';

import { Text } from '@/components/Text';
import { ActionButton } from '@/components/ActionButton';
import { Spacing } from '@/utils/ThemeUtil';

interface InfoExplainerViewProps {
  onDismiss: () => void;
}

export function InfoExplainerView({ onDismiss }: InfoExplainerViewProps) {
  return (
    <View style={styles.container}>
      <Text variant="lg-500" color="text-primary" style={styles.title}>
        Why we need your information?
      </Text>

      <Text variant="md-400" color="text-secondary" style={styles.body}>
        For regulatory compliance, we collect basic information on your first
        payment: full name, date of birth, and place of birth.
      </Text>

      <Text variant="md-400" color="text-secondary" style={styles.body}>
        This information is tied to your wallet address and this specific
        network. If you use the same wallet on this network again, you won't
        need to provide it again.
      </Text>

      <View style={styles.buttonContainer}>
        <ActionButton onPress={onDismiss} fullWidth>
          Got it!
        </ActionButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing[2],
  },
  title: {
    marginBottom: Spacing[4],
    textAlign: 'center',
  },
  body: {
    marginBottom: Spacing[3],
  },
  buttonContainer: {
    marginTop: Spacing[5],
    marginBottom: Spacing[2],
  },
});
