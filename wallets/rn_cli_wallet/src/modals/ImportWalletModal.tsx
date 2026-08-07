import { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { showToast } from '@/utils/ToastUtil';

import { useTheme } from '@/hooks/useTheme';
import LogStore from '@/store/LogStore';
import ModalStore from '@/store/ModalStore';
import SettingsStore from '@/store/SettingsStore';
import WalletStore from '@/store/WalletStore';
import PaymentStore from '@/store/PaymentStore';
import { loadEIP155Wallet } from '@/utils/EIP155WalletUtil';
import { loadTonWallet } from '@/utils/TonWalletUtil';
import { loadTronWallet } from '@/utils/TronWalletUtil';
import { loadSuiWallet } from '@/utils/SuiWalletUtil';
import { loadCantonWallet } from '@/utils/CantonWalletUtil';
import { loadSolanaWallet } from '@/utils/SolanaWalletUtil';
import { loadBitcoinWallet } from '@/utils/BitcoinWalletUtil';
import { Text } from '@/components/Text';
import { ModalCloseButton } from '@/components/ModalCloseButton';
import {
  NetworkDropdown,
  NetworkDropdownOption,
} from '@/components/NetworkDropdown';
import { Spacing, BorderRadius, FontFamily } from '@/utils/ThemeUtil';
import { ActionButton } from '@/components/ActionButton';
import { TON_CHAINS } from '@/constants/Ton';
import { TRON_CHAINS } from '@/constants/Tron';
import { SUI_MAINNET_CAIP2 } from '@/constants/Sui';
import { CANTON_CHAINS } from '@/constants/Canton';
import { SOLANA_MAINNET_CAIP2 } from '@/constants/Solana';
import { BIP122_MAINNET_CAIP2 } from '@/constants/Bitcoin';

type ChainOption =
  | 'Ethereum'
  | 'Ton'
  | 'Tron'
  | 'Sui'
  | 'Canton'
  | 'Solana'
  | 'Bitcoin';

// Representative chainId per option, used to render the network icon in the
// dropdown. Derived from each namespace's chain map so it stays correct if the
// underlying CAIP-2 ids change.
const CHAIN_OPTIONS: readonly NetworkDropdownOption<ChainOption>[] = [
  { label: 'Ethereum', chainId: 'eip155:1' },
  { label: 'Ton', chainId: Object.keys(TON_CHAINS)[0] },
  { label: 'Tron', chainId: Object.keys(TRON_CHAINS)[0] },
  { label: 'Sui', chainId: SUI_MAINNET_CAIP2 },
  { label: 'Canton', chainId: Object.keys(CANTON_CHAINS)[0] },
  { label: 'Solana', chainId: SOLANA_MAINNET_CAIP2 },
  { label: 'Bitcoin', chainId: BIP122_MAINNET_CAIP2 },
] as const;

const PLACEHOLDER_TEXT: Record<ChainOption, string> = {
  Ethereum: 'Mnemonic or private key (0x…)',
  Ton: 'Secret key (128 hex) or seed (64 hex)',
  Tron: 'Private key (64 hex)',
  Sui: 'Mnemonic phrase (12–24 words)',
  Canton: 'Secret key (128 hex chars)',
  Solana: 'Mnemonic (12–24 words) or base58 secret key',
  Bitcoin: 'Mnemonic phrase (12–24 words)',
};

const EMPTY_INPUT_ERROR: Record<ChainOption, string> = {
  Ethereum: 'Enter a mnemonic or private key.',
  Ton: 'Enter a secret key or seed.',
  Tron: 'Enter a private key.',
  Sui: 'Enter a mnemonic phrase.',
  Canton: 'Enter an Ed25519 secret key.',
  Solana: 'Enter a mnemonic or base58 secret key.',
  Bitcoin: 'Enter a mnemonic phrase.',
};

export default function ImportWalletModal() {
  const Theme = useTheme();
  const [selectedChain, setSelectedChain] = useState<ChainOption>('Ethereum');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);

  const handleChainChange = (chain: ChainOption) => {
    setSelectedChain(chain);
    setInput(''); // Clear input when switching chains
  };

  const handleImport = async () => {
    // Normalize input: trim and collapse multiple whitespace to single space
    const sanitizedInput = input.trim().replace(/\s+/g, ' ');

    if (!sanitizedInput) {
      showToast({
        type: 'error',
        text1: EMPTY_INPUT_ERROR[selectedChain],
      });
      return;
    }

    setIsLoading(true);
    try {
      let address: string;

      switch (selectedChain) {
        case 'Ethereum': {
          const result = loadEIP155Wallet(sanitizedInput);
          address = result.address;
          // Refetch balances with the new EVM address
          WalletStore.fetchBalances(
            {
              eip155Address: address,
              tonAddress: SettingsStore.state.tonAddress,
              tronAddress: SettingsStore.state.tronAddress,
              suiAddress: SettingsStore.state.suiAddress,
              solanaAddress: SettingsStore.state.solanaAddress,
            },
            { force: true },
          );
          break;
        }
        case 'Ton': {
          const result = await loadTonWallet(sanitizedInput);
          address = result.address;
          // Refetch balances with the new Ton address
          WalletStore.fetchBalances(
            {
              eip155Address: SettingsStore.state.eip155Address,
              tonAddress: address,
              tronAddress: SettingsStore.state.tronAddress,
              suiAddress: SettingsStore.state.suiAddress,
              solanaAddress: SettingsStore.state.solanaAddress,
            },
            { force: true },
          );
          break;
        }
        case 'Tron': {
          const result = await loadTronWallet(sanitizedInput);
          address = result.address;
          // Refetch balances with the new Tron address
          WalletStore.fetchBalances(
            {
              eip155Address: SettingsStore.state.eip155Address,
              tonAddress: SettingsStore.state.tonAddress,
              tronAddress: address,
              suiAddress: SettingsStore.state.suiAddress,
              solanaAddress: SettingsStore.state.solanaAddress,
            },
            { force: true },
          );
          break;
        }
        case 'Sui': {
          const result = await loadSuiWallet(sanitizedInput);
          address = result.address;
          // Refetch balances with the new Sui address
          WalletStore.fetchBalances(
            {
              eip155Address: SettingsStore.state.eip155Address,
              tonAddress: SettingsStore.state.tonAddress,
              tronAddress: SettingsStore.state.tronAddress,
              suiAddress: address,
              solanaAddress: SettingsStore.state.solanaAddress,
            },
            { force: true },
          );
          break;
        }
        case 'Canton': {
          const result = await loadCantonWallet(sanitizedInput);
          address = result.address;
          break;
        }
        case 'Bitcoin': {
          const result = await loadBitcoinWallet(sanitizedInput);
          address = result.address;
          // Refetch balances with the new Bitcoin address
          WalletStore.fetchBalances(
            {
              eip155Address: SettingsStore.state.eip155Address,
              tonAddress: SettingsStore.state.tonAddress,
              tronAddress: SettingsStore.state.tronAddress,
              suiAddress: SettingsStore.state.suiAddress,
              solanaAddress: SettingsStore.state.solanaAddress,
              bitcoinAddress: address,
            },
            { force: true },
          );
          break;
        }
        case 'Solana': {
          const result = await loadSolanaWallet(sanitizedInput);
          address = result.address;
          // Refetch balances with the new Solana address
          WalletStore.fetchBalances(
            {
              eip155Address: SettingsStore.state.eip155Address,
              tonAddress: SettingsStore.state.tonAddress,
              tronAddress: SettingsStore.state.tronAddress,
              suiAddress: SettingsStore.state.suiAddress,
              solanaAddress: address,
            },
            { force: true },
          );
          break;
        }
        default: {
          const unsupportedChain = selectedChain satisfies never;
          LogStore.error(
            `Unsupported chain: ${unsupportedChain}`,
            'ImportWalletModal',
            'handleImport',
          );
          showToast({
            type: 'error',
            text1: 'Couldn’t import wallet',
            text2: `Unsupported chain: ${unsupportedChain}`,
          });
          return;
        }
      }

      try {
        await PaymentStore.clearLastPaidTokenUnit();
      } catch (error: unknown) {
        LogStore.warn(
          'Failed to clear last paid token after wallet import',
          'ImportWalletModal',
          'handleImport',
          { error: error instanceof Error ? error.message : 'unknown error' },
        );
      }

      showToast({
        type: 'success',
        text1: `${selectedChain} wallet added`,
        text2: `New address: ${address}`,
      });
      ModalStore.close();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Invalid input';
      showToast({
        type: 'error',
        text1: 'Couldn’t import wallet',
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
          Import wallet
        </Text>

        <View style={styles.segmentContainer}>
          <NetworkDropdown
            options={CHAIN_OPTIONS}
            selected={selectedChain}
            onSelect={handleChainChange}
            isOpen={isNetworkDropdownOpen}
            onOpenChange={setIsNetworkDropdownOpen}
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
          onFocus={() => setIsNetworkDropdownOpen(false)}
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
            {isLoading ? 'Importing…' : 'Import'}
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
