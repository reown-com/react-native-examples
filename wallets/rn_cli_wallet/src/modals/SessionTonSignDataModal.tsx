import {useSnapshot} from 'valtio';
import {useCallback, useState} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {SignClientTypes} from '@walletconnect/types';

import {Methods} from '@/components/Modal/Methods';
import {Message} from '@/components/Modal/Message';
import {
  approveTonRequest,
  rejectTonRequest,
} from '@/utils/TonRequestHandlerUtil';
import {walletKit} from '@/utils/WalletKitUtil';
import {handleRedirect} from '@/utils/LinkingUtils';
import ModalStore from '@/store/ModalStore';
import {RequestModal} from './RequestModal';
import {Chains} from '@/components/Modal/Chains';
import {PresetsUtil} from '@/utils/PresetsUtil';
import {tonAddresses} from '@/utils/TonWalletUtil';
import {useTheme} from '@/hooks/useTheme';

export default function SessionTonSignDataModal() {
  // Get request and wallet data from store
  const {data} = useSnapshot(ModalStore.state);
  const requestEvent = data?.requestEvent;
  const session = data?.requestSession;
  const isLinkMode = session?.transportType === 'link_mode';

  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isLoadingReject, setIsLoadingReject] = useState(false);

  const Theme = useTheme();

  // Get required request data
  const {topic, params} = requestEvent!;
  const {request, chainId} = params;
  const chain = PresetsUtil.getChainData(chainId);
  const peerMetadata = session?.peer?.metadata as SignClientTypes.Metadata;
  const method = requestEvent?.params?.request?.method!;

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
    try {
      if (requestEvent) {
        setIsLoadingApprove(true);
        const response = await approveTonRequest(requestEvent);
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
    return <Text>Missing request data</Text>;
  }

  return (
    <RequestModal
      intention="wants to request a signature"
      metadata={peerMetadata}
      onApprove={onApprove}
      onReject={onReject}
      isLinkMode={isLinkMode}
      approveLoader={isLoadingApprove}
      rejectLoader={isLoadingReject}>
      <View style={styles.container}>
        {chain ? <Chains chains={[chain]} /> : null}
        <Methods methods={[method]} />
        
        {/* Sign with Address */}
        <View style={[styles.section, {backgroundColor: Theme['bg-150']}]}>
          <Text style={[styles.sectionTitle, {color: Theme['fg-150']}]}>
            Sign with Address
          </Text>
          <Text style={[styles.sectionContent, {color: Theme['fg-175']}]}>
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
    marginVertical: 8,
    paddingHorizontal: 16,
    rowGap: 8,
  },
  section: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionContent: {
    fontSize: 12,
    lineHeight: 18,
  },
});