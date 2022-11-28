import {useSnapshot} from 'valtio';
import {useCallback, useMemo, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {SignClientTypes} from '@walletconnect/types';
import {buildApprovedNamespaces, getSdkError} from '@walletconnect/utils';

import {Events} from '@/components/Modal/Events';
import {Methods} from '@/components/Modal/Methods';
import ModalStore from '@/store/ModalStore';
import {eip155Addresses} from '@/utils/EIP155WalletUtil';
import {walletKit} from '@/utils/WalletKitUtil';
import SettingsStore from '@/store/SettingsStore';
import {handleRedirect} from '@/utils/LinkingUtils';
import {useTheme} from '@/hooks/useTheme';
import {Chains} from '@/components/Modal/Chains';
import {EIP155_CHAINS, EIP155_SIGNING_METHODS} from '@/utils/PresetsUtil';
import {RequestModal} from './RequestModal';
import {getSupportedChains} from '@/utils/HelperUtil';
import Toast from 'react-native-toast-message';

export default function SessionProposalModal() {
  const Theme = useTheme();
  // Get proposal data and wallet address from store
  const {data} = useSnapshot(ModalStore.state);
  const proposal =
    data?.proposal as SignClientTypes.EventArguments['session_proposal'];

  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isLoadingReject, setIsLoadingReject] = useState(false);

  const methods = proposal?.params?.optionalNamespaces?.eip155?.methods;
  const events = proposal?.params?.optionalNamespaces?.eip155?.events;

  const requestMetadata: SignClientTypes.Metadata =
    proposal?.params.proposer.metadata;

  const supportedNamespaces = useMemo(() => {
    // eip155
    const eip155Chains = Object.keys(EIP155_CHAINS).map(
      chain => `eip155:${chain}`,
    );

    const eip155Methods = Object.values(EIP155_SIGNING_METHODS);

    return {
      eip155: {
        chains: eip155Chains,
        methods: eip155Methods,
        events: ['accountsChanged', 'chainChanged'],
        accounts: eip155Chains
          .map(chain => `${chain}:${eip155Addresses[0]}`)
          .flat(),
      },
    };
  }, []);

  const supportedChains = useMemo(() => {
    if (!proposal) {
      return [];
    }

    return getSupportedChains(
      proposal.params.requiredNamespaces,
      proposal.params.optionalNamespaces,
    );
  }, [proposal]);

  // Handle approve action, construct session namespace
  const onApprove = useCallback(async () => {
    if (proposal) {
      setIsLoadingApprove(true);
      const namespaces = buildApprovedNamespaces({
        proposal: proposal.params,
        supportedNamespaces,
      });

      try {
        const session = await walletKit.approveSession({
          id: proposal.id,
          namespaces,
        });
        SettingsStore.setSessions(Object.values(walletKit.getActiveSessions()));

        handleRedirect({
          peerRedirect: session.peer.metadata.redirect,
          isLinkMode: session?.transportType === 'link_mode',
        });
      } catch (e) {
        console.log((e as Error).message, 'error');
        Toast.show({
          type: 'error',
          text1: (e as Error).message,
        });
      }
    }
    setIsLoadingApprove(false);
    ModalStore.close();
  }, [proposal, supportedNamespaces]);

  // Handle reject action
  const onReject = useCallback(async () => {
    if (proposal) {
      try {
        setIsLoadingReject(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        await walletKit.rejectSession({
          id: proposal.id,
          reason: getSdkError('USER_REJECTED_METHODS'),
        });
      } catch (e) {
        console.log((e as Error).message, 'error');
        return;
      }
    }
    setIsLoadingReject(false);
    ModalStore.close();
  }, [proposal]);

  return (
    <RequestModal
      intention="wants to connect"
      metadata={requestMetadata}
      onApprove={onApprove}
      onReject={onReject}
      approveLoader={isLoadingApprove}
      rejectLoader={isLoadingReject}>
      <View style={[styles.divider, {backgroundColor: Theme['bg-300']}]} />
      <View style={styles.container}>
        <Chains chains={supportedChains} />
        <Methods methods={methods} />
        <Events events={events} />
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
});
