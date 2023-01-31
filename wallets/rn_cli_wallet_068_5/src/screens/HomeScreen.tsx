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
import {SessionTypes} from '@walletconnect/types';
import {
  core,
  currentETHAddress,
  web3wallet,
  _pair,
} from '../utils/Web3WalletClient';

import '@walletconnect/react-native-compat';
import {WalletConnectModal} from '../modals/WalletConnectModal';

import {CopyURIDialog} from '../components/CopyURIDialog';
import {PersonalSignModal} from '../modals/PersonalSignModal';
import Sessions from '../components/HomeScreen/Sessions';
import ActionButtons from '../components/HomeScreen/ActionButtons';
import {useNavigation} from '@react-navigation/native';

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

  async function handleAccept() {
    // Get required proposal data
    const {id, params} = pairedProposal;
    const {requiredNamespaces, relays} = params;

    if (pairedProposal) {
      const namespaces: SessionTypes.Namespaces = {};
      Object.keys(requiredNamespaces).forEach(key => {
        // ToDO: Revisit for the other accounts we choose.
        const accounts = [`eip155:1:${currentETHAddress}`];
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

      await web3wallet.approveSession({
        id,
        relayProtocol: relays[0].protocol,
        namespaces,
      });

      setApprovalModal(false);
    }
  }

  const handleCancel = () => {
    setCopyDialog(false);
  };

  async function pair() {
    const pairing = await _pair({uri: WCURI});
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

  if (web3wallet) {
    web3wallet.on('session_proposal', onSessionProposal);
    web3wallet.on('session_request', onSessionRequest);
  }

  useEffect(() => {}, [
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
          signClient={web3wallet}
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
        <Sessions signClient={web3wallet} />
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
