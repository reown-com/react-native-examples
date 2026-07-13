import { useSnapshot } from 'valtio';
import { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SignClientTypes } from '@walletconnect/types';
import { showToast } from '@/utils/ToastUtil';

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
  approveBitcoinRequest,
  rejectBitcoinRequest,
} from '@/utils/BitcoinRequestHandlerUtil';
import { BIP122_SIGNING_METHODS } from '@/constants/Bitcoin';
import { Text } from '@/components/Text';
import { Spacing } from '@/utils/ThemeUtil';
import { haptics } from '@/utils/haptics';

export default function SessionBitcoinSendTransactionModal() {
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
    request.method === BIP122_SIGNING_METHODS.BIP122_SIGN_PSBT
      ? 'Sign a transaction for'
      : 'Sign & send a transaction for';

  const onApprove = useCallback(async () => {
    if (requestEvent) {
      setIsLoadingApprove(true);
      try {
        const response = await approveBitcoinRequest(requestEvent);
        await walletKit.respondSessionRequest({ topic, response });
        haptics.requestResponse();
        // The handler returns a JSON-RPC error response (rather than throwing)
        // when the transfer/PSBT fails, e.g. no UTXOs. Surface it so the wallet
        // doesn't look like it succeeded.
        const errorMessage =
          'error' in response ? response.error.message : undefined;
        if (errorMessage) {
          showToast({
            type: 'error',
            text1: 'Couldn’t sign transaction',
            text2: errorMessage,
          });
        }
        handleRedirect({
          peerRedirect: peerMetadata?.redirect,
          isLinkMode: isLinkMode,
          error: errorMessage,
        });
      } catch (e) {
        LogStore.error(
          (e as Error).message,
          'SessionBitcoinSendTransactionModal',
          'onApprove',
        );
        showToast({
          type: 'error',
          text1: 'Couldn’t sign transaction',
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
        const response = rejectBitcoinRequest(requestEvent);
        await walletKit.respondSessionRequest({ topic, response });
        haptics.requestResponse();
        handleRedirect({
          peerRedirect: peerMetadata?.redirect,
          isLinkMode: isLinkMode,
          error: 'User rejected Bitcoin transaction request',
        });
      } catch (e) {
        LogStore.error(
          (e as Error).message,
          'SessionBitcoinSendTransactionModal',
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
