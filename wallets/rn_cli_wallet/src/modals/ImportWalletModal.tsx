import { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import Toast from 'react-native-toast-message';

import { useTheme } from '@/hooks/useTheme';
import ModalStore from '@/store/ModalStore';
import SettingsStore from '@/store/SettingsStore';
import WalletStore from '@/store/WalletStore';
import { loadEIP155Wallet } from '@/utils/EIP155WalletUtil';
import { loadTonWallet } from '@/utils/TonWalletUtil';
import { loadTronWallet } from '@/utils/TronWalletUtil';
import { loadSuiWallet } from '@/utils/SuiWalletUtil';
import { Text } from '@/components/Text';
import { ModalCloseButton } from '@/components/ModalCloseButton';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Spacing, BorderRadius, FontFamily } from '@/utils/ThemeUtil';
import { ActionButton } from '@/components/ActionButton';

const CHAIN_OPTIONS = ['EVM', 'TON', 'TRON', 'SUI'] as const;
type ChainOption = (typeof CHAIN_OPTIONS)[number];

const PLACEHOLDER_TEXT: Record<ChainOption, string> = {
  EVM: 'Enter mnemonic or private key (0x...)',
  TON: 'Enter secret key (128 hex) or seed (64 hex)',
  TRON: 'Enter private key (64 hex)',
  SUI: 'Enter mnemonic phrase (12-24 words)',
};

const EMPTY_INPUT_ERROR: Record<ChainOption, string> = {
  EVM: 'Please enter a mnemonic or private key',
  TON: 'Please enter a secret key or seed',
  TRON: 'Please enter a private key',
  SUI: 'Please enter a mnemonic phrase',
};

export default function ImportWalletModal() {
  const Theme = useTheme();
  const [selectedChain, setSelectedChain] = useState<ChainOption>('EVM');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChainChange = (chain: ChainOption) => {
    setSelectedChain(chain);
    setInput(''); // Clear input when switching chains
  };

  const handleImport = async () => {
    if (!input.trim()) {
      Toast.show({
        type: 'error',
        text1: EMPTY_INPUT_ERROR[selectedChain],
      });
      return;
    }

    setIsLoading(true);
    try {
      let address: string;

      switch (selectedChain) {
        case 'EVM': {
          const result = loadEIP155Wallet(input);
          address = result.address;
          // Refetch balances with the new EVM address
          WalletStore.fetchBalances({
            eip155Address: address,
            tonAddress: SettingsStore.state.tonAddress,
            tronAddress: SettingsStore.state.tronAddress,
            suiAddress: SettingsStore.state.suiAddress,
          });
          break;
        }
        case 'TON': {
          const result = await loadTonWallet(input);
          address = result.address;
          // Refetch balances with the new TON address
          WalletStore.fetchBalances({
            eip155Address: SettingsStore.state.eip155Address,
            tonAddress: address,
            tronAddress: SettingsStore.state.tronAddress,
            suiAddress: SettingsStore.state.suiAddress,
          });
          break;
        }
        case 'TRON': {
          const result = await loadTronWallet(input);
          address = result.address;
          // Refetch balances with the new TRON address
          WalletStore.fetchBalances({
            eip155Address: SettingsStore.state.eip155Address,
            tonAddress: SettingsStore.state.tonAddress,
            tronAddress: address,
            suiAddress: SettingsStore.state.suiAddress,
          });
          break;
        }
        case 'SUI': {
          const result = await loadSuiWallet(input);
          address = result.address;
          // Refetch balances with the new SUI address
          WalletStore.fetchBalances({
            eip155Address: SettingsStore.state.eip155Address,
            tonAddress: SettingsStore.state.tonAddress,
            tronAddress: SettingsStore.state.tronAddress,
            suiAddress: address,
          });
          break;
        }
      }

      Toast.show({
        type: 'success',
        text1: `${selectedChain} wallet imported!`,
        text2: `New address: ${address}`,
      });
      ModalStore.close();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Invalid input';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: message,
      });
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
          Import Wallet
        </Text>

        <View style={styles.segmentContainer}>
          <SegmentedControl
            options={CHAIN_OPTIONS}
            selectedOption={selectedChain}
            onSelect={handleChainChange}
          />
        </View>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: Theme['bg-primary'],
              color: Theme['text-primary'],
              borderColor: Theme['foreground-tertiary'],
            },
          ]}
          placeholder={PLACEHOLDER_TEXT[selectedChain]}
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
  segmentContainer: {
    width: '100%',
    marginTop: Spacing[4],
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
    fontFamily: FontFamily.regular,
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
