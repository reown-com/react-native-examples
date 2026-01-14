import { Spacing } from '@/constants/spacing';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/primitives/text';
import { WalletConnectLoading } from '../walletconnect-loading';

interface ProcessingStepProps {
  message?: string;
}

export function ProcessingStep({
  message = 'Confirming your payment...',
}: ProcessingStepProps) {
  return (
    <View style={styles.container}>
      <WalletConnectLoading size={120} />
      <Text fontSize={18} lineHeight={22} center color="text-primary">
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing['spacing-5'],
    paddingTop: Spacing['spacing-13'],
    paddingBottom: Spacing['spacing-9'],
    gap: Spacing['spacing-5'],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
