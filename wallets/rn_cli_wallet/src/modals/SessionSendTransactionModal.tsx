import React, {useCallback, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {SignClientTypes} from '@walletconnect/types';
import {Methods} from '../components/Modal/Methods';
import {Message} from '../components/Modal/Message';
import {
  approveEIP155Request,
  rejectEIP155Request,
} from '../utils/EIP155RequestHandlerUtil';
import {web3wallet} from '../utils/WalletConnectUtil';
import {handleDeepLinkRedirect} from '../utils/LinkingUtils';
import ModalStore from '../store/ModalStore';
import {useSnapshot} from 'valtio';
import {RequestModal} from './RequestModal';
import {getChainData} from '../data/chainsUtil';
import {Chains} from '../components/Modal/Chains';

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
  const chain = getChainData(chainId);
  const request = params?.request;
  const transaction = request?.params[0];
  const method = requestEvent?.params?.request?.method;

  const requestMetadata = requestSession?.peer
    ?.metadata as SignClientTypes.Metadata;

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
    <RequestModal
      intention="sign a transaction"
      metadata={requestMetadata}
      onApprove={onApprove}
      onReject={onReject}
      approveLoader={isLoadingApprove}
      rejectLoader={isLoadingReject}>
      <View style={styles.container}>
        <Chains chains={[chain]} />
        <Methods methods={[method]} />
        <Message message={JSON.stringify(transaction, null, 2)} />
      </View>
    </RequestModal>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 8,
  },
});
