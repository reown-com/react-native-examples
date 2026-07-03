import { useSnapshot } from 'valtio';
import { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SignClientTypes } from '@walletconnect/types';
import { showToast } from '@/utils/ToastUtil';
import bs58 from 'bs58';

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
import { Text } from '@/components/Text';
import { Spacing } from '@/utils/ThemeUtil';
import { haptics } from '@/utils/haptics';

function decodeBase58Message(value: string): string {
  try {
    const bytes = bs58.decode(value);
    return Buffer.from(bytes).toString('utf8');
  } catch {
    return value;
  }
}

export default function SessionSolanaSignMessageModal() {
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

  const rawMessage = request.params?.message || '';
  const displayMessage = useMemo(
    () => decodeBase58Message(rawMessage),
    [rawMessage],
  );

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
          'SessionSolanaSignMessageModal',
          'onApprove',
        );
        showToast({
          type: 'error',
          text1: 'Couldn’t sign message',
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
          error: 'User rejected Solana message request',
        });
      } catch (e) {
        LogStore.error(
          (e as Error).message,
          'SessionSolanaSignMessageModal',
          'onReject',
        );
        showToast({
          type: 'error',
          text1: 'Couldn’t reject request',
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
      intention="Sign a message for"
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
        <Message message={displayMessage} />
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
