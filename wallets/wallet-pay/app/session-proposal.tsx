import { router, UnknownOutputParams, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { CloseModalButton } from '@/components/close-modal-button';
import { Text } from '@/components/primitives/text';
import { ThemedView } from '@/components/primitives/themed-view';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useTheme, useThemeColor } from '@/hooks/use-theme-color';
import { WalletKitTypes } from '@reown/walletkit';
import { Image } from 'expo-image';

interface ScreenParams extends UnknownOutputParams {
  proposal: string;
}

export default function ModalScreen() {
  const { proposal } = useLocalSearchParams<ScreenParams>();
  const cardBackgroundColor = useThemeColor('foreground-primary');
  const Theme = useTheme();

  const parsedProposal = JSON.parse(proposal) as WalletKitTypes.SessionProposal;
  console.log('parsedProposal', parsedProposal);

  const goBack = () => {
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <CloseModalButton
        onPress={goBack}
        style={[styles.closeButton, { marginTop: Spacing['spacing-4'] }]}
      />
      <View
        style={[
          styles.card,
          { backgroundColor: cardBackgroundColor, alignItems: 'center' },
        ]}>
        <Image
          source={parsedProposal.params.proposer.metadata.icons[0]}
          style={styles.appLogo}
        />
        <View style={styles.appInfo}>
          <Text style={styles.appName}>
            {parsedProposal.params.proposer.metadata.name}
          </Text>
          <Text style={styles.appAction}>wants to connect</Text>
          <Text style={[styles.appUrl, { color: Theme['text-secondary'] }]}>
            {parsedProposal.params.proposer.metadata.url}
          </Text>
        </View>
      </View>
      <View
        style={[
          styles.card,
          { backgroundColor: cardBackgroundColor, gap: Spacing['spacing-1'] },
        ]}>
        <Text style={styles.sectionTitle}>Methods</Text>
        <Text>
          {Object.keys(parsedProposal.params.optionalNamespaces).map(
            (namespace) => (
              <Text
                key={namespace}
                style={[styles.methodText, { color: Theme['text-secondary'] }]}>
                {parsedProposal.params.optionalNamespaces[
                  namespace
                ]?.methods?.join(', ')}
              </Text>
            ),
          )}
        </Text>
      </View>
      <View
        style={[
          styles.card,
          { backgroundColor: cardBackgroundColor, gap: Spacing['spacing-1'] },
        ]}>
        <Text style={styles.sectionTitle}>Events</Text>
        <Text>
          {Object.keys(parsedProposal.params.optionalNamespaces).map(
            (namespace) => (
              <Text
                key={namespace}
                style={[styles.methodText, { color: Theme['text-secondary'] }]}>
                {parsedProposal.params.optionalNamespaces[
                  namespace
                ]?.events?.join(', ')}
              </Text>
            ),
          )}
        </Text>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: Spacing['spacing-4'],
  },
  card: {
    borderRadius: BorderRadius['5'],
    padding: Spacing['spacing-5'],
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  appLogo: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius['3'],
    marginBottom: Spacing['spacing-4'],
  },
  appInfo: {
    gap: Spacing['spacing-1'],
  },
  appName: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  appAction: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 16,
  },
  appUrl: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 14,
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 18,
  },
  methodText: {
    fontSize: 14,
    lineHeight: 16,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
