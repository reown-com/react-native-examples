import React, {useCallback, useState} from 'react';
import {View, StyleSheet} from 'react-native';

import {SignClientTypes} from '@walletconnect/types';
import {Methods} from '../components/Modal/Methods';
import {Message} from '../components/Modal/Message';
import {getSignParamsMessage} from '@/utils/HelperUtil';
import {
  approveEIP155Request,
  rejectEIP155Request,
} from '@/utils/EIP155RequestHandlerUtil';
import {web3wallet} from '@/utils/WalletConnectUtil';
import {handleDeepLinkRedirect} from '@/utils/LinkingUtils';
import ModalStore from '../store/ModalStore';
import {useSnapshot} from 'valtio';
import Text from '../components/Text';
import {RequestModal} from './RequestModal';
import {Chains} from '../components/Modal/Chains';
import {PresetsUtil} from '@/utils/PresetsUtil';

export default function SessionSignTypedDataModal() {
  // Get request and wallet data from store
  const {data} = useSnapshot(ModalStore.state);
  const requestEvent = data?.requestEvent;
  const requestSession = data?.requestSession;
  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isLoadingReject, setIsLoadingReject] = useState(false);

  // Get required request data
  const {topic, params} = requestEvent;
  const {request, chainId} = params;
  const chain = PresetsUtil.getChainData(chainId.split(':')[1]);

  const method = request?.method;
  const message = getSignParamsMessage(request?.params);

  const requestMetadata = requestSession?.peer
    ?.metadata as SignClientTypes.Metadata;

  // Handle approve action (logic varies based on request method)
  const onApprove = useCallback(async () => {
    if (requestEvent) {
      setIsLoadingApprove(true);
      const response = await approveEIP155Request(requestEvent);
      try {
        await web3wallet.respondSessionRequest({
          topic,
          response,
        });
        handleDeepLinkRedirect(requestMetadata?.redirect);
      } catch (e) {
        console.log((e as Error).message, 'error');
        return;
      }
      setIsLoadingApprove(false);
      ModalStore.close();
    }
  }, [requestEvent, requestMetadata, topic]);

  // Handle reject action
  const onReject = useCallback(async () => {
    if (requestEvent) {
      setIsLoadingReject(true);
      const response = rejectEIP155Request(requestEvent);
      try {
        await web3wallet.respondSessionRequest({
          topic,
          response,
        });
      } catch (e) {
        console.log((e as Error).message, 'error');
        return;
      }
      setIsLoadingReject(false);
      ModalStore.close();
    }
  }, [requestEvent, topic]);

  // Ensure request and wallet are defined
  if (!requestEvent || !requestSession) {
    return <Text>Missing request data</Text>;
  }

  return (
    <RequestModal
      intention="wants to sign a message"
      metadata={requestMetadata}
      onApprove={onApprove}
      onReject={onReject}
      approveLoader={isLoadingApprove}
      rejectLoader={isLoadingReject}>
      <View style={styles.container}>
        <Chains chains={[chain]} />
        <Methods methods={[method]} />
        <Message message={JSON.stringify(message, null, 2)} />
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
