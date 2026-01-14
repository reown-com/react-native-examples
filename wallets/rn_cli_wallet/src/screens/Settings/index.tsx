import { useSnapshot } from 'valtio';
import { useEffect, useState } from 'react';
import { Text, View, Alert, ScrollView } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { getVersion, getBuildNumber } from 'react-native-device-info';

import { eip155Wallets } from '@/utils/EIP155WalletUtil';
import SettingsStore from '@/store/SettingsStore';
import ModalStore from '@/store/ModalStore';
import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import styles from './styles';
import { SettingsStackScreenProps } from '@/utils/TypesUtil';
import { storage } from '@/utils/storage';

type Props = SettingsStackScreenProps<'Settings'>;

export default function Settings({ navigation }: Props) {
  const Theme = useTheme();
  const { eip155Address, suiAddress, tonAddress, tronAddress, socketStatus } =
    useSnapshot(SettingsStore.state);
  const [clientId, setClientId] = useState('');

  useEffect(() => {
    async function getAsyncData() {
      const _clientId = await storage.getItem('WALLETCONNECT_CLIENT_ID');
      if (_clientId) {
        setClientId(_clientId);
      }
    }
    getAsyncData();
  }, []);

  const copyToClipboard = (value: string) => {
    Clipboard.setString(value);
    Alert.alert('Value copied to clipboard');
  };

  return (
    <ScrollView
      style={[styles.container]}
      contentContainerStyle={[styles.content]}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text style={[styles.subtitle, { color: Theme['fg-100'] }]}>Account</Text>
      <View style={styles.sectionContainer}>
        <Card
          title="EVM Address"
          value={eip155Address}
          onPress={() => copyToClipboard(eip155Address)}
        />
        <Card
          title="SUI Address"
          value={suiAddress}
          onPress={() => copyToClipboard(suiAddress)}
        />
        <Card
          title="TON Address"
          value={tonAddress}
          onPress={() => copyToClipboard(tonAddress)}
        />
        <Card
          title="Tron Address"
          value={tronAddress}
          onPress={() => copyToClipboard(tronAddress)}
        />
        <Card
          title="EVM Seed Phrase"
          onPress={() =>
            copyToClipboard(eip155Wallets[eip155Address].getMnemonic())
          }
          value={eip155Wallets[eip155Address]?.getMnemonic?.() ?? ''}
        />
        <Card
          title="Import EVM Wallet"
          onPress={() => ModalStore.open('ImportWalletModal', {})}
          icon="chevronRight"
        />
      </View>
      <Text style={[styles.subtitle, { color: Theme['fg-100'] }]}>Device</Text>
      <View style={styles.sectionContainer}>
        <Card
          title="Client ID"
          value={clientId}
          onPress={() => copyToClipboard(clientId)}
        />
        <Card
          title="App version"
          value={`${getVersion()} (${getBuildNumber()})`}
        />
        <Card title="Socket status" value={socketStatus} />
        <Card
          title="Read full logs"
          onPress={() => navigation.navigate('Logs')}
          icon="chevronRight"
        />
      </View>
    </ScrollView>
  );
}
