import { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import ModalStore from '@/store/ModalStore';
import SettingsStore from '@/store/SettingsStore';
import WalletStore from '@/store/WalletStore';
import { loadEIP155Wallet } from '@/utils/EIP155WalletUtil';
import { Text } from '@/components/Text';
import { ModalCloseButton } from '@/components/ModalCloseButton';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { ActionButton } from '@/components/ActionButton';

export default function ImportWalletModal() {
  const Theme = useTheme();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleImport = async () => {
    if (!input.trim()) {
      Alert.alert('Error', 'Please enter a mnemonic or private key');
      return;
    }

    setIsLoading(true);
    try {
      const { address } = loadEIP155Wallet(input);

      // Refetch balances with the new address
      WalletStore.fetchBalances({
        eip155Address: address,
        tonAddress: SettingsStore.state.tonAddress,
        tronAddress: SettingsStore.state.tronAddress,
      });

      Alert.alert('Success', `Wallet imported!\n\nNew address: ${address}`);
      ModalStore.close();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Invalid mnemonic or private key';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding">
      <View
        style={[styles.container, { backgroundColor: Theme['bg-primary'] }]}
      >
        <View style={styles.header}>
          <ModalCloseButton onPress={() => ModalStore.close()} />
        </View>

        <Text variant="h6-400" color="text-primary" center>
          Import EVM Wallet
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
          placeholder="Enter mnemonic or private key (0x...)"
          placeholderTextColor={Theme['text-secondary']}
          value={input}
          onChangeText={setInput}
          multiline
          numberOfLines={4}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={false}
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
            onPress={handleImport}
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? 'Importing...' : 'Import'}
          </ActionButton>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
    marginTop: Spacing[4],
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: BorderRadius[3],
    alignItems: 'center',
  },
});
