import React from 'react';
import {View, StyleSheet} from 'react-native';
import Modal from 'react-native-modal';
import {SignClientTypes} from '@walletconnect/types';
import {Tag} from '../Tag';
import {Methods} from '../Modal/Methods';
import {Message} from '../Modal/Message';
import {getSignParamsMessage} from '../../utils/HelperUtils';
import {AcceptRejectButton} from '../AcceptRejectButton';
import {ModalHeader} from '../Modal/ModalHeader';
import {
  approveEIP155Request,
  rejectEIP155Request,
} from '../../utils/EIP155Request';
import {web3wallet} from '../../utils/Web3WalletClient';

interface SignModalProps {
  visible: boolean;
  setVisible: (arg0: boolean) => void;
  requestEvent: SignClientTypes.EventArguments['session_request'] | undefined;
  requestSession: any;
}

export function SignModal({
  visible,
  setVisible,
  requestEvent,
  requestSession,
}: SignModalProps) {
  const chainID = requestEvent?.params?.chainId?.toUpperCase();
  const method = requestEvent?.params?.request?.method;
  const message = getSignParamsMessage(requestEvent?.params?.request?.params);

  const requestName = requestSession?.peer?.metadata?.name;
  const requestIcon = requestSession?.peer?.metadata?.icons[0];
  const requestURL = requestSession?.peer?.metadata?.url;

  const {topic} = requestEvent;

  async function onApprove() {
    if (requestEvent) {
      const response = await approveEIP155Request(requestEvent);
      await web3wallet.respondSessionRequest({
        topic,
        response,
      });
      setVisible(false);
    }
  }

  async function onReject() {
    if (requestEvent) {
      const response = rejectEIP155Request(requestEvent);
      await web3wallet.respondSessionRequest({
        topic,
        response,
      });
      setVisible(false);
    }
  }

  return (
    <Modal backdropOpacity={0.6} isVisible={visible}>
      <View style={styles.modalContainer}>
        <ModalHeader name={requestName} url={requestURL} icon={requestIcon} />

        <View style={styles.divider} />

        <View style={styles.chainContainer}>
          <View style={styles.flexRowWrapped}>
            <Tag value={chainID} grey={true} />
          </View>
          <Methods methods={[method]} />
          <Message message={message} />
        </View>

        <View style={styles.flexRow}>
          <AcceptRejectButton accept={false} onPress={() => onReject()} />
          <AcceptRejectButton accept={true} onPress={() => onApprove()} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  chainContainer: {
    width: '90%',
    padding: 10,
    borderRadius: 25,
    backgroundColor: 'rgba(80, 80, 89, 0.1)',
  },
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
  },
  flexRowWrapped: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  modalContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 34,
    paddingTop: 30,
    backgroundColor: 'rgba(242, 242, 247, 0.9)',
    width: '100%',
    position: 'absolute',
    bottom: 44,
  },
  rejectButton: {
    color: 'red',
  },
  dappTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  imageContainer: {
    width: 48,
    height: 48,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: 'rgba(60, 60, 67, 0.36)',
    marginVertical: 16,
  },
});
