import { useSnapshot } from 'valtio';
import { View, StyleSheet } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { ScrollView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

import SettingsStore from '@/store/SettingsStore';
import { eip155Wallets } from '@/utils/EIP155WalletUtil';
import { wallet1 as suiWallet } from '@/utils/SuiWalletUtil';
import { wallet1 as tonWallet } from '@/utils/TonWalletUtil';
import { tronWeb1 as tronWallet } from '@/utils/TronWalletUtil';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/Text';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import CopySvg from '@/assets/Copy';
import { Button } from '@/components/Button';

interface SecretSectionProps {
  title: string;
  secret: string | null;
  type: 'mnemonic' | 'hex';
  notAvailableMessage?: string;
}

function SecretSection({
  title,
  secret,
  type,
  notAvailableMessage = 'Not available',
}: SecretSectionProps) {
  const Theme = useTheme();

  const copySecret = () => {
    if (secret) {
      Clipboard.setString(secret);
      Toast.show({
        type: 'info',
        text1: `${title} copied to clipboard`,
      });
    }
  };

  const words = type === 'mnemonic' && secret ? secret.split(' ') : [];

  return (
    <View style={styles.section}>
      <Text variant="lg-500" color="text-primary" style={styles.sectionTitle}>
        {title}
      </Text>

      {!secret ? (
        <View
          style={[
            styles.notAvailableContainer,
            { backgroundColor: Theme['foreground-primary'] },
          ]}
        >
          <Text variant="md-400" color="text-secondary">
            {notAvailableMessage}
          </Text>
        </View>
      ) : (
        <>
          {type === 'mnemonic' ? (
            <View style={styles.wordsContainer}>
              {words.map((word, index) => (
                <View
                  key={index}
                  style={[
                    styles.wordCard,
                    { backgroundColor: Theme['foreground-primary'] },
                  ]}
                >
                  <Text variant="sm-400" color="text-secondary">
                    {index + 1}.
                  </Text>
                  <Text variant="md-500" color="text-primary">
                    {word}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View
              style={[
                styles.hexContainer,
                { backgroundColor: Theme['foreground-primary'] },
              ]}
            >
              <Text
                variant="sm-400"
                color="text-primary"
                style={styles.hexText}
                numberOfLines={3}
              >
                {secret}
              </Text>
            </View>
          )}

          <Button
            onPress={copySecret}
            style={[
              styles.copyButton,
              { backgroundColor: Theme['foreground-primary'] },
            ]}
          >
            <Text variant="md-500" color="text-primary">
              Copy to clipboard
            </Text>
            <CopySvg width={18} height={18} fill={Theme['text-primary']} />
          </Button>
        </>
      )}
    </View>
  );
}

export default function SecretPhrase() {
  const { eip155Address } = useSnapshot(SettingsStore.state);
  const Theme = useTheme();

  // Get EVM mnemonic
  const evmMnemonic = eip155Wallets[eip155Address]?.getMnemonic?.() ?? null;

  // Get SUI mnemonic
  const suiMnemonic = suiWallet?.getMnemonic?.() ?? null;

  // Get TON secret key
  const tonSecretKey = tonWallet?.getSecretKey?.() ?? null;

  // Get TRON private key
  const tronPrivateKey = tronWallet?.privateKey ?? null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Theme['bg-primary'] }]}
      contentContainerStyle={styles.content}
    >
      <View
        style={[
          styles.warningContainer,
          { backgroundColor: Theme['bg-warning'] },
        ]}
      >
        <Text variant="sm-500" color="text-primary">
          Mnemonics and secret keys are provided for development purposes only and should not be used elsewhere
        </Text>
      </View>
      <SecretSection
        title="EVM (Ethereum)"
        secret={evmMnemonic}
        type="mnemonic"
        notAvailableMessage="Imported via private key - no recovery phrase"
      />

      <SecretSection
        title="SUI"
        secret={suiMnemonic}
        type="mnemonic"
        notAvailableMessage="SUI wallet not initialized"
      />

      <SecretSection
        title="TON"
        secret={tonSecretKey}
        type="hex"
        notAvailableMessage="TON wallet not initialized"
      />

      <SecretSection
        title="TRON"
        secret={tronPrivateKey}
        type="hex"
        notAvailableMessage="TRON wallet not initialized"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing[5],
    paddingBottom: Spacing[10],
  },
  section: {
    marginBottom: Spacing[10],
  },
  sectionTitle: {
    marginBottom: Spacing[3],
  },
  notAvailableContainer: {
    padding: Spacing[4],
    borderRadius: BorderRadius[3],
    alignItems: 'center',
  },
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
    marginBottom: Spacing[3],
  },
  wordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[3],
    borderRadius: BorderRadius[2],
    width: '30%',
    minWidth: 90,
  },
  hexContainer: {
    padding: Spacing[3],
    borderRadius: BorderRadius[3],
    marginBottom: Spacing[3],
  },
  hexText: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
  copyButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing[2],
    padding: Spacing[3],
    borderRadius: BorderRadius[3],
  },
  warningContainer: {
    padding: Spacing[4],
    borderRadius: BorderRadius[3],
    marginBottom: Spacing[5],
  },
});
