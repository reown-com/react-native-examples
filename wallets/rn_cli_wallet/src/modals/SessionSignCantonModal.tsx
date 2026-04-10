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

  const topic = requestEvent?.topic ?? '';
  const params = requestEvent?.params;
  const request = params?.request;

  const onApprove = useCallback(async () => {
    if (!requestEvent) {
      return;
    }
    setIsLoadingApprove(true);
    try {
      const response = await approveCantonRequest(requestEvent);
      await walletKit.respondSessionRequest({
        topic,
        response,
      });
      haptics.requestResponse();
    } catch (e) {
      // Respond with JSON-RPC error so the dapp doesn't hang
      try {
        const errorResponse = rejectCantonRequest(requestEvent);
        await walletKit.respondSessionRequest({
          topic,
          response: errorResponse,
        });
      } catch (_) {
        // best effort
      }
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
    if (!requestEvent) {
      return;
    }
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
  }, [requestEvent, topic]);

  if (!requestEvent || !requestSession || !params || !request) {
    return (
      <Text variant="md-400" color="text-error">
        Missing request data
      </Text>
    );
  }

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
