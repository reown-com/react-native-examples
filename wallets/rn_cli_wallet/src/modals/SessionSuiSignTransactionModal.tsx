import { useSnapshot } from 'valtio';
import { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SignClientTypes } from '@walletconnect/types';
import Toast from 'react-native-toast-message';

import { Message } from '@/components/Modal/Message';
import { AppInfoCard } from '@/components/AppInfoCard';

import { walletKit } from '@/utils/WalletKitUtil';
import { handleRedirect } from '@/utils/LinkingUtils';
import LogStore from '@/store/LogStore';
import ModalStore from '@/store/ModalStore';
import SettingsStore from '@/store/SettingsStore';
import { RequestModal } from './RequestModal';
import {
  approveSuiRequest,
  rejectSuiRequest,
} from '@/utils/SuiRequestHandlerUtil';
import { getWallet } from '@/utils/SuiWalletUtil';
import { Text } from '@/components/Text';
import { Spacing } from '@/utils/ThemeUtil';
import { haptics } from '@/utils/haptics';

export default function SessionSignSuiPersonalMessageModal() {
  // Get request and wallet data from store
  const { data } = useSnapshot(ModalStore.state);
  const { currentRequestVerifyContext } = useSnapshot(SettingsStore.state);
  const requestEvent = data?.requestEvent;
  const session = data?.requestSession;
  const isLinkMode = session?.transportType === 'link_mode';

  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isLoadingReject, setIsLoadingReject] = useState(false);
  const [transaction, setTransaction] = useState<string>('');

  const { validation, isScam } = currentRequestVerifyContext?.verified || {};

  // Get required request data
  const { topic, params } = requestEvent!;
  const { request } = params;
  const peerMetadata = session?.peer?.metadata as SignClientTypes.Metadata;

  // transaction is a base64 encoded BCS transaction
  useMemo(async () => {
    if (transaction) {
      return;
    }
    const wallet = await getWallet();
    const jsonTx = await wallet.getJsonTransactionFromBase64(
      request.params.transaction,
    );
    setTransaction(jsonTx?.toString() ?? '');
  }, [request.params, transaction]);
  // Handle approve action (logic varies based on request method)
  const onApprove = useCallback(async () => {
    if (requestEvent) {
      setIsLoadingApprove(true);
      try {
        const response = await approveSuiRequest(requestEvent);
        await walletKit.respondSessionRequest({
          topic,
          response,
        });
        haptics.requestResponse();

        handleRedirect({
          peerRedirect: peerMetadata?.redirect,
          isLinkMode: isLinkMode,
        });
      } catch (e) {
        LogStore.error(
          (e as Error).message,
          'SessionSuiSignTransactionModal',
          'onApprove',
        );
        Toast.show({
          type: 'error',
          text1: 'Transaction signing failed',
          text2: (e as Error).message,
        });
      } finally {
        setIsLoadingApprove(false);
        ModalStore.close();
      }
    }
  }, [requestEvent, peerMetadata, topic, isLinkMode]);

  // Handle reject action
  const onReject = useCallback(async () => {
    if (requestEvent) {
      setIsLoadingReject(true);
      try {
        const response = rejectSuiRequest(requestEvent);
        await walletKit.respondSessionRequest({
          topic,
          response,
        });
        haptics.requestResponse();
        handleRedirect({
          peerRedirect: peerMetadata?.redirect,
          isLinkMode: isLinkMode,
          error: 'User rejected transaction request',
        });
      } catch (e) {
        LogStore.error(
          (e as Error).message,
          'SessionSuiSignTransactionModal',
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
  }, [requestEvent, topic, peerMetadata, isLinkMode]);

  // Ensure request and wallet are defined
  if (!requestEvent || !session) {
    return (
      <Text variant="md-400" color="text-error">
        Missing request data
      </Text>
    );
  }

  return (
    <RequestModal
      intention="Sign a transaction for"
      metadata={peerMetadata}
      onApprove={onApprove}
      onReject={onReject}
      isLinkMode={isLinkMode}
      approveLoader={isLoadingApprove}
      rejectLoader={isLoadingReject}
      approveLabel="Sign"
    >
      <View style={styles.container}>
        <AppInfoCard
          url={peerMetadata?.url}
          validation={validation}
          isScam={isScam}
        />
        <Message message={transaction} />
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
