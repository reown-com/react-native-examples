import { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text } from '@reown/appkit-ui-react-native';

import { useTheme } from '@/hooks/useTheme';
import ModalStore from '@/store/ModalStore';
import { loadEIP155Wallet } from '@/utils/EIP155WalletUtil';

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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <View style={[styles.container, { backgroundColor: Theme['bg-125'] }]}>
        <Text variant="large-600" color="fg-100">
          Import EVM Wallet
        </Text>

        <Text variant="small-400" color="fg-200" style={styles.description}>
          Enter a mnemonic phrase or private key to import an existing wallet.
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: Theme['bg-175'],
              color: Theme['fg-100'],
              borderColor: Theme['bg-200'],
            },
          ]}
          placeholder="Enter mnemonic or private key (0x...)"
          placeholderTextColor={Theme['fg-300']}
          value={input}
          onChangeText={setInput}
          multiline
          numberOfLines={4}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={false}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.cancelButton,
              { backgroundColor: Theme['bg-200'] },
            ]}
            onPress={() => ModalStore.close()}
          >
            <Text variant="paragraph-600" color="fg-100">
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.importButton,
              { opacity: isLoading ? 0.6 : 1 },
            ]}
            onPress={handleImport}
            disabled={isLoading}
          >
            <Text variant="paragraph-600" color="inverse-100">
              {isLoading ? 'Importing...' : 'Import'}
            </Text>
          </TouchableOpacity>
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
    padding: 20,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    rowGap: 16,
  },
  description: {
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {},
  importButton: {
    backgroundColor: '#3396FF',
  },
});
