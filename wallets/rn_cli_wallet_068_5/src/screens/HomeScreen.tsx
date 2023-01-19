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
  Image,
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
import {NavigationContainer} from '@react-navigation/native';
import {CopyURIDialog} from '../components/CopyURIDialog';

// Required for TextEncoding Issue
const TextEncodingPolyfill = require('text-encoding');
const BigInt = require('big-integer');

Object.assign(global, {
  TextEncoder: TextEncodingPolyfill.TextEncoder,
  TextDecoder: TextEncodingPolyfill.TextDecoder,
  BigInt: BigInt,
});

const HomeScreen = () => {
  const isDarkMode = useColorScheme() === 'dark';
  // const [web3WalletClient, setWeb3WalletClient] = useState<IWeb3Wallet>();
  const [signClient, setSignClient] = useState<SignClient>();
  const [approvalModal, setApprovalModal] = useState(false);
  const [copyDialog, setCopyDialog] = useState(false);
  const [pairedProposal, setPairedProposal] = useState();
  const [WCURI, setWCUri] = useState<string>();
  const ETH_ADDRESS_HARDCODE = '0xa36B1F77296081884d0Ae102a888cb7df1aA57Ed';

  const backgroundStyle = {
    flex: 1,
    padding: 16,
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

  const handleCancel = () => {
    setCopyDialog(false);
  };

  // @notice Init pairing
  async function pair() {
    // const pairing = await signClient.pair({uri: WCURI});
    handleCancel();
    setApprovalModal(true);
    // return pairing;
  }

  // @notice Function to handle the pairing of the client. To init the modal
  const onSessionProposal = useCallback(
    (proposal: SignClientTypes.EventArguments['session_proposal']) => {
      // setApprovalModal(true);
      setPairedProposal(proposal);
    },
    [],
  );

  const EIP155_SIGNING_METHODS = {
    PERSONAL_SIGN: 'personal_sign',
    ETH_SIGN: 'eth_sign',
    ETH_SIGN_TRANSACTION: 'eth_signTransaction',
    ETH_SIGN_TYPED_DATA: 'eth_signTypedData',
    ETH_SIGN_TYPED_DATA_V3: 'eth_signTypedData_v3',
    ETH_SIGN_TYPED_DATA_V4: 'eth_signTypedData_v4',
    ETH_SEND_RAW_TRANSACTION: 'eth_sendRawTransaction',
    ETH_SEND_TRANSACTION: 'eth_sendTransaction',
  };

  const onSessionRequest = useCallback(
    async (requestEvent: SignClientTypes.EventArguments['session_request']) => {
      console.log('session_request', requestEvent);

      // const {topic, params} = requestEvent;
      // const {request} = params;
      // const requestSession = signClient.session.get(topic);

      // switch (request.method) {
      //   case EIP155_SIGNING_METHODS.ETH_SIGN:
      //   case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
      //     return ModalStore.open('SessionSignModal', {
      //       requestEvent,
      //       requestSession,
      //     });

      //   case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
      //   case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
      //   case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4:
      //     return ModalStore.open('SessionSignTypedDataModal', {
      //       requestEvent,
      //       requestSession,
      //     });

      //   case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
      //   case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
      //     return ModalStore.open('SessionSendTransactionModal', {
      //       requestEvent,
      //       requestSession,
      //     });

      //   // case COSMOS_SIGNING_METHODS.COSMOS_SIGN_DIRECT:
      //   // case COSMOS_SIGNING_METHODS.COSMOS_SIGN_AMINO:
      //   //   return ModalStore.open('SessionSignCosmosModal', { requestEvent, requestSession })

      //   // case SOLANA_SIGNING_METHODS.SOLANA_SIGN_MESSAGE:
      //   // case SOLANA_SIGNING_METHODS.SOLANA_SIGN_TRANSACTION:
      //   //   return ModalStore.open('SessionSignSolanaModal', { requestEvent, requestSession })

      //   default:
      //     return ModalStore.open('SessionUnsuportedMethodModal', {
      //       requestEvent,
      //       requestSession,
      //     });
      // }
    },
    [],
  );

  if (signClient) {
    signClient.on('session_proposal', onSessionProposal);
    signClient.on('session_request', onSessionRequest);
  }

  useEffect(() => {
    if (!signClient) {
      createSignClient();
    }
  }, [signClient, WCURI, approvalModal, copyDialog]);

  //@notice: Rendering of Heading + ScrollView of Conenctions + Action Button
  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />

      <CopyURIDialog
        pair={pair}
        wcURI={WCURI}
        setVisible={handleCancel}
        setWCUri={setWCUri}
        visible={copyDialog}
      />

      <WalletConnectModal
        onModalHide={() => {
          console.debug('hello');
        }}
        proposal={pairedProposal}
        open={setApprovalModal}
        visible={approvalModal}
        handleAccept={handleAccept}
      />

      <View style={{padding: 16, flex: 1}}>
        <Text style={styles.heading}>Connections</Text>

        <View style={styles.container}>
          <Image
            source={require('../assets/emptyStateIcon.png')}
            style={styles.imageContainer}
          />
          <Text style={styles.greyText}>
            Apps you connect with will appear here. To connect 📱 scan or 📋
            paste the code that is displayed in the app.
          </Text>
          <View style={styles.flexRow}>
            <CircleActionButton
              copyImage={false}
              handlePress={() => setCopyDialog(true)}
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

export default HomeScreen;

const styles = StyleSheet.create({
  heading: {
    fontSize: 34,
    fontWeight: 'bold',
    marginTop: 16,
  },
  greyText: {
    fontSize: 15,
    lineHeight: 21,
    color: '#798686',
    width: '80%',
    textAlign: 'center',
  },
  imageContainer: {
    height: 30,
    width: 35,
    marginBottom: 16,
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
