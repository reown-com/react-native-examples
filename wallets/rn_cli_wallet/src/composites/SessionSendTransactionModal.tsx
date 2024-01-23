import React, {useCallback, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {SignClientTypes} from '@walletconnect/types';
import {Tag} from '../components/Tag';
import {Methods} from '../components/Modal/Methods';
import {Message} from '../components/Modal/Message';
import {AcceptRejectButton} from '../components/AcceptRejectButton';
import {ModalHeader} from '../components/Modal/ModalHeader';
import {
  approveEIP155Request,
  rejectEIP155Request,
} from '../utils/EIP155RequestHandlerUtil';
import {web3wallet} from '../utils/WalletConnectUtil';
import {handleDeepLinkRedirect} from '../utils/LinkingUtils';
import ModalStore from '../store/ModalStore';
import {useSnapshot} from 'valtio';

export default function SessionSendTransactionModal() {
  const {data} = useSnapshot(ModalStore.state);
  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isLoadingReject, setIsLoadingReject] = useState(false);

  // Get request and wallet data from store
  const requestEvent = data?.requestEvent;
  const requestSession = data?.requestSession;

  const topic = requestEvent?.topic;
  const params = requestEvent?.params;
  const chainId = params?.chainId;
  const request = params?.request;
  const transaction = request?.params[0];
  const method = requestEvent?.params?.request?.method;

  const requestName = requestSession?.peer?.metadata?.name;
  const requestIcon = requestSession?.peer?.metadata?.icons[0];
  const requestURL = requestSession?.peer?.metadata?.url;
  const requestMetadata: SignClientTypes.Metadata =
    requestSession?.peer?.metadata;

  // Handle approve action
  const onApprove = useCallback(async () => {
    if (requestEvent && topic) {
      setIsLoadingApprove(true);
      try {
        const response = await approveEIP155Request(requestEvent);
        await web3wallet.respondSessionRequest({
          topic,
          response,
        });
        handleDeepLinkRedirect(requestMetadata?.redirect);
      } catch (e) {
        setIsLoadingApprove(false);
        console.log((e as Error).message, 'error');
        return;
      }
      setIsLoadingApprove(false);
      ModalStore.close();
    }
  }, [requestEvent, requestMetadata, topic]);

  // Handle reject action
  const onReject = useCallback(async () => {
    if (requestEvent && topic) {
      setIsLoadingReject(true);
      const response = rejectEIP155Request(requestEvent);
      try {
        await web3wallet.respondSessionRequest({
          topic,
          response,
        });
      } catch (e) {
        setIsLoadingReject(false);
        console.log((e as Error).message, 'error');
        return;
      }
      setIsLoadingReject(false);
      ModalStore.close();
    }
  }, [requestEvent, topic]);

  return (
    <View style={styles.modalContainer}>
      <ModalHeader name={requestName} url={requestURL} icon={requestIcon} />

      <View style={styles.divider} />

      <View style={styles.chainContainer}>
        <View style={styles.flexRowWrapped}>
          <Tag value={chainId} grey={true} />
        </View>
        <Methods methods={[method]} />
        <Message message={JSON.stringify(transaction, null, 2)} />
      </View>

      <View style={styles.flexRow}>
        <AcceptRejectButton accept={false} onPress={onReject} />
        <AcceptRejectButton accept={true} onPress={onApprove} />
      </View>
    </View>
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
