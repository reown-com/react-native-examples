// Web variant of the Scan screen. react-native-vision-camera has no web support,
// so instead of a QR camera we offer a paste-the-URI flow (sufficient for Maestro
// web tests and manual use).
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RootStackScreenProps } from '@/utils/TypesUtil';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { useTheme } from '@/hooks/useTheme';
import { usePairing } from '@/hooks/usePairing';
import { Spacing } from '@/utils/ThemeUtil';

type Props = RootStackScreenProps<'Scan'>;

export default function Scan({ navigation }: Props) {
  const Theme = useTheme();
  const { top } = useSafeAreaInsets();
  const { handleUriOrPaymentLink } = usePairing();
  const [uri, setUri] = useState('');

  const onConnect = () => {
    const value = uri.trim();
    if (!value) {
      return;
    }
    handleUriOrPaymentLink(value);
    navigation.goBack();
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: top + Spacing[4], backgroundColor: Theme['bg-primary'] },
      ]}>
      <Text variant="lg-500" color="text-primary">
        Paste WalletConnect URI
      </Text>
      <Text variant="sm-400" color="text-secondary" style={styles.subtitle}>
        Camera scanning isn’t available on web. Paste a wc: URI or payment link
        to connect.
      </Text>
      <TextInput
        testID="input-wc-uri"
        value={uri}
        onChangeText={setUri}
        placeholder="wc:..."
        placeholderTextColor={Theme['text-tertiary']}
        autoCapitalize="none"
        autoCorrect={false}
        style={[
          styles.input,
          { color: Theme['text-primary'], borderColor: Theme['border-primary'] },
        ]}
      />
      <Button
        testID="button-connect-uri"
        onPress={onConnect}
        style={[styles.button, { backgroundColor: Theme['bg-accent-primary'] }]}>
        <Text variant="md-500" color="text-invert">
          Connect
        </Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing[4],
    gap: Spacing[3],
  },
  subtitle: {
    marginBottom: Spacing[2],
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    fontSize: 16,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing[3],
    borderRadius: 16,
  },
});
