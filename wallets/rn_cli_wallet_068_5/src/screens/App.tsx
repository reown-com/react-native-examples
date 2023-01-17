import React, {useCallback, useEffect, useState} from 'react';
import {
  Text,
  Button,
  SafeAreaView,
  Alert,
  StatusBar,
  useColorScheme,
  View,
  TextInput,
  StyleSheet,
} from 'react-native';

import {SignClientTypes} from '@walletconnect/types';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import '@walletconnect/react-native-compat';
// import {Core} from '@walletconnect/core';
// import {IWeb3Wallet, Web3Wallet} from '@walletconnect/web3wallet';
import SignClient from '@walletconnect/sign-client';
import {SessionTypes} from '@walletconnect/types';

import '@walletconnect/react-native-compat';
import {WalletConnectModal} from '../modals/WalletConnectModal';

import {CircleActionButton} from '../components/CircleActionButton';

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
  // const [web3WalletClient, setWeb3WalletClient] = useState<IWeb3Wallet>();
  const [signClient, setSignClient] = useState<SignClient>();
  const [approvalModal, setApprovalModal] = useState(false);
  const [pairedProposal, setPairedProposal] = useState();
  const [WCURI, setWCUri] = useState<string>();
  const ETH_ADDRESS_HARDCODE = '0xa36B1F77296081884d0Ae102a888cb7df1aA57Ed';

  const backgroundStyle = {
    flex: 1,
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  async function createSignClient() {
    try {
      const client = await SignClient.init({
        projectId: '43a917ec9ac926c2e20f0104e96eacde',
        relayUrl: 'wss://relay.walletconnect.com',
        metadata: {
          name: 'React Native Example',
          description: 'React Native Web3Wallet for WalletConnect',
          url: 'https://walletconnect.com/',
          icons: ['https://avatars.githubusercontent.com/u/37784886'],
        },
      });
      setSignClient(client);
    } catch (e) {
      console.log(e);
    }
  }

  async function handleAccept() {
    // Get required proposal data
    const {id, params} = pairedProposal;
    const {requiredNamespaces, relays} = params;

    if (pairedProposal) {
      const namespaces: SessionTypes.Namespaces = {};
      Object.keys(requiredNamespaces).forEach(key => {
        // ToDO: Revisit for the other accounts we choose.
        const accounts = [`eip155:1:${ETH_ADDRESS_HARDCODE}`];
        // requiredNamespaces[key].chains.map((chain) => {
        // 	selectedAccounts[key].map((acc) =>
        // 		accounts.push(`${chain}:${acc}`),
        // 	)
        // })
        namespaces[key] = {
          accounts,
          methods: requiredNamespaces[key].methods,
          events: requiredNamespaces[key].events,
        };
      });

      const {acknowledged} = await signClient.approve({
        id: id,
        relayProtocol: relays[0].protocol,
        namespaces,
      });
      // console.log('Session Proposal id', id);
      // console.log('Session Proposal relayProtocol', relays[0].protocol);
      // console.log('Session Proposal namespaces', namespaces);

      setApprovalModal(false);
      await acknowledged();
    }
  }

  // @notice Init pairing
  async function pair(params: {uri: string}) {
    const pairing = await signClient.pair({uri: params.uri});
    console.log('pairing', pairing);
    setApprovalModal(true);
    return pairing;
  }

  // @notice Function to handle the pairing of the client. To init the modal
  const onSessionProposal = useCallback(
    (proposal: SignClientTypes.EventArguments['session_proposal']) => {
      console.log('SessionProposalMade', {proposal});
      setPairedProposal(proposal);
    },
    [],
  );

  if (signClient) {
    signClient.on('session_proposal', onSessionProposal);
  }

  useEffect(() => {
    if (!signClient) {
      createSignClient();
    }
  }, [signClient, WCURI, approvalModal]);

  //@notice: Rendering of Heading + ScrollView of Conenctions + Action Button
  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={{padding: 16, flex: 1}}>
        <Text style={styles.heading}>Connections</Text>

        <WalletConnectModal
          proposal={pairedProposal}
          open={setApprovalModal}
          visible={approvalModal}
          handleAccept={handleAccept}
        />
        <View style={styles.container}>
          <Text>Web3Client: {!signClient ? 'Initialize' : 'Initialized'}</Text>

          <TextInput
            style={styles.textInput}
            onChangeText={setWCUri}
            value={WCURI}
          />

          <View style={styles.flexRow}>
            <CircleActionButton
              copyImage={true}
              handlePress={() => pair({uri: WCURI})}
            />
            <CircleActionButton
              copyImage={false}
              handlePress={() => setApprovalModal(true)}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  heading: {
    fontSize: 34,
    fontWeight: 'bold',
  },
  container: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    // ToDo: Fix this by passing props in StyleSheet
    // backgroundColor: isDarkMode ? Colors.black : Colors.white,
  },
  textInput: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: '80%',
  },
  flexRow: {
    position: 'absolute',
    bottom: 50,
    right: 0,
    display: 'flex',
    flexDirection: 'row',
  },
});
