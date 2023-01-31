import React, {useCallback, useEffect, useState} from 'react';
import {
  Text,
  SafeAreaView,
  StatusBar,
  useColorScheme,
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import Modal from 'react-native-modal';

import {SignClientTypes} from '@walletconnect/types';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import '@walletconnect/react-native-compat';
import {Core} from '@walletconnect/core';
import {IWeb3Wallet, Web3Wallet} from '@walletconnect/web3wallet';
import SignClient from '@walletconnect/sign-client';
import {SessionTypes} from '@walletconnect/types';

import '@walletconnect/react-native-compat';
import {WalletConnectModal} from '../modals/WalletConnectModal';
import {
  createOrRestoreEIP155Wallet,
  eip155Wallets,
} from '../utils/EIP155Wallet';

import {CopyURIDialog} from '../components/CopyURIDialog';
import {PersonalSignModal} from '../modals/PersonalSignModal';
import Sessions from '../components/HomeScreen/Sessions';
import ActionButtons from '../components/HomeScreen/ActionButtons';
import {useNavigation} from '@react-navigation/native';

// @ts-expect-error -  is a virtualised module via Babel config.
import {ENV_PROJECT_ID, ENV_RELAY_URL} from '@env';

// @notice: Required for TextEncoding Issue
const TextEncodingPolyfill = require('text-encoding');
const BigInt = require('big-integer');

Object.assign(global, {
  TextEncoder: TextEncodingPolyfill.TextEncoder,
  TextDecoder: TextEncodingPolyfill.TextDecoder,
  BigInt: BigInt,
});

/**
  @notice: HomeScreen for Web3Wallet Example
  @dev: Placed the async functions on this page for simplicity

  Async Functions:
  1) createSignClient(): For creating a SignClient instance
  2) handleAccept(): To handle the initial connection proposal accept event
  3) handleReject(): To handle the initial connection reject event
  4) pair(): To handle the initial connection reject event
  5) onSessionRequest: To handle the session request event (i.e. eth_sign)

  States:
  1) signClient: X
  1) approvalModal: X
  1) personalSignModal: X
  1) copyDialog: X
  1) pairedProposal: X

  Rendering:
  1) Status Bar
  2) Modals
    - PairingModal
    - MethodsModal
    - CopyURIDialog
    - QRCodeModal
  3) Main Content
    - Header
    - Sessions
    - Action Buttons

**/

const HomeScreen = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const navigation = useNavigation();

  // Web3Wallet Client
  const [web3WalletClient, setWeb3WalletClient] = useState<IWeb3Wallet>();
  const [signClient, setSignClient] = useState<SignClient>();

  // Account State
  const [account, setAccount] = useState<string>();

  // Modal Visibie State
  const [approvalModal, setApprovalModal] = useState(false);
  const [personalSignModal, setPersonalSignModal] = useState(false);
  const [copyDialog, setCopyDialog] = useState(false);

  // Pairing State
  const [pairedProposal, setPairedProposal] = useState();
  const [WCURI, setWCUri] = useState<string>();
  const [requestEventData, setRequestEventData] = useState();
  const [requestSession, setRequestSession] = useState();

  const backgroundStyle = {
    flex: 1,
    padding: 16,
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  async function createSignClient() {
    try {
      const client = await SignClient.init({
        projectId: ENV_PROJECT_ID,
        relayUrl: ENV_RELAY_URL,
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
        const accounts = [`eip155:1:${account}`];
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

  async function pair() {
    const pairing = await signClient.pair({uri: WCURI});
    setCopyDialog(false);
    setWCUri('');
    return pairing;
  }

  const onSessionProposal = useCallback(
    (proposal: SignClientTypes.EventArguments['session_proposal']) => {
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
      const {topic, params} = requestEvent;
      const {request} = params;
      const requestSessionData = signClient?.session.get(topic);

      switch (request.method) {
        case EIP155_SIGNING_METHODS.ETH_SIGN:
        case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
          setRequestSession(requestSessionData);
          setRequestEventData(requestEvent);
          setPersonalSignModal(true);
          return;

        // case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
        // case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
        // case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4:
        //   return ModalStore.open('SessionSignTypedDataModal', { requestEvent, requestSession })

        // case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
        // case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
        //   return ModalStore.open('SessionSendTransactionModal', { requestEvent, requestSession })
      }
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
      const {eip155Addresses} = createOrRestoreEIP155Wallet();
      // const seed = eip155Wallets[eip155Addresses[0]].getMnemonic();
      setAccount(eip155Addresses[0]);
      // console.log('EIP...', eip155Addresses);
      // console.log('seed...', seed);
    }
  }, [
    signClient,
    WCURI,
    approvalModal,
    copyDialog,
    personalSignModal,
    requestEventData,
    requestSession,
  ]);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />

      <WalletConnectModal
        proposal={pairedProposal}
        open={setApprovalModal}
        visible={approvalModal}
        handleAccept={handleAccept}
      />

      {requestEventData && requestSession && (
        <PersonalSignModal
          signClient={signClient}
          visible={personalSignModal}
          setVisible={setPersonalSignModal}
          requestEvent={requestEventData}
          requestSession={requestSession}
        />
      )}

      <Modal
        isVisible={copyDialog}
        backdropOpacity={0.4}
        onModalHide={() => {
          setTimeout(
            () => setApprovalModal(true),
            Platform.OS === 'ios' ? 200 : 0,
          );
        }}
        backdropColor="transparent">
        <CopyURIDialog
          pair={pair}
          wcURI={WCURI}
          setVisible={handleCancel}
          setApprovalModal={setApprovalModal}
          setWCUri={setWCUri}
          visible={copyDialog}
        />
      </Modal>

      <View style={styles.mainScreenContainer}>
        <View style={styles.flexRow}>
          <Text style={styles.heading}>Apps</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Text>Settings</Text>
          </TouchableOpacity>
        </View>
        <Sessions signClient={signClient} />
        <ActionButtons
          setApprovalModal={setApprovalModal}
          setCopyDialog={setCopyDialog}
        />
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
  mainScreenContainer: {
    padding: 16,
    flex: 1,
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
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
