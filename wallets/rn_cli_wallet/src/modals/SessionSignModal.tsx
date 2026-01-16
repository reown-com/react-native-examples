import { useSnapshot } from 'valtio';
import { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SignClientTypes } from '@walletconnect/types';

import { Methods } from '@/components/Modal/Methods';
import { Message } from '@/components/Modal/Message';
import { getSignParamsMessage } from '@/utils/HelperUtil';
import {
  approveEIP155Request,
  rejectEIP155Request,
} from '@/utils/EIP155RequestHandlerUtil';
import { walletKit } from '@/utils/WalletKitUtil';
import { handleRedirect } from '@/utils/LinkingUtils';
import ModalStore from '@/store/ModalStore';
import { RequestModal } from './RequestModal';
import { Chains } from '@/components/Modal/Chains';
import { PresetsUtil } from '@/utils/PresetsUtil';
import { Text } from '@/components/Text';
import { Spacing } from '@/utils/ThemeUtil';

export default function SessionSignModal() {
  // Get request and wallet data from store
  const { data } = useSnapshot(ModalStore.state);
  const requestEvent = data?.requestEvent;
  const session = data?.requestSession;
  const isLinkMode = session?.transportType === 'link_mode';

  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isLoadingReject, setIsLoadingReject] = useState(false);

  // Get required request data
  const { topic, params } = requestEvent!;
  const { request, chainId } = params;
  const chain = PresetsUtil.getChainDataById(chainId);
  const peerMetadata = session?.peer?.metadata as SignClientTypes.Metadata;
  const method = requestEvent?.params?.request?.method!;

  // Get message, convert it to UTF8 string if it is valid hex
  const message = getSignParamsMessage(request.params);

  // Handle approve action (logic varies based on request method)
  const onApprove = useCallback(async () => {
    if (requestEvent) {
      setIsLoadingApprove(true);
      const response = await approveEIP155Request(requestEvent);
      try {
        await walletKit.respondSessionRequest({
          topic,
          response,
        });

        handleRedirect({
          peerRedirect: peerMetadata?.redirect,
          isLinkMode: isLinkMode,
          error: 'error' in response ? response.error.message : undefined,
        });
      } catch (e) {
        console.log((e as Error).message, 'error');
        return;
      }
      setIsLoadingApprove(false);
      ModalStore.close();
    }
  }, [requestEvent, peerMetadata, topic, isLinkMode]);

  // Handle reject action
  const onReject = useCallback(async () => {
    if (requestEvent) {
      setIsLoadingReject(true);
      const response = rejectEIP155Request(requestEvent);
      try {
        await walletKit.respondSessionRequest({
          topic,
          response,
        });
        handleRedirect({
          peerRedirect: peerMetadata?.redirect,
          isLinkMode: isLinkMode,
          error: 'User rejected signature request',
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
      intention="wants to request a signature"
      metadata={peerMetadata}
      onApprove={onApprove}
      onReject={onReject}
      isLinkMode={isLinkMode}
      approveLoader={isLoadingApprove}
      rejectLoader={isLoadingReject}
    >
      <View style={styles.container}>
        {chain ? <Chains chains={[chain]} /> : null}
        <Methods methods={[method]} />
        <Message message={message} />
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
