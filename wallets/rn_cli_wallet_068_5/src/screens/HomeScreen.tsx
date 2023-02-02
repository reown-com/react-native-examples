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
  Image,
} from 'react-native';
import Modal from 'react-native-modal';

import {SignClientTypes} from '@walletconnect/types';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {SessionTypes} from '@walletconnect/types';
import {currentETHAddress, web3wallet, _pair} from '../utils/Web3WalletClient';

import {PairModal} from '../modals/PairModal';

import {CopyURIDialog} from '../components/CopyURIDialog';
import {SignModal} from '../modals/SignModal';
import Sessions from '../components/HomeScreen/Sessions';
import ActionButtons from '../components/HomeScreen/ActionButtons';
import {useNavigation} from '@react-navigation/native';
import {EIP155_SIGNING_METHODS} from '../data/EIP155';
import {SignTypedDataModal} from '../modals/SignTypedDataModal';
import {SendTransactionModal} from '../modals/SendTransactionModal';

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
  1) signModal: X
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

  // Modal Visible State
  const [approvalModal, setApprovalModal] = useState(false);
  const [signModal, setSignModal] = useState(false);
  const [signTypedDataModal, setSignTypedDataModal] = useState(false);
  const [sendTransactionModal, setSendTransactionModal] = useState(false);
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
        // ToDO: Revisit for the other NETWORK accounts we choose.
        const accounts = [`eip155:1:${currentETHAddress}`];
        // requiredNamespaces[key].chains.map(chain => {
        //   selectedAccounts[key].map(acc => accounts.push(`${chain}:${acc}`));
        // });

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

  // ToDo / Consider: How best to move onSessionProposal() + onSessionRequest() + the if statement Listeners.
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
      const requestSessionData =
        web3wallet.engine.signClient.session.get(topic);

      switch (request.method) {
        case EIP155_SIGNING_METHODS.ETH_SIGN:
        case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
          setRequestSession(requestSessionData);
          setRequestEventData(requestEvent);
          setSignModal(true);
          return;

        case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
        case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
        case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4:
          setRequestSession(requestSessionData);
          setRequestEventData(requestEvent);
          setSignTypedDataModal(true);
          return;
        case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
        case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
          setRequestSession(requestSessionData);
          setRequestEventData(requestEvent);
          setSendTransactionModal(true);
          return;
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
    signModal,
    sendTransactionModal,
    requestEventData,
    requestSession,
  ]);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />

      <PairModal
        proposal={pairedProposal}
        open={setApprovalModal}
        visible={approvalModal}
        handleAccept={handleAccept}
      />

      {requestEventData && requestSession && signModal && (
        <SignModal
          web3wallet={web3wallet}
          visible={signModal}
          setVisible={setSignModal}
          requestEvent={requestEventData}
          requestSession={requestSession}
          setRequestEventData={setRequestEventData}
          setRequestSession={setRequestSession}
        />
      )}

      {requestEventData && requestSession && sendTransactionModal && (
        <SendTransactionModal
          web3wallet={web3wallet}
          visible={sendTransactionModal}
          setVisible={setSendTransactionModal}
          requestEvent={requestEventData}
          requestSession={requestSession}
          setRequestEventData={setRequestEventData}
          setRequestSession={setRequestSession}
        />
      )}

      {requestEventData && requestSession && signTypedDataModal && (
        <SignTypedDataModal
          web3wallet={web3wallet}
          visible={signTypedDataModal}
          setVisible={setSignTypedDataModal}
          requestEvent={requestEventData}
          requestSession={requestSession}
          setRequestEventData={setRequestEventData}
          setRequestSession={setRequestSession}
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
            <Image
              source={require('../assets/SettingsIcon.png')}
              style={styles.imageContainer}
            />
          </TouchableOpacity>
        </View>
        <Sessions />
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
    height: 24,
    width: 24,
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
