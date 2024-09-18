import {useSnapshot} from 'valtio';
import {useCallback, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {SignClientTypes} from '@walletconnect/types';

import {Methods} from '@/components/Modal/Methods';
import {Message} from '@/components/Modal/Message';
import {
  approveEIP155Request,
  rejectEIP155Request,
} from '@/utils/EIP155RequestHandlerUtil';
import {walletKit} from '@/utils/WalletKitUtil';
import {handleRedirect} from '@/utils/LinkingUtils';
import ModalStore from '@/store/ModalStore';
import {RequestModal} from '@/modals/RequestModal';
import {Chains} from '@/components/Modal/Chains';
import {PresetsUtil} from '@/utils/PresetsUtil';

export default function SessionSendTransactionModal() {
  const {data} = useSnapshot(ModalStore.state);
  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isLoadingReject, setIsLoadingReject] = useState(false);

  // Get request and wallet data from store
  const requestEvent = data?.requestEvent;
  const session = data?.requestSession;

  const topic = requestEvent?.topic;
  const params = requestEvent?.params;
  const chainId = params?.chainId;
  const chain = PresetsUtil.getChainData(chainId?.split(':')[1] || '');
  const request = params?.request;
  const transaction = request?.params[0];
  const method = requestEvent?.params?.request?.method!;
  const isLinkMode = session?.transportType === 'link_mode';

  const peerMetadata = session?.peer?.metadata as SignClientTypes.Metadata;

  // Handle approve action
  const onApprove = useCallback(async () => {
    if (requestEvent && topic) {
      setIsLoadingApprove(true);
      try {
        const response = await approveEIP155Request(requestEvent);
        await walletKit.respondSessionRequest({
          topic,
          response,
        });
        handleRedirect({
          peerRedirect: peerMetadata?.redirect,
          isLinkMode: isLinkMode,
        });
      } catch (e) {
        console.log((e as Error).message, 'error');
        return;
      }
      setIsLoadingApprove(false);
      ModalStore.close();
    }
  }, [requestEvent, peerMetadata, topic, isLinkMode]);

  // Handle reject action
  const onReject = useCallback(async () => {
    if (requestEvent && topic) {
      setIsLoadingReject(true);
      const response = rejectEIP155Request(requestEvent);
      try {
        await walletKit.respondSessionRequest({
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

  return (
    <RequestModal
      intention="sign a transaction"
      metadata={peerMetadata}
      onApprove={onApprove}
      onReject={onReject}
      isLinkMode={isLinkMode}
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
    marginVertical: 8,
    paddingHorizontal: 16,
    rowGap: 8,
  },
});
