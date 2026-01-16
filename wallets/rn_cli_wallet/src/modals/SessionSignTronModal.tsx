/* eslint-disable react-hooks/rules-of-hooks */
import ModalStore from '@/store/ModalStore';
// import { styledToast } from '@/utils/HelperUtil'
import {
  approveTronRequest,
  rejectTronRequest,
} from '@/utils/TronRequestHandlerUtil';
import { walletKit } from '@/utils/WalletKitUtil';
import { RequestModal } from './RequestModal';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Message } from '@/components/Modal/Message';
import { Chains } from '@/components/Modal/Chains';
import { Methods } from '@/components/Modal/Methods';
import { PresetsUtil } from '@/utils/PresetsUtil';
import Toast from 'react-native-toast-message';

export default function SessionSignTronModal() {
  // Get request and wallet data from store
  const requestEvent = ModalStore.state.data?.requestEvent;
  const requestSession = ModalStore.state.data?.requestSession;
  const isLinkMode = requestSession?.transportType === 'link_mode';
  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isLoadingReject, setIsLoadingReject] = useState(false);

  // Ensure request and wallet are defined
  if (!requestEvent || !requestSession) {
    return <Text>Missing request data</Text>;
  }

  // Get required request data
  const { topic, params } = requestEvent;
  const { request, chainId } = params;
  const chain = PresetsUtil.getChainDataById(chainId);
  const method = requestEvent?.params?.request?.method!;
  // Handle approve action (logic varies based on request method)
  const onApprove = useCallback(async () => {
    try {
      if (requestEvent) {
        setIsLoadingApprove(true);
        const response = await approveTronRequest(requestEvent);
        await walletKit.respondSessionRequest({
          topic,
          response,
        });
      }
    } catch (e) {
      console.log((e as Error).message, 'error');
      Toast.show({
        text1: (e as Error).message,
        type: 'error',
      });
    } finally {
      setIsLoadingApprove(false);
      ModalStore.close();
    }
  }, [requestEvent, topic]);

  // Handle reject action
  const onReject = useCallback(async () => {
    if (requestEvent) {
      setIsLoadingReject(true);
      const response = rejectTronRequest(requestEvent);
      try {
        await walletKit.respondSessionRequest({
          topic,
          response,
        });
      } catch (e) {
        setIsLoadingReject(false);
        Toast.show({
          text1: (e as Error).message,
          type: 'error',
        });
        console.log((e as Error).message, 'error');
        return;
      }
      setIsLoadingReject(false);
      ModalStore.close();
    }
  }, [requestEvent, topic]);

  return (
    <RequestModal
      intention="sign a Tron message"
      metadata={requestSession.peer.metadata}
      onApprove={onApprove}
      onReject={onReject}
      isLinkMode={isLinkMode}
      approveLoader={isLoadingApprove}
      rejectLoader={isLoadingReject}
    >
      <View style={styles.container}>
        {chain ? <Chains chains={[chain]} /> : null}
        <Methods methods={[method]} />
        <Message message={JSON.stringify(request.params, null, 2)} />
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
  section: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionContent: {
    fontSize: 12,
    lineHeight: 18,
  },
});
