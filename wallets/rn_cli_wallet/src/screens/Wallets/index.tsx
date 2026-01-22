import { useSnapshot } from 'valtio';
import { View, StyleSheet, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { ScrollView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

import SettingsStore from '@/store/SettingsStore';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/Text';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import CopySvg from '@/assets/Copy';

// Chain icons
const chainIcons: Record<string, ImageSourcePropType> = {
  Ethereum: require('@/assets/chains/ethereum.webp'),
  Sui: require('@/assets/chains/sui.jpeg'),
  TON: require('@/assets/chains/ton.png'),
  Tron: require('@/assets/chains/tron.png'),
};

function truncateAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

interface WalletCardProps {
  name: string;
  address: string;
  icon: ImageSourcePropType;
  onCopy: () => void;
}

function WalletCard({ name, address, icon, onCopy }: WalletCardProps) {
  const Theme = useTheme();

  return (
    <TouchableOpacity
      onPress={onCopy}
      style={[styles.card, { backgroundColor: Theme['foreground-primary'] }]}>
      <View style={styles.iconContainer}>
        <Image source={icon} style={styles.chainIcon} resizeMode="contain" />
      </View>
      <View style={styles.cardContent}>
        <Text variant="lg-400" color="text-primary">
          {name}
        </Text>
        <Text variant="lg-400" color="text-secondary">
          {truncateAddress(address)}
        </Text>
      </View>
      <View style={styles.copyButton}>
        <CopySvg width={20} height={20} fill={Theme['text-primary']} />
      </View>
    </TouchableOpacity>
  );
}

export default function Wallets() {
  const { eip155Address, suiAddress, tonAddress, tronAddress } = useSnapshot(
    SettingsStore.state,
  );
  const Theme = useTheme();

  const copyToClipboard = (name: string, value: string) => {
    Clipboard.setString(value);
    Toast.show({
      type: 'info',
      text1: `${name} address copied`,
    });
  };

  const wallets = [
    { name: 'Ethereum', address: eip155Address, icon: chainIcons.Ethereum },
    { name: 'Sui', address: suiAddress, icon: chainIcons.Sui },
    { name: 'TON', address: tonAddress, icon: chainIcons.TON },
    { name: 'Tron', address: tronAddress, icon: chainIcons.Tron },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Theme['bg-primary'] }]}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic">
      <View style={styles.cardsContainer}>
        {wallets.map(wallet => (
          <WalletCard
            key={wallet.name}
            name={wallet.name}
            address={wallet.address}
            icon={wallet.icon}
            onCopy={() => copyToClipboard(wallet.name, wallet.address)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing[5],
  },
  cardsContainer: {
    gap: Spacing[3],
  },
  card: {
    borderRadius: BorderRadius[4],
    padding: Spacing[6],
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginRight: Spacing[3],
  },
  chainIcon: {
    width: 40,
    height: 40,
  },
  cardContent: {
    flex: 1,
    gap: Spacing['05'],
  },
  copyButton: {
    padding: Spacing[2],
  },
});
