import { useSnapshot } from 'valtio';
import { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SignClientTypes } from '@walletconnect/types';
import Toast from 'react-native-toast-message';

import { Message } from '@/components/Modal/Message';
import { AppInfoCard } from '@/components/AppInfoCard';
import { NetworkInfoCard } from '@/components/NetworkInfoCard';

import { walletKit } from '@/utils/WalletKitUtil';
import { handleRedirect } from '@/utils/LinkingUtils';
import LogStore from '@/store/LogStore';
import ModalStore from '@/store/ModalStore';
import SettingsStore from '@/store/SettingsStore';
import { RequestModal } from './RequestModal';
import {
  approveSolanaRequest,
  rejectSolanaRequest,
} from '@/utils/SolanaRequestHandlerUtil';
import { SOLANA_SIGNING_METHODS } from '@/constants/Solana';
import { Text } from '@/components/Text';
import { Spacing } from '@/utils/ThemeUtil';
import { haptics } from '@/utils/haptics';

export default function SessionSolanaSignTransactionModal() {
  const { data } = useSnapshot(ModalStore.state);
  const { currentRequestVerifyContext } = useSnapshot(SettingsStore.state);
  const requestEvent = data?.requestEvent;
  const session = data?.requestSession;
  const isLinkMode = session?.transportType === 'link_mode';

  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isLoadingReject, setIsLoadingReject] = useState(false);

  const { validation, isScam } = currentRequestVerifyContext?.verified || {};

  const { topic, params } = requestEvent!;
  const { request } = params;
  const peerMetadata = session?.peer?.metadata as SignClientTypes.Metadata;

  const displayPayload = useMemo(() => {
    try {
      return JSON.stringify(request.params, null, 2);
    } catch {
      return String(request.params);
    }
  }, [request.params]);

  const intention =
    request.method === SOLANA_SIGNING_METHODS.SOLANA_SIGN_AND_SEND_TRANSACTION
      ? 'Sign & send a transaction for'
      : 'Sign a transaction for';

  const onApprove = useCallback(async () => {
    if (requestEvent) {
      setIsLoadingApprove(true);
      try {
        const response = await approveSolanaRequest(requestEvent);
        await walletKit.respondSessionRequest({ topic, response });
        haptics.requestResponse();
        handleRedirect({
          peerRedirect: peerMetadata?.redirect,
          isLinkMode: isLinkMode,
        });
      } catch (e) {
        LogStore.error(
          (e as Error).message,
          'SessionSolanaSignTransactionModal',
          'onApprove',
        );
        Toast.show({
          type: 'error',
          text1: 'Transaction failed',
          text2: (e as Error).message,
        });
      } finally {
        setIsLoadingApprove(false);
        ModalStore.close();
      }
    }
  }, [requestEvent, peerMetadata, topic, isLinkMode]);

  const onReject = useCallback(async () => {
    if (requestEvent) {
      setIsLoadingReject(true);
      try {
        const response = rejectSolanaRequest(requestEvent);
        await walletKit.respondSessionRequest({ topic, response });
        haptics.requestResponse();
        handleRedirect({
          peerRedirect: peerMetadata?.redirect,
          isLinkMode: isLinkMode,
          error: 'User rejected Solana transaction request',
        });
      } catch (e) {
        LogStore.error(
          (e as Error).message,
          'SessionSolanaSignTransactionModal',
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

  if (!requestEvent || !session) {
    return (
      <Text variant="md-400" color="text-error">
        Missing request data
      </Text>
    );
  }

  return (
    <RequestModal
      intention={intention}
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
        <NetworkInfoCard chainId={params.chainId} />
        <Message message={displayPayload} />
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
