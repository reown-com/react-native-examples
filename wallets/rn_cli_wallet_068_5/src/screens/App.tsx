import React, {useEffect, useState} from 'react';
import {
  Text,
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  useColorScheme,
  View,
  TextInput,
  Alert,
  Modal,
} from 'react-native';

import {Colors, Header} from 'react-native/Libraries/NewAppScreen';
import '@walletconnect/react-native-compat';
import {Core} from '@walletconnect/core';
import {IWeb3Wallet, Web3Wallet} from '@walletconnect/web3wallet';

import '@walletconnect/react-native-compat';
import {WalletConnectModal} from '../modals/WalletConnectModal';

// Required for TextEncoding Issue
const TextEncodingPolyfill = require('text-encoding');
const BigInt = require('big-integer');

Object.assign(global, {
  TextEncoder: TextEncodingPolyfill.TextEncoder,
  TextDecoder: TextEncodingPolyfill.TextDecoder,
  BigInt: BigInt,
});

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [web3WalletClient, setWeb3WalletClient] = useState<IWeb3Wallet>();
  const [approvalModal, setApprovalModal] = useState(false);

  const [WCURI, setWCUri] = useState<string>();

  const backgroundStyle = {
    flex: 1,
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const core = new Core({
    projectId: 'INSERT PROJECTID HERE',
  });

  async function initWeb3Wallet() {
    try {
      const web3wallet = await Web3Wallet.init({
        core,
        metadata: {
          name: 'Demo app',
          description: 'Demo Client as Wallet/Peer',
          url: 'www.walletconnect.com',
          icons: [],
        },
      });
      setWeb3WalletClient(web3wallet);
      // await subscribeToEvents(client);
    } catch (e) {
      console.log(e);
    }
  }

  async function subscribeToEvents(web3wallet) {
    if (!web3wallet)
      throw Error('No events to subscribe to b/c the client does not exist');

    try {
      web3wallet.on('session_delete', () => {
        console.log('user disconnected the session from their wallet');
        // reset();
      });
    } catch (e) {
      console.log(e);
    }
  }

  async function pair(params: {uri: string}) {
    console.log('-------');
    console.log('Modal State', approvalModal);
    // console.log(!web3WalletClient ? 'NOT Initalized' : 'Initialized');

    // console.log('uri', params.uri);
    // console.log('-------');

    const pairing = await core.pairing.pair({uri: params.uri});
    // console.log('-------');

    // console.log('pairing', pairing);

    // console.log('-------');

    setApprovalModal(true);
    console.log('Modal State', approvalModal);

    // return pairing;
  }

  useEffect(() => {
    initWeb3Wallet();
    // console.log('web3WalletClient', web3WalletClient);
  }, [web3WalletClient, WCURI, approvalModal]);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <WalletConnectModal
        open={setApprovalModal}
        visible={approvalModal}></WalletConnectModal>
      <View
        // contentContainerStyle={{flexGrow: 1}}
        style={backgroundStyle}>
        <View
          style={{
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Text>Connections</Text>
          <Text>
            Web3Client: {!web3WalletClient ? 'Initialize' : 'Initialized'}
          </Text>

          <TextInput
            style={{
              height: 40,
              margin: 12,
              borderWidth: 1,
              padding: 10,
              width: '80%',
            }}
            onChangeText={setWCUri}
            value={WCURI}
          />
          <Button
            title={'Connect'}
            onPress={() => pair({uri: WCURI})}
            color="#841584"
          />

          {/* <TextInput
            // style={styles.input}
            onChangeText={onChangeNumber}
            value={number}
            placeholder="useless placeholder"
            keyboardType="numeric"
          /> */}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default App;
