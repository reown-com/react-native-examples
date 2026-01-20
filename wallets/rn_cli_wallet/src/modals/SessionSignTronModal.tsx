/* eslint-disable react-hooks/rules-of-hooks */
import { useSnapshot } from 'valtio';
import ModalStore from '@/store/ModalStore';
import SettingsStore from '@/store/SettingsStore';
// import { styledToast } from '@/utils/HelperUtil'
import {
  approveTronRequest,
  rejectTronRequest,
} from '@/utils/TronRequestHandlerUtil';
import { walletKit } from '@/utils/WalletKitUtil';
import { RequestModal } from './RequestModal';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Message } from '@/components/Modal/Message';
import { AppInfoCard } from '@/components/AppInfoCard';
import Toast from 'react-native-toast-message';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';

export default function SessionSignTronModal() {
  // Get request and wallet data from store
  const { currentRequestVerifyContext } = useSnapshot(SettingsStore.state);
  const requestEvent = ModalStore.state.data?.requestEvent;
  const requestSession = ModalStore.state.data?.requestSession;
  const isLinkMode = requestSession?.transportType === 'link_mode';
  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isLoadingReject, setIsLoadingReject] = useState(false);

  const { validation, isScam } = currentRequestVerifyContext?.verified || {};

  // Ensure request and wallet are defined
  if (!requestEvent || !requestSession) {
    return (
      <Text variant="md-400" color="text-error">
        Missing request data
      </Text>
    );
  }

  // Get required request data
  const { topic, params } = requestEvent;
  const { request } = params;
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
      try {
        const response = rejectTronRequest(requestEvent);
        await walletKit.respondSessionRequest({
          topic,
          response,
        });
      } catch (e) {
        console.log((e as Error).message, 'error');
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
      intention="Sign a message for"
      metadata={requestSession.peer.metadata}
      onApprove={onApprove}
      onReject={onReject}
      isLinkMode={isLinkMode}
      approveLoader={isLoadingApprove}
      rejectLoader={isLoadingReject}
      approveLabel="Sign"
    >
      <View style={styles.container}>
        <AppInfoCard
          url={requestSession?.peer?.metadata?.url}
          validation={validation}
          isScam={isScam}
        />
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
  section: {
    borderRadius: BorderRadius[5],
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[4],
  },
  sectionTitle: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    marginBottom: Spacing[1],
  },
  sectionContent: {
    fontSize: 12,
    lineHeight: 18,
  },
});
