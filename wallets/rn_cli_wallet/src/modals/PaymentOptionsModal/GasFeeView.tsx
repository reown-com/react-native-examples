import { View, StyleSheet, Image } from 'react-native';

import { Text } from '@/components/Text';
import { ActionButton } from '@/components/ActionButton';
import { BorderRadius, Spacing } from '@/utils/ThemeUtil';
import { useTheme } from '@/hooks/useTheme';
import GasPump from '@/assets/GasPump';

interface GasFeeViewProps {
  onDismiss: () => void;
  imageSource: string;
  tokenName: string;
  gasCostEstimate: string;
}

export function GasFeeView({
  onDismiss,
  imageSource,
  tokenName,
  gasCostEstimate,
}: GasFeeViewProps) {
  const Theme = useTheme();
  const tokenNameUppercase = tokenName.toUpperCase();

  return (
    <View style={styles.container}>
      {imageSource && (
        <Image source={{ uri: imageSource }} style={styles.image} />
      )}
      <Text center variant="h6-400" color="text-primary" style={styles.title}>
        Why does {tokenNameUppercase} require a gas fee?
      </Text>

      <Text center variant="lg-400" color="text-secondary">
        The gas fee covers a one-time setup that lets your wallet pay with{' '}
        {tokenNameUppercase}.
      </Text>

      <Text center variant="lg-400" color="text-secondary">
        You only pay it once. Future {tokenNameUppercase} payments from this
        wallet skip this step.
      </Text>

      <View style={styles.gasFeeContainer}>
        <Text variant="lg-400" color="text-secondary">
          Gas fee: {gasCostEstimate}
        </Text>
        <GasPump height={18} width={18} fill={Theme['icon-default']} />
      </View>

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
    paddingHorizontal: Spacing[3],
    alignItems: 'center',
    rowGap: Spacing[1],
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing[2],
  },
  title: {
    marginBottom: Spacing[2],
  },
  gasFeeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[1],
    marginTop: Spacing[7],
    marginBottom: Spacing[3],
  },
  buttonContainer: {
    width: '100%',
  },
});
