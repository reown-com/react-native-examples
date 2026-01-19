import { useSnapshot } from 'valtio';
import { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SignClientTypes } from '@walletconnect/types';

import { AppInfoCard } from '@/components/AppInfoCard';
import {
  approveTonRequest,
  rejectTonRequest,
} from '@/utils/TonRequestHandlerUtil';
import { walletKit } from '@/utils/WalletKitUtil';
import { handleRedirect } from '@/utils/LinkingUtils';
import ModalStore from '@/store/ModalStore';
import SettingsStore from '@/store/SettingsStore';
import { RequestModal } from './RequestModal';
import { tonAddresses } from '@/utils/TonWalletUtil';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';

export default function SessionTonSendMessageModal() {
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

  // Extract message details for display (SendMessage spec)
  const tx = Array.isArray(request.params)
    ? request.params[0]
    : request.params || {};
  const messages = Array.isArray(tx.messages) ? tx.messages : [];

  // Format transaction details
  const formatTransactionDetails = () => {
    if (messages.length === 0) {
      return 'No messages';
    }

    return messages
      .map((m: any, idx: number) => {
        let details = `Message ${idx + 1}:\nTo: ${m.address}\nAmount: ${
          m.amount
        } nanotons`;
        if (m.payload) {
          details += `\nPayload: ${m.payload}`;
        }
        if (m.stateInit) {
          details += `\nStateInit: ${m.stateInit}`;
        }
        return details;
      })
      .join('\n\n');
  };

  // Handle approve action
  const onApprove = useCallback(async () => {
    try {
      if (requestEvent) {
        setIsLoadingApprove(true);
        const response = await approveTonRequest(requestEvent);
        console.log('response', response);

        await walletKit.respondSessionRequest({
          topic,
          response,
        });

        handleRedirect({
          peerRedirect: peerMetadata?.redirect,
          isLinkMode: isLinkMode,
          error: 'error' in response ? response.error.message : undefined,
        });
      }
    } catch (e) {
      console.log((e as Error).message, 'error');
    } finally {
      setIsLoadingApprove(false);
      ModalStore.close();
    }
  }, [requestEvent, peerMetadata, topic, isLinkMode]);

  // Handle reject action
  const onReject = useCallback(async () => {
    if (requestEvent) {
      setIsLoadingReject(true);
      const response = rejectTonRequest(requestEvent);
      try {
        await walletKit.respondSessionRequest({
          topic,
          response,
        });
        handleRedirect({
          peerRedirect: peerMetadata?.redirect,
          isLinkMode: isLinkMode,
          error: 'User rejected request',
        });
      } catch (e) {
        setIsLoadingReject(false);
        console.log((e as Error).message, 'error');
        return;
      }
      setIsLoadingReject(false);
      ModalStore.close();
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
      intention="Send a message for"
      metadata={peerMetadata}
      onApprove={onApprove}
      onReject={onReject}
      isLinkMode={isLinkMode}
      approveLoader={isLoadingApprove}
      rejectLoader={isLoadingReject}
      approveLabel="Send"
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

        {/* Transaction Details */}
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
            Transaction Details
          </Text>
          <Text variant="md-400" color="text-primary">
            {formatTransactionDetails()}
          </Text>
        </View>
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
