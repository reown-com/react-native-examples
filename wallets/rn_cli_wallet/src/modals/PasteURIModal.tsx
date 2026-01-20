import { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import ModalStore from '@/store/ModalStore';
import { Text } from '@/components/Text';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { ActionButton } from '@/components/ActionButton';
import SettingsStore from '@/store/SettingsStore';
import { walletKit, isPaymentLink } from '@/utils/WalletKitUtil';
import { EIP155_CHAINS } from '@/constants/Eip155';
import SvgClose from '@/assets/Close';

export default function PasteURIModal() {
  const Theme = useTheme();
  const [uri, setUri] = useState('');

  const handlePaymentLink = async (paymentLink: string) => {
    const payClient = walletKit?.pay;
    if (!payClient) {
      ModalStore.open('LoadingModal', {
        errorMessage: 'Pay SDK not initialized. Please restart the app.',
      });
      return;
    }

    ModalStore.open('PaymentOptionsModal', {
      loadingMessage: 'Preparing your payment...',
    });

    try {
      const eip155Address = SettingsStore.state.eip155Address;
      const accounts = eip155Address
        ? Object.keys(EIP155_CHAINS).map(
            chainKey => `${chainKey}:${eip155Address}`,
          )
        : [];

      const paymentOptions = await payClient.getPaymentOptions({
        paymentLink,
        accounts,
        includePaymentInfo: true,
      });

      ModalStore.open('PaymentOptionsModal', { paymentOptions });
    } catch (error: any) {
      ModalStore.open('PaymentOptionsModal', {
        errorMessage: error?.message || 'Failed to fetch payment options',
      });
    }
  };

  const pair = async (pairUri: string) => {
    ModalStore.open('LoadingModal', { loadingMessage: 'Pairing...' });
    await SettingsStore.state.initPromise;

    try {
      await walletKit.pair({ uri: pairUri });
    } catch (error: any) {
      ModalStore.open('LoadingModal', {
        errorMessage: error?.message || 'There was an error pairing',
      });
    }
  };

  const handleContinue = () => {
    if (!uri.trim()) {
      return;
    }

    ModalStore.close();
    setTimeout(() => {
      if (isPaymentLink(uri)) {
        handlePaymentLink(uri);
      } else {
        pair(uri);
      }
    }, 500);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <View
        style={[styles.container, { backgroundColor: Theme['bg-primary'] }]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => ModalStore.close()}
            style={[
              styles.closeButton,
              { borderColor: Theme['border-secondary'] },
            ]}
          >
            <SvgClose width={38} height={38} fill={Theme['text-primary']} />
          </TouchableOpacity>
        </View>

        <Text variant="h6-400" color="text-primary" center>
          Paste URI or Payment Link
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: Theme['bg-primary'],
              color: Theme['text-primary'],
              borderColor: Theme['foreground-tertiary'],
            },
          ]}
          placeholder="wc:// or https://pay.walletconnect.com/..."
          placeholderTextColor={Theme['text-secondary']}
          value={uri}
          onChangeText={setUri}
          multiline
          numberOfLines={4}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
        />

        <View style={styles.buttonContainer}>
          <ActionButton
            style={styles.button}
            onPress={() => ModalStore.close()}
            variant="secondary"
          >
            Cancel
          </ActionButton>

          <ActionButton
            style={styles.button}
            onPress={handleContinue}
            disabled={!uri.trim()}
          >
            Continue
          </ActionButton>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    width: '100%',
  },
  container: {
    width: '100%',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    alignItems: 'center',
    padding: Spacing[5],
    paddingBottom: Spacing[8],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    marginBottom: Spacing[4],
  },
  closeButton: {
    borderWidth: 1,
    borderRadius: BorderRadius[3],
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius[3],
    padding: Spacing[4],
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    width: '100%',
    marginTop: Spacing[4],
    marginHorizontal: Spacing[4],
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing[3],
    width: '100%',
    paddingTop: Spacing[4],
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: BorderRadius[3],
    alignItems: 'center',
  },
});
