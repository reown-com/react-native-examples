/* eslint-disable react-hooks/rules-of-hooks */
import { useSnapshot } from 'valtio';
import LogStore from '@/store/LogStore';
import ModalStore from '@/store/ModalStore';
import SettingsStore from '@/store/SettingsStore';
import {
  approveCantonRequest,
  rejectCantonRequest,
} from '@/utils/CantonRequestHandlerUtil';
import { walletKit } from '@/utils/WalletKitUtil';
import { RequestModal } from './RequestModal';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Message } from '@/components/Modal/Message';
import { AppInfoCard } from '@/components/AppInfoCard';
import { NetworkInfoCard } from '@/components/NetworkInfoCard';
import Toast from 'react-native-toast-message';
import { Spacing } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';
import { haptics } from '@/utils/haptics';

export default function SessionSignCantonModal() {
  const { currentRequestVerifyContext } = useSnapshot(SettingsStore.state);
  const requestEvent = ModalStore.state.data?.requestEvent;
  const requestSession = ModalStore.state.data?.requestSession;
  const isLinkMode = requestSession?.transportType === 'link_mode';
  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isLoadingReject, setIsLoadingReject] = useState(false);

  const { validation, isScam } = currentRequestVerifyContext?.verified || {};

  if (!requestEvent || !requestSession) {
    return (
      <Text variant="md-400" color="text-error">
        Missing request data
      </Text>
    );
  }

  const { topic, params } = requestEvent;
  const { request } = params;

  const onApprove = useCallback(async () => {
    try {
      if (requestEvent) {
        setIsLoadingApprove(true);
        const response = await approveCantonRequest(requestEvent);
        await walletKit.respondSessionRequest({
          topic,
          response,
        });
        haptics.requestResponse();
      }
    } catch (e) {
      LogStore.error(
        (e as Error).message,
        'SessionSignCantonModal',
        'onApprove',
      );
      Toast.show({
        text1: (e as Error).message,
        type: 'error',
      });
    } finally {
      setIsLoadingApprove(false);
      ModalStore.close();
    }
  }, [requestEvent, topic]);

  const onReject = useCallback(async () => {
    if (requestEvent) {
      setIsLoadingReject(true);
      try {
        const response = rejectCantonRequest(requestEvent);
        await walletKit.respondSessionRequest({
          topic,
          response,
        });
        haptics.requestResponse();
      } catch (e) {
        LogStore.error(
          (e as Error).message,
          'SessionSignCantonModal',
          'onReject',
        );
        Toast.show({
          type: 'error',
          text1: 'Rejection failed',
          text2: (e as Error).message,
        });
      } finally {
        setIsLoadingReject(false);
        ModalStore.close();
      }
    }
  }, [requestEvent, topic]);

  return (
    <RequestModal
      intention="Handle a Canton request for"
      metadata={requestSession.peer.metadata}
      onApprove={onApprove}
      onReject={onReject}
      isLinkMode={isLinkMode}
      approveLoader={isLoadingApprove}
      rejectLoader={isLoadingReject}
      approveLabel="Approve"
    >
      <View style={styles.container}>
        <AppInfoCard
          url={requestSession?.peer?.metadata?.url}
          validation={validation}
          isScam={isScam}
        />
        <NetworkInfoCard chainId={params.chainId} />
        <Message message={JSON.stringify(request.params, null, 2)} />
      </View>
    </RequestModal>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: Spacing[2],
    paddingHorizontal: Spacing[4],
    rowGap: Spacing[2],
  },
});
