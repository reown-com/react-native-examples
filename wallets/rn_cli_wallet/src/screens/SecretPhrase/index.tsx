import { useSnapshot } from 'valtio';
import { View, StyleSheet } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { ScrollView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

import SettingsStore from '@/store/SettingsStore';
import { eip155Wallets } from '@/utils/EIP155WalletUtil';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/Text';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import CopySvg from '@/assets/Copy';
import { Button } from '@/components/Button';

export default function SecretPhrase() {
  const { eip155Address } = useSnapshot(SettingsStore.state);
  const Theme = useTheme();

  const mnemonic = eip155Wallets[eip155Address]?.getMnemonic?.() ?? '';
  const words = mnemonic ? mnemonic.split(' ') : [];

  const copyMnemonic = () => {
    if (mnemonic) {
      Clipboard.setString(mnemonic);
      Toast.show({
        type: 'info',
        text1: 'Secret phrase copied to clipboard',
      });
    }
  };

  if (!mnemonic) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: Theme['bg-primary'] },
        ]}
      >
        <Text variant="lg-500" color="text-primary" style={styles.title}>
          No Secret Phrase Available
        </Text>
        <Text
          variant="md-400"
          color="text-secondary"
          style={styles.description}
        >
          This wallet was imported using a private key, so there is no recovery
          phrase to display.
        </Text>
      </View>
    );
  }

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
          Never share this phrase with anyone. Anyone with this phrase can take
          your funds.
        </Text>
      </View>

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

      <Button
        onPress={copyMnemonic}
        style={[
          styles.copyButton,
          { backgroundColor: Theme['foreground-primary'] },
        ]}
      >
        <Text variant="lg-500" color="text-primary">
          Copy to clipboard
        </Text>
        <CopySvg width={20} height={20} fill={Theme['text-primary']} />
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing[5],
  },
  content: {
    padding: Spacing[5],
  },
  title: {
    marginBottom: Spacing[4],
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
  },
  warningContainer: {
    padding: Spacing[4],
    borderRadius: BorderRadius[3],
    marginBottom: Spacing[5],
  },
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
    marginBottom: Spacing[5],
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
  copyButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing[2],
    padding: Spacing[4],
    borderRadius: BorderRadius[3],
  },
});
