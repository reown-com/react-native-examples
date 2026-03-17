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
      <Text variant="h6-400" color="text-primary" style={styles.title}>
        Why do we collect personal details?
      </Text>

      <Text variant="lg-400" color="text-secondary" style={styles.body}>
        To meet compliance requirements, some basic information is collected
        from WalletConnect Pay users.
      </Text>

      <Text variant="lg-400" color="text-secondary" style={styles.lastBody}>
        This is typically a one-time step—if you use the same wallet on this
        network again, you won't need to provide the info again, unless your
        information changes.
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
    marginBottom: Spacing[2],
  },
  body: {
    marginBottom: Spacing[2],
  },
  lastBody: {},
  buttonContainer: {
    marginTop: Spacing[7],
    marginBottom: Spacing[2],
  },
});
