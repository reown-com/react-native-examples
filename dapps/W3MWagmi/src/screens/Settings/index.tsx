import React, {useEffect, useState} from 'react';
import {Text, View, Alert, ScrollView} from 'react-native';
import {useAccount} from 'wagmi';
import Clipboard from '@react-native-clipboard/clipboard';
import {getVersion, getBuildNumber} from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSnapshot} from 'valtio';

import SettingsStore from '@/stores/SettingsStore';
import {Card} from '@/components/Card';
import {useTheme} from '@/hooks/useTheme';
import {HomeTabScreenProps} from '@/utils/TypesUtil';
import styles from './styles';
import {WalletInfo} from './components/WalletInfo';

type Props = HomeTabScreenProps<'SettingsScreen'>;

function SettingsScreen({navigation}: Props) {
  const Theme = useTheme();
  const {connector} = useAccount();
  const [clientId, setClientId] = useState('');
  const {socketStatus} = useSnapshot(SettingsStore.state);

  useEffect(() => {
    async function getAsyncData() {
      let _clientId = await AsyncStorage.getItem('WALLETCONNECT_CLIENT_ID');
      if (_clientId) {
        setClientId(_clientId);
      } else {
        const provider = await connector?.getProvider();
        _clientId =
          // @ts-ignore
          await provider?.signer?.rpcProviders?.eip155?.client?.core?.crypto?.getClientId();

        if (_clientId) {
          AsyncStorage.setItem('WALLETCONNECT_CLIENT_ID', _clientId);
          setClientId(_clientId);
        }
      }
    }
    getAsyncData();
  }, [connector]);

  const copyToClipboard = (value: string) => {
    Clipboard.setString(value);
    Alert.alert('Value copied to clipboard');
  };

  return (
    <ScrollView
      style={[styles.container]}
      contentContainerStyle={[styles.content]}
      contentInsetAdjustmentBehavior="automatic">
      <Text style={[styles.subtitle, {color: Theme['fg-100']}]}>Device</Text>
      <View style={styles.sectionContainer}>
        <Card
          title="Client ID"
          value={clientId}
          onPress={() => copyToClipboard(clientId)}
        />
        <Card
          title="App version"
          value={`${getVersion()} (${getBuildNumber()})`}
          onPress={() =>
            copyToClipboard(`${getVersion()} (${getBuildNumber()})`)
          }
        />
        <Card title="Socket status" value={socketStatus} />
        <Card
          title="Read full logs"
          onPress={() => navigation.navigate('Logs')}
          icon="chevronRight"
        />
        <WalletInfo />
      </View>
    </ScrollView>
  );
}

export default SettingsScreen;
