import {useSnapshot} from 'valtio';
import {useEffect, useState} from 'react';
import {Text, View, Alert, ScrollView, DevSettings} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Clipboard from '@react-native-clipboard/clipboard';
import {getVersion, getBuildNumber} from 'react-native-device-info';

import {eip155Wallets, replaceMnemonic} from '@/utils/EIP155WalletUtil';
import SettingsStore from '@/store/SettingsStore';
import {Card} from '@/components/Card';
import {useTheme} from '@/hooks/useTheme';
import styles from './styles';
import {SettingsStackScreenProps} from '@/utils/TypesUtil';
import {TextInput} from 'react-native-gesture-handler';

type Props = SettingsStackScreenProps<'Settings'>;

export default function Settings({navigation}: Props) {
  const Theme = useTheme();
  const {eip155Address, socketStatus} = useSnapshot(SettingsStore.state);
  const [clientId, setClientId] = useState('');
  const [newMnemonic, setNewMnemonic] = useState('');
  useEffect(() => {
    async function getAsyncData() {
      const _clientId = await AsyncStorage.getItem('WALLETCONNECT_CLIENT_ID');
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

  const onAddNewAccount = () => {
    console.log('Add new account', newMnemonic);
    replaceMnemonic(newMnemonic)
      .then(() => {
        Alert.alert('Success', 'Mnemonic replaced, reloading the app...');
        DevSettings.reload();
      })
      .catch(e => {
        Alert.alert('Error', e.message);
      });
  };

  return (
    <ScrollView
      style={[styles.container]}
      contentContainerStyle={[styles.content]}
      contentInsetAdjustmentBehavior="automatic">
      <Text style={[styles.subtitle, {color: Theme['fg-100']}]}>Account</Text>
      <View style={styles.sectionContainer}>
        <Card
          title="ETH Address"
          value={eip155Address}
          onPress={() => copyToClipboard(eip155Address)}
        />
        <Card
          title="Seed Phrase"
          onPress={() =>
            copyToClipboard(eip155Wallets[eip155Address].getMnemonic())
          }
          value={eip155Wallets[eip155Address].getMnemonic()}
        />

        <TextInput
          style={{borderColor: 'black'}}
          placeholder="Enter mnemonic or private key"
          onChangeText={value => setNewMnemonic(value)}
        />
        <Card title="Add new account" onPress={onAddNewAccount} />
      </View>
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
