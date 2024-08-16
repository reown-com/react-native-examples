import {useSnapshot} from 'valtio';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {SignClientTypes, AuthTypes} from '@walletconnect/types';
import {
  buildAuthObject,
  getSdkError,
  populateAuthPayload,
} from '@walletconnect/utils';

import ModalStore from '@/store/ModalStore';
import {eip155Addresses, eip155Wallets} from '@/utils/EIP155WalletUtil';
import {web3wallet} from '@/utils/WalletConnectUtil';
import SettingsStore from '@/store/SettingsStore';
import {handleRedirect} from '@/utils/LinkingUtils';
import {useTheme} from '@/hooks/useTheme';

import {EIP155_CHAINS, EIP155_SIGNING_METHODS} from '@/utils/PresetsUtil';
import {RequestModal} from './RequestModal';
import {Message} from '@/components/Modal/Message';

export default function SessionAuthenticateModal() {
  const Theme = useTheme();

  const {data} = useSnapshot(ModalStore.state);
  const authRequest =
    data?.authRequest as SignClientTypes.EventArguments['session_authenticate'];

  const isLinkMode = authRequest?.params?.transportType === 'link-mode';

  const {account} = useSnapshot(SettingsStore.state);
  const [messages, setMessages] = useState<
    {authPayload: any; message: string; id: number; iss: string}[]
  >([]);

  // the chains that are supported by the wallet from the proposal
  const supportedChains = useMemo(() => {
    const chains = authRequest.params.authPayload.chains.filter(
      chain => !!EIP155_CHAINS[chain.split(':')[1]],
    );
    return chains;
  }, [authRequest]);

  const [supportedMethods] = useState<string[]>(
    Object.values(EIP155_SIGNING_METHODS),
  );

  // TODO: Add checkbox to change strategy
  const [signStrategy, setSignStrategy] = useState<'one' | 'all'>('one');

  const address = eip155Addresses[account];

  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isLoadingReject, setIsLoadingReject] = useState(false);

  // Handle approve action, construct session namespace
  const onApprove = useCallback(async () => {
    if (messages.length > 0) {
      try {
        setIsLoadingApprove(true);
        const signedAuths: AuthTypes.Cacao[] = [];

        messages.forEach(async message => {
          const signature = await eip155Wallets[address].signMessage(
            message.message,
          );
          const signedCacao = buildAuthObject(
            message.authPayload,
            {
              t: 'eip191',
              s: signature,
            },
            message.iss,
          );
          signedAuths.push(signedCacao);
        });
        await web3wallet.approveSessionAuthenticate({
          id: messages[0].id,
          auths: signedAuths,
        });

        SettingsStore.setSessions(
          Object.values(web3wallet.getActiveSessions()),
        );

        handleRedirect({
          peerRedirect: authRequest.params.requester?.metadata?.redirect,
          isLinkMode: isLinkMode,
        });
      } catch (e) {
        console.log((e as Error).message, 'error');
        return;
      }
    }
    setIsLoadingApprove(false);
    ModalStore.close();
  }, [address, messages, authRequest, isLinkMode]);

  // Handle reject action
  const onReject = useCallback(async () => {
    if (authRequest) {
      try {
        setIsLoadingReject(true);
        await web3wallet.rejectSessionAuthenticate({
          id: authRequest.id,
          reason: getSdkError('USER_REJECTED'),
        });
      } catch (e) {
        console.log((e as Error).message, 'error');
        return;
      }
    }
    setIsLoadingReject(false);
    ModalStore.close();
  }, [authRequest]);

  useEffect(() => {
    if (authRequest && supportedChains && supportedMethods) {
      const authPayload = populateAuthPayload({
        authPayload: authRequest.params.authPayload,
        chains: supportedChains,
        methods: supportedMethods,
      });
      const iss = `${authPayload.chains[0]}:${address}`;

      if (signStrategy === 'one') {
        const message = web3wallet.formatAuthMessage({
          request: authPayload,
          iss,
        });
        setMessages([{authPayload, message, id: authRequest.id, iss}]);
      } else if (signStrategy === 'all') {
        const messagesToSign: any[] = [];
        authPayload.chains.forEach((chain: string) => {
          const message = web3wallet.formatAuthMessage({
            request: authPayload,
            iss: `${chain}:${address}`,
          });
          messagesToSign.push({authPayload, message, id: authRequest.id, iss});
        });
        setMessages(messagesToSign);
      }
    }
  }, [signStrategy, authRequest, supportedChains, supportedMethods, address]);

  return (
    <RequestModal
      intention="wants to request a signature"
      metadata={authRequest.params.requester.metadata}
      onApprove={onApprove}
      onReject={onReject}
      isLinkMode={isLinkMode}
      approveLoader={isLoadingApprove}
      rejectLoader={isLoadingReject}>
      <View style={[styles.divider, {backgroundColor: Theme['bg-300']}]} />
      <View style={styles.container}>
        <Text>{`Messages to sign (${messages?.length})`}</Text>
        <Message
          showTitle={false}
          message={messages.map(m => `${m.message}\n\n`).toString()}
          style={styles.messageContainer}
        />
      </View>
    </RequestModal>
  );
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 16,
  },
  container: {
    paddingHorizontal: 16,
    marginBottom: 8,
    rowGap: 8,
  },
  messageContainer: {
    maxHeight: 250,
  },
});
