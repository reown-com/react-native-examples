import { useSnapshot } from 'valtio';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SignClientTypes } from '@walletconnect/types';

import { showToast } from '@/utils/ToastUtil';
import { Message } from '@/components/Modal/Message';
import { walletKit } from '@/utils/WalletKitUtil';
import { handleRedirect } from '@/utils/LinkingUtils';
import LogStore from '@/store/LogStore';
import ModalStore from '@/store/ModalStore';
import SettingsStore from '@/store/SettingsStore';
import { RequestModal } from './RequestModal';
import { AppInfoCard } from '@/components/AppInfoCard';
import { NetworkInfoCard } from '@/components/NetworkInfoCard';
import { Text } from '@/components/Text';
import { Spacing } from '@/utils/ThemeUtil';
import { haptics } from '@/utils/haptics';
import {
  getRequestConfig,
  DEFAULT_APPROVE_LABEL,
  DEFAULT_APPROVE_ERROR_TITLE,
  DEFAULT_REJECT_REDIRECT_ERROR,
} from './requestConfig';

/**
 * One generic modal that renders any request described in `requestConfig.ts`.
 * Replaces the per-method approve/reject modal clones (EIP155, Solana, Sui,
 * Bitcoin, Tron, Canton) whose only differences were the chain handler, the
 * header/button labels and how the payload string is built. Genuinely custom
 * modals (session proposal, authenticate, TON) keep their own components.
 */
export default function SessionRequestModal() {
  const { data } = useSnapshot(ModalStore.state);
  const { currentRequestVerifyContext } = useSnapshot(SettingsStore.state);
  const requestEvent = data?.requestEvent;
  const session = data?.requestSession;
  const isLinkMode = session?.transportType === 'link_mode';

  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isLoadingReject, setIsLoadingReject] = useState(false);

  // Optional access — runs before the guard below; never assert requestEvent
  // here, it can be undefined during modal open/close.
  const request = requestEvent?.params?.request;
  const topic = requestEvent?.topic ?? '';
  const peerMetadata = session?.peer?.metadata as SignClientTypes.Metadata;

  const validation = currentRequestVerifyContext?.verified?.validation;
  const isScam = currentRequestVerifyContext?.verified?.isScam;

  const config = getRequestConfig(request?.method);

  const intention = useMemo(() => {
    if (!config || !request) return undefined;
    return typeof config.intention === 'function'
      ? config.intention(request)
      : config.intention;
  }, [config, request]);

  // Payloads that need async work (e.g. decoding a Sui BCS transaction) are
  // resolved here; synchronous ones are computed inline below.
  const [resolvedPayload, setResolvedPayload] = useState<string | null>(null);
  useEffect(() => {
    if (!config?.resolvePayload || !request) return;
    let cancelled = false;
    config
      .resolvePayload(request)
      .then(p => !cancelled && setResolvedPayload(p))
      .catch(() => !cancelled && setResolvedPayload(''));
    return () => {
      cancelled = true;
    };
  }, [config, request]);

  const payload = useMemo(() => {
    if (!config || !request) return '';
    if (config.resolvePayload) return resolvedPayload ?? '';
    try {
      return config.renderPayload?.(request) ?? '';
    } catch {
      return String(request?.params);
    }
  }, [config, request, resolvedPayload]);

  const onApprove = useCallback(async () => {
    if (!requestEvent || !config) return;
    const approveErrorTitle =
      config.approveErrorTitle ?? DEFAULT_APPROVE_ERROR_TITLE;
    setIsLoadingApprove(true);
    try {
      const response = await config.approve(requestEvent);
      await walletKit.respondSessionRequest({ topic, response });
      haptics.requestResponse();
      // Handlers may return a JSON-RPC error response instead of throwing
      // (e.g. no UTXOs for a Bitcoin transfer). Surface it so the wallet
      // doesn't look successful.
      const errorMessage =
        response && 'error' in response ? response.error.message : undefined;
      if (errorMessage) {
        showToast({
          type: 'error',
          text1: approveErrorTitle,
          text2: errorMessage,
        });
      }
      handleRedirect({
        peerRedirect: peerMetadata?.redirect,
        isLinkMode,
        error: errorMessage,
      });
    } catch (e) {
      // Optionally reply with an error so the dapp doesn't hang (Canton).
      if (config.respondErrorOnApproveFailure) {
        try {
          const errorResponse = await config.reject(requestEvent);
          await walletKit.respondSessionRequest({
            topic,
            response: errorResponse,
          });
        } catch {
          // best effort
        }
      }
      LogStore.error((e as Error).message, config.logScope, 'onApprove');
      showToast({
        type: 'error',
        text1: approveErrorTitle,
        text2: (e as Error).message,
      });
    } finally {
      setIsLoadingApprove(false);
      ModalStore.close();
    }
  }, [requestEvent, config, topic, peerMetadata, isLinkMode]);

  const onReject = useCallback(async () => {
    if (!requestEvent || !config) return;
    setIsLoadingReject(true);
    try {
      const response = await config.reject(requestEvent);
      await walletKit.respondSessionRequest({ topic, response });
      haptics.requestResponse();
      handleRedirect({
        peerRedirect: peerMetadata?.redirect,
        isLinkMode,
        error: config.rejectRedirectError ?? DEFAULT_REJECT_REDIRECT_ERROR,
      });
    } catch (e) {
      LogStore.error((e as Error).message, config.logScope, 'onReject');
      showToast({
        type: 'error',
        text1: 'Couldn’t reject request',
        text2: (e as Error).message,
      });
    } finally {
      setIsLoadingReject(false);
      ModalStore.close();
    }
  }, [requestEvent, config, topic, peerMetadata, isLinkMode]);

  if (!requestEvent || !session || !config) {
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
      approveLabel={config.approveLabel ?? DEFAULT_APPROVE_LABEL}
    >
      <View style={styles.container}>
        <AppInfoCard
          url={peerMetadata?.url}
          validation={validation}
          isScam={isScam}
        />
        <NetworkInfoCard chainId={requestEvent.params.chainId} />
        <Message message={payload} />
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
