import { UnknownOutputParams, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { CloseModalButton } from '@/components/close-modal-button';
import { Modal, ModalRef } from '@/components/modal';
import {
  SendTransactionContent,
  SignMessageContent,
} from '@/components/modal-content';
import { Text } from '@/components/primitives/text';
import { Button } from '@/components/primitives/button';
import { VerifyBadge } from '@/components/verify-badge';
import { EIP155_SIGNING_METHODS } from '@/constants/eip155';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useWalletKit } from '@/hooks/use-walletkit';
import {
  handleEvmRequest,
  rejectEvmRequest,
} from '@/lib/chains/evm/evm-request-handler';
import {
  getChainData,
  getRequestIntention,
  getSignParamsMessage,
} from '@/utils/helpers';
import { WalletKitTypes } from '@reown/walletkit';
import { SessionTypes, Verify } from '@walletconnect/types';

interface ScreenParams extends UnknownOutputParams {
  requestEvent: string;
  session: string;
  verifyContext: string;
}

export default function SessionRequestScreen() {
  const { requestEvent, session, verifyContext } =
    useLocalSearchParams<ScreenParams>();
  const { walletKit } = useWalletKit();
  const cardBackgroundColor = useThemeColor('foreground-primary');

  const modalRef = useRef<ModalRef>(null);
  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isLoadingReject, setIsLoadingReject] = useState(false);

  // Parse URL params
  const parsedRequestEvent = JSON.parse(
    requestEvent,
  ) as WalletKitTypes.SessionRequest;
  const parsedSession = JSON.parse(session) as SessionTypes.Struct;
  const parsedVerifyContext = verifyContext
    ? (JSON.parse(verifyContext) as Verify.Context)
    : undefined;

  // Extract request details
  const { id, topic, params } = parsedRequestEvent;
  const { request, chainId } = params;
  const { method, params: requestParams } = request;

  // Get peer metadata and chain info
  const peerMetadata = parsedSession.peer.metadata;
  const chain = getChainData(chainId);

  // Get action text for header
  const actionText = getRequestIntention(method);

  const handleDismiss = useCallback(() => {
    modalRef.current?.close();
  }, []);

  const onApprove = useCallback(async () => {
    setIsLoadingApprove(true);
    try {
      const response = await handleEvmRequest(id, method, requestParams);
      await walletKit?.respondSessionRequest({
        topic,
        response,
      });

      if (__DEV__) {
        console.log('Session request approved:', response);
      }

      // TODO: redirect back to the app if possible
    } catch (error) {
      console.error('Error approving session request:', error);
    } finally {
      setIsLoadingApprove(false);
      handleDismiss();
    }
  }, [id, method, requestParams, topic, walletKit, handleDismiss]);

  const onReject = useCallback(async () => {
    setIsLoadingReject(true);
    try {
      const response = rejectEvmRequest(id);
      await walletKit?.respondSessionRequest({
        topic,
        response,
      });

      if (__DEV__) {
        console.log('Session request rejected');
      }

      // TODO: redirect back to the app if possible
    } catch (error) {
      console.error('Error rejecting session request:', error);
    } finally {
      setIsLoadingReject(false);
      handleDismiss();
    }
  }, [id, topic, walletKit, handleDismiss]);

  /**
   * Returns the appropriate content component based on the request method.
   */
  const renderContent = () => {
    const isLoading = isLoadingApprove || isLoadingReject;

    switch (method) {
      case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
      case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION: {
        const transaction = requestParams[0];

        return (
          <SendTransactionContent
            transaction={transaction}
            chain={chain}
            onApprove={onApprove}
            onReject={onReject}
            isLoading={isLoading}
          />
        );
      }

      case EIP155_SIGNING_METHODS.ETH_SIGN: {
        return (
          <View>
            <Text>eth_sign is disabled for security reasons</Text>
            <Button onPress={handleDismiss} type="primary" text="Close" />
          </View>
        );
      }

      case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
      case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
      case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
      case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4:
      default: {
        const message = getSignParamsMessage(method, requestParams);

        return (
          <SignMessageContent
            message={message}
            onApprove={onApprove}
            onReject={onReject}
            isLoading={isLoading}
          />
        );
      }
    }
  };

  return (
    <Modal ref={modalRef}>
      <View style={styles.contentContainer}>
        <CloseModalButton onPress={handleDismiss} style={styles.closeButton} />

        {/* Header - App info */}
        <View style={[styles.card, styles.headerCard]}>
          {peerMetadata.icons[0] && (
            <Image source={peerMetadata.icons[0]} style={styles.logo} />
          )}
          <Text fontSize={20} lineHeight={20} center>
            {actionText} for {peerMetadata.name}
          </Text>
        </View>

        {/* Domain + Verify Badge */}
        <View
          style={[
            styles.card,
            styles.domainCard,
            { backgroundColor: cardBackgroundColor },
          ]}>
          <Text fontSize={14} color="text-tertiary">
            {peerMetadata.url?.split('//')[1] || peerMetadata.url || 'Unknown'}
          </Text>
          <VerifyBadge verifyContext={parsedVerifyContext} />
        </View>

        {/* Method-specific content with footer */}
        {renderContent()}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: Spacing['spacing-5'],
    paddingBottom: Spacing['spacing-12'],
    gap: Spacing['spacing-2'],
  },
  card: {
    borderRadius: BorderRadius['5'],
    padding: Spacing['spacing-5'],
  },
  headerCard: {
    alignItems: 'center',
  },
  domainCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing['spacing-2'],
  },
  closeButton: {
    alignSelf: 'flex-end',
    top: Spacing['spacing-4'],
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius['4'],
    marginBottom: Spacing['spacing-3'],
  },
});
