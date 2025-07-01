import {useSnapshot} from 'valtio';
import {useCallback, useMemo, useState} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {SignClientTypes} from '@walletconnect/types';

import {Methods} from '@/components/Modal/Methods';
import {Message} from '@/components/Modal/Message';

import {walletKit} from '@/utils/WalletKitUtil';
import {handleRedirect} from '@/utils/LinkingUtils';
import ModalStore from '@/store/ModalStore';
import {RequestModal} from './RequestModal';
import {Chains} from '@/components/Modal/Chains';
import {PresetsUtil} from '@/utils/PresetsUtil';
import {
  approveSuiRequest,
  rejectSuiRequest,
} from '@/utils/SuiRequestHandlerUtil';
import {getWallet} from '@/utils/SuiWalletUtil';

export default function SessionSuiSignAndExecuteTransactionModal() {
  // Get request and wallet data from store
  const {data} = useSnapshot(ModalStore.state);
  const requestEvent = data?.requestEvent;
  const session = data?.requestSession;
  const isLinkMode = session?.transportType === 'link_mode';

  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isLoadingReject, setIsLoadingReject] = useState(false);
  const [transaction, setTransaction] = useState<string>('');

  // Get required request data
  const {topic, params} = requestEvent!;
  const {request, chainId} = params;
  const chain = PresetsUtil.getChainData(chainId);
  const peerMetadata = session?.peer?.metadata as SignClientTypes.Metadata;
  const method = requestEvent?.params?.request?.method!;

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
      const response = await approveSuiRequest(requestEvent);
      try {
        await walletKit.respondSessionRequest({
          topic,
          response,
        });

        handleRedirect({
          peerRedirect: peerMetadata?.redirect,
          isLinkMode: isLinkMode,
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
      const response = rejectSuiRequest(requestEvent);
      try {
        await walletKit.respondSessionRequest({
          topic,
          response,
        });
        handleRedirect({
          peerRedirect: peerMetadata?.redirect,
          isLinkMode: isLinkMode,
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
      intention="wants to sign and execute a transaction"
      metadata={peerMetadata}
      onApprove={onApprove}
      onReject={onReject}
      isLinkMode={isLinkMode}
      approveLoader={isLoadingApprove}
      rejectLoader={isLoadingReject}>
      <View style={styles.container}>
        <Chains chains={[chain]} />
        <Methods methods={[method]} />
        <Message message={transaction} />
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
});
