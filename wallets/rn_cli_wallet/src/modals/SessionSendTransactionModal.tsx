import { useSnapshot } from 'valtio';
import { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SignClientTypes } from '@walletconnect/types';

import { Message } from '@/components/Modal/Message';
import { AppInfoCard } from '@/components/AppInfoCard';
import {
  approveEIP155Request,
  rejectEIP155Request,
} from '@/utils/EIP155RequestHandlerUtil';
import { walletKit } from '@/utils/WalletKitUtil';
import { handleRedirect } from '@/utils/LinkingUtils';
import ModalStore from '@/store/ModalStore';
import SettingsStore from '@/store/SettingsStore';
import { RequestModal } from '@/modals/RequestModal';

export default function SessionSendTransactionModal() {
  const { data } = useSnapshot(ModalStore.state);
  const { currentRequestVerifyContext } = useSnapshot(SettingsStore.state);
  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isLoadingReject, setIsLoadingReject] = useState(false);

  const { validation, isScam } = currentRequestVerifyContext?.verified || {};

  // Get request and wallet data from store
  const requestEvent = data?.requestEvent;
  const session = data?.requestSession;

  const topic = requestEvent?.topic;
  const params = requestEvent?.params;
  const request = params?.request;
  const transaction = request?.params[0];
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
          error: 'error' in response ? response.error.message : undefined,
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
      intention="Send a transaction for"
      metadata={peerMetadata}
      onApprove={onApprove}
      onReject={onReject}
      isLinkMode={isLinkMode}
      approveLoader={isLoadingApprove}
      rejectLoader={isLoadingReject}
      approveLabel="Send"
    >
      <View style={styles.container}>
        <AppInfoCard
          url={peerMetadata?.url}
          validation={validation}
          isScam={isScam}
        />
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
