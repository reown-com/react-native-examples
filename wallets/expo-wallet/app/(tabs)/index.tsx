import { Button } from '@/components/primitives/button';
import { mockedProposal } from '@/constants/mocks';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useWalletKit } from '@/hooks/use-walletkit';
import { useThemeColor } from '@/hooks/use-theme-color';
import { isPaymentLink, extractPaymentLink } from '@/lib/pay';
import { router } from 'expo-router';
import { useState, useCallback } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Text } from '@/components/primitives/text';

export default function HomeScreen() {
  const [inputUri, setInputUri] = useState('');
  const [error, setError] = useState<string>();
  const { walletKit } = useWalletKit();

  const inputBackground = useThemeColor('foreground-primary');
  const inputBorder = useThemeColor('border-primary');
  const textColor = useThemeColor('text-primary');
  const placeholderColor = useThemeColor('text-tertiary');

  const onMockedProposal = async () => {
    router.push({
      pathname: '/session-proposal',
      params: { proposal: JSON.stringify(mockedProposal) },
    });
  };

  const handleConnect = useCallback(async () => {
    const trimmedUri = inputUri.trim();

    if (!trimmedUri) {
      setError('Please enter a URI or payment link');
      return;
    }

    setError(undefined);

    // Check if it's a payment link
    if (isPaymentLink(trimmedUri)) {
      const paymentLink = extractPaymentLink(trimmedUri);
      if (paymentLink) {
        if (__DEV__) {
          console.log('Opening payment flow for:', paymentLink);
        }
        router.push({
          pathname: '/pay',
          params: { paymentLink },
        });
        setInputUri('');
        return;
      }
    }

    // Check if it's a WalletConnect URI
    if (trimmedUri.startsWith('wc:')) {
      try {
        if (__DEV__) {
          console.log('Pairing with WC URI:', trimmedUri);
        }
        await walletKit?.pair({ uri: trimmedUri });
        setInputUri('');
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to pair';
        setError(errorMessage);
        if (__DEV__) {
          console.error('Pairing error:', err);
        }
      }
      return;
    }

    // Invalid URI
    setError(
      'Invalid URI. Enter a WalletConnect URI (wc:...) or a payment link',
    );
  }, [inputUri, walletKit]);

  return (
    <View style={styles.container}>
      <Button
        style={styles.button}
        type="primary"
        onPress={onMockedProposal}
        text="Proposal modal"
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: inputBackground,
              borderColor: inputBorder,
              color: textColor,
            },
          ]}
          placeholder="Paste WC URI or payment link"
          placeholderTextColor={placeholderColor}
          value={inputUri}
          onChangeText={(text) => {
            setInputUri(text);
            setError(undefined);
          }}
          autoCapitalize="none"
          autoCorrect={false}
          multiline={false}
        />
        {error && (
          <Text fontSize={12} color="icon-error" style={styles.errorText}>
            {error}
          </Text>
        )}
      </View>

      <Button
        style={styles.button}
        onPress={handleConnect}
        text="Connect"
        type="primary"
        disabled={!inputUri.trim()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing['spacing-4'],
    paddingHorizontal: Spacing['spacing-4'],
  },
  button: {
    padding: Spacing['spacing-4'],
    borderRadius: BorderRadius['4'],
  },
  inputContainer: {
    width: '100%',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: BorderRadius['4'],
    padding: Spacing['spacing-4'],
    fontSize: 14,
  },
  errorText: {
    marginTop: Spacing['spacing-1'],
    paddingHorizontal: Spacing['spacing-1'],
  },
});
