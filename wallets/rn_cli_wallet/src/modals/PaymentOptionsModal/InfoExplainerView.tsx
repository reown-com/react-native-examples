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
      <Text center variant="h6-400" color="text-primary" style={styles.title}>
        Why we collect personal details
      </Text>

      <Text center variant="lg-400" color="text-secondary" style={styles.body}>
        We collect a few basic details to meet compliance requirements for
        WalletConnect Pay.
      </Text>

      <Text center variant="lg-400" color="text-secondary">
        We only ask once per wallet on this network. You won’t see this again
        unless your details change.
      </Text>

      <View style={styles.buttonContainer}>
        <ActionButton onPress={onDismiss} fullWidth>
          Got it
        </ActionButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing[2],
    alignItems: 'center',
  },
  title: {
    marginBottom: Spacing[2],
  },
  body: {
    marginBottom: Spacing[2],
  },
  buttonContainer: {
    width: '100%',
    marginTop: Spacing[7],
    marginBottom: Spacing[2],
  },
});
