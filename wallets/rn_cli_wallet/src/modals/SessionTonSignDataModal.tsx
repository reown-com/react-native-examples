import { useSnapshot } from 'valtio';
import { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SignClientTypes } from '@walletconnect/types';
import Toast from 'react-native-toast-message';

import { Message } from '@/components/Modal/Message';
import { AppInfoCard } from '@/components/AppInfoCard';
import {
  approveTonRequest,
  rejectTonRequest,
} from '@/utils/TonRequestHandlerUtil';
import { walletKit } from '@/utils/WalletKitUtil';
import { handleRedirect } from '@/utils/LinkingUtils';
import LogStore from '@/store/LogStore';
import ModalStore from '@/store/ModalStore';
import SettingsStore from '@/store/SettingsStore';
import { RequestModal } from './RequestModal';
import { tonAddresses } from '@/utils/TonWalletUtil';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';
import { haptics } from '@/utils/haptics';

export default function SessionTonSignDataModal() {
  // Get request and wallet data from store
  const { data } = useSnapshot(ModalStore.state);
  const { currentRequestVerifyContext } = useSnapshot(SettingsStore.state);
  const requestEvent = data?.requestEvent;
  const session = data?.requestSession;
  const isLinkMode = session?.transportType === 'link_mode';

  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isLoadingReject, setIsLoadingReject] = useState(false);

  const { validation, isScam } = currentRequestVerifyContext?.verified || {};

  const Theme = useTheme();

  // Get required request data
  const { topic, params } = requestEvent!;
  const { request } = params;
  const peerMetadata = session?.peer?.metadata as SignClientTypes.Metadata;

  // Extract payload
  const payload = Array.isArray(request.params)
    ? request.params[0]
    : request.params || {};

  // Format payload message based on type
  const getPayloadMessage = () => {
    if (payload?.type === 'text') {
      return payload.text;
    } else if (payload?.type === 'binary') {
      const bytes = payload.bytes?.slice(0, 64) || '';
      const suffix = payload.bytes?.length > 64 ? '...' : '';
      return `Binary (base64): ${bytes}${suffix}`;
    } else if (payload?.type === 'cell') {
      const cell = payload.cell?.slice(0, 64) || '';
      const suffix = payload.cell?.length > 64 ? '...' : '';
      return `Cell (base64): ${cell}${suffix}`;
    }
    return JSON.stringify(payload);
  };

  // Handle approve action
  const onApprove = useCallback(async () => {
    if (requestEvent) {
      setIsLoadingApprove(true);
      try {
        const response = await approveTonRequest(requestEvent);
        await walletKit.respondSessionRequest({
          topic,
          response,
        });
        haptics.requestResponse();

        handleRedirect({
          peerRedirect: peerMetadata?.redirect,
          isLinkMode: isLinkMode,
          error: 'error' in response ? response.error.message : undefined,
        });
      } catch (e) {
        LogStore.error(
          (e as Error).message,
          'SessionTonSignDataModal',
          'onApprove',
        );
        Toast.show({
          type: 'error',
          text1: 'Signature failed',
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
        const response = rejectTonRequest(requestEvent);
        await walletKit.respondSessionRequest({
          topic,
          response,
        });
        haptics.requestResponse();
        handleRedirect({
          peerRedirect: peerMetadata?.redirect,
          isLinkMode: isLinkMode,
          error: 'User rejected request',
        });
      } catch (e) {
        LogStore.error(
          (e as Error).message,
          'SessionTonSignDataModal',
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
      intention="Sign data for"
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

        {/* Sign with Address */}
        <View
          style={[
            styles.section,
            { backgroundColor: Theme['foreground-primary'] },
          ]}
        >
          <Text
            variant="lg-400"
            color="text-tertiary"
            style={styles.sectionTitle}
          >
            Sign with Address
          </Text>
          <Text variant="md-400" color="text-primary">
            {tonAddresses[0]}
          </Text>
        </View>

        {/* Payload */}
        <Message message={getPayloadMessage()} showTitle />
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
    borderRadius: BorderRadius[4],
    rowGap: Spacing[2],
    padding: Spacing[5],
  },
  sectionTitle: {
    marginBottom: Spacing[1],
  },
});
