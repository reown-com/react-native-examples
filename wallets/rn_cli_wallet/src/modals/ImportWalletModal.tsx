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

import { useTheme } from '@/hooks/useTheme';
import ModalStore from '@/store/ModalStore';
import { loadEIP155Wallet } from '@/utils/EIP155WalletUtil';
import { Text } from '@/components/Text';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';

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
      <View
        style={[styles.container, { backgroundColor: Theme['bg-primary'] }]}
      >
        <Text variant="large-600" color="text-primary">
          Import EVM Wallet
        </Text>

        <Text
          variant="small-400"
          color="text-secondary"
          style={styles.description}
        >
          Enter a mnemonic phrase or private key to import an existing wallet.
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: Theme['foreground-secondary'],
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
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: Theme['foreground-tertiary'] },
            ]}
            onPress={() => ModalStore.close()}
          >
            <Text variant="paragraph-600" color="text-primary">
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              {
                opacity: isLoading ? 0.6 : 1,
                backgroundColor: Theme['bg-accent-primary'],
              },
            ]}
            onPress={handleImport}
            disabled={isLoading}
          >
            <Text variant="paragraph-600" color="text-invert">
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
    padding: Spacing[5],
    borderTopLeftRadius: BorderRadius[8],
    borderTopRightRadius: BorderRadius[8],
    rowGap: Spacing[4],
  },
  description: {
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius[3],
    padding: Spacing[4],
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: BorderRadius[3],
    alignItems: 'center',
  },
});
