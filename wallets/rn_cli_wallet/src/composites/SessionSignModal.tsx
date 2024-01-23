import React, {useCallback, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {useSnapshot} from 'valtio';
import {SignClientTypes} from '@walletconnect/types';
import {Tag} from '../components/Tag';
import {Methods} from '../components/Modal/Methods';
import {Message} from '../components/Modal/Message';
import {getSignParamsMessage} from '../utils/HelperUtil';
import {AcceptRejectButton} from '../components/AcceptRejectButton';
import {ModalHeader} from '../components/Modal/ModalHeader';
import {
  approveEIP155Request,
  rejectEIP155Request,
} from '../utils/EIP155RequestHandlerUtil';
import {web3wallet} from '../utils/WalletConnectUtil';
import {handleDeepLinkRedirect} from '../utils/LinkingUtils';
import ModalStore from '../store/ModalStore';
import Text from '../components/Text';

export default function SessionSignModal() {
  // Get request and wallet data from store
  const {data} = useSnapshot(ModalStore.state);
  const requestEvent = data?.requestEvent;
  const requestSession = data?.requestSession;
  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isLoadingReject, setIsLoadingReject] = useState(false);

  // Get required request data
  const {topic, params} = requestEvent;
  const {request, chainId} = params;
  const requestName = requestSession?.peer?.metadata?.name;
  const requestIcon = requestSession?.peer?.metadata?.icons[0];
  const requestURL = requestSession?.peer?.metadata?.url;
  const requestMetadata: SignClientTypes.Metadata =
    requestSession?.peer?.metadata;

  // Get message, convert it to UTF8 string if it is valid hex
  const message = getSignParamsMessage(request.params);

  // Handle approve action (logic varies based on request method)
  const onApprove = useCallback(async () => {
    if (requestEvent) {
      setIsLoadingApprove(true);
      const response = await approveEIP155Request(requestEvent);
      try {
        await web3wallet.respondSessionRequest({
          topic,
          response,
        });
        handleDeepLinkRedirect(requestMetadata?.redirect);
      } catch (e) {
        setIsLoadingApprove(false);
        console.log((e as Error).message, 'error');
        return;
      }
      setIsLoadingApprove(false);
      ModalStore.close();
    }
  }, [requestEvent, requestMetadata, topic]);

  // Handle reject action
  const onReject = useCallback(async () => {
    if (requestEvent) {
      setIsLoadingReject(true);
      const response = rejectEIP155Request(requestEvent);
      try {
        await web3wallet.respondSessionRequest({
          topic,
          response,
        });
      } catch (e) {
        setIsLoadingReject(false);
        console.log((e as Error).message, 'error');
        return;
      }
      setIsLoadingReject(false);
      ModalStore.close();
    }
  }, [requestEvent, requestMetadata, topic]);

  const method = requestEvent?.params?.request?.method;

  // Ensure request and wallet are defined
  if (!requestEvent || !requestSession) {
    return <Text>Missing request data</Text>;
  }

  return (
    <View style={styles.modalContainer}>
      <ModalHeader name={requestName} url={requestURL} icon={requestIcon} />

      <View style={styles.divider} />

      <View style={styles.chainContainer}>
        <View style={styles.flexRowWrapped}>
          <Tag value={chainId} grey={true} />
        </View>
        <Methods methods={[method]} />
        <Message message={message} />
      </View>

      <View style={styles.flexRow}>
        <AcceptRejectButton accept={false} onPress={onReject} />
        <AcceptRejectButton accept={true} onPress={onApprove} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chainContainer: {
    width: '90%',
    padding: 10,
    borderRadius: 25,
    backgroundColor: 'rgba(80, 80, 89, 0.1)',
  },
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
  },
  flexRowWrapped: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  modalContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 34,
    paddingTop: 30,
    backgroundColor: 'rgba(242, 242, 247, 0.9)',
    width: '100%',
    position: 'absolute',
    bottom: 44,
  },
  rejectButton: {
    color: 'red',
  },
  dappTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  imageContainer: {
    width: 48,
    height: 48,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: 'rgba(60, 60, 67, 0.36)',
    marginVertical: 16,
  },
});
