import { UnknownOutputParams, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { CloseModalButton } from '@/components/close-modal-button';
import { Modal, ModalRef } from '@/components/modal';
import { Button } from '@/components/primitives/button';
import { Text } from '@/components/primitives/text';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getChains } from '@/utils/helpers';
import { WalletKitTypes } from '@reown/walletkit';
import { Image } from 'expo-image';
import { useRef } from 'react';

interface ScreenParams extends UnknownOutputParams {
  proposal: string;
}

export default function ModalScreen() {
  const { proposal } = useLocalSearchParams<ScreenParams>();
  const cardBackgroundColor = useThemeColor('foreground-primary');
  const borderColor = useThemeColor('foreground-primary'); // Use same color for border

  const modalRef = useRef<ModalRef>(null);

  const parsedProposal = JSON.parse(proposal) as WalletKitTypes.SessionProposal;
  console.log('parsedProposal', parsedProposal);
  const chains = getChains(
    parsedProposal.params.requiredNamespaces,
    parsedProposal.params.optionalNamespaces,
  );
  console.log('chains', chains);

  const handleDismiss = () => {
    modalRef.current?.close();
  };

  return (
    <Modal ref={modalRef}>
      <View style={styles.contentContainer}>
        <CloseModalButton onPress={handleDismiss} style={styles.closeButton} />
        <View style={[styles.card, { alignItems: 'center' }]}>
          <Image
            source={parsedProposal.params.proposer.metadata.icons[0]}
            style={styles.logo}
          />
          <Text
            numberOfLines={1}
            fontSize={20}
            lineHeight={20}
            center
            ellipsizeMode="middle">
            Connect your wallet to{' '}
            {parsedProposal.params.proposer.metadata.name}
          </Text>
        </View>
        <View
          style={[
            styles.card,
            {
              backgroundColor: cardBackgroundColor,
              gap: Spacing['spacing-1'],
            },
          ]}>
          <Text fontSize={16} lineHeight={18} color="text-tertiary">
            {parsedProposal.params.proposer.metadata.url?.split('//')[1]}
          </Text>
        </View>
        <View
          style={[
            styles.card,
            {
              backgroundColor: cardBackgroundColor,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: Spacing['spacing-1'],
            },
          ]}>
          <Text fontSize={16} lineHeight={18} color="text-tertiary">
            {chains.length > 1 ? 'Networks' : 'Network'}
          </Text>
          <View style={styles.networkContainer}>
            {chains.slice(0, 5).map((chain, index) => (
              <View
                key={chain.chainId}
                style={[
                  styles.networkIconContainer,
                  {
                    zIndex: chains.length + index,
                    marginLeft: index === 0 ? 0 : -Spacing['spacing-2'],
                    borderColor,
                  },
                ]}>
                <Image
                  key={chain.chainId}
                  source={chain.icon}
                  style={styles.networkIcon}
                />
              </View>
            ))}
          </View>
        </View>
        <View style={styles.buttonsContainer}>
          <Button onPress={handleDismiss} style={styles.button} text="Cancel" />
          <Button
            onPress={() => {}}
            type="primary"
            style={styles.button}
            text="Connect"
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: Spacing['spacing-5'],
    paddingBottom: Spacing['spacing-12'],
    gap: Spacing['spacing-2'],
  },
  card: {
    borderRadius: BorderRadius['5'],
    padding: Spacing['spacing-5'],
  },
  closeButton: {
    alignSelf: 'flex-end',
    top: Spacing['spacing-4'],
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius['4'],
    marginBottom: Spacing['spacing-4'],
  },
  buttonsContainer: {
    marginTop: Spacing['spacing-2'],
    flexDirection: 'row',
    gap: Spacing['spacing-3'],
  },
  button: {
    flex: 1,
  },
  networkContainer: {
    flexDirection: 'row',
  },
  networkIconContainer: {
    borderRadius: BorderRadius['full'],
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  networkIcon: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius['full'],
  },
});
