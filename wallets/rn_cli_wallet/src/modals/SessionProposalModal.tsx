import {useSnapshot} from 'valtio';
import {useCallback, useMemo, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {SignClientTypes} from '@walletconnect/types';
import {buildApprovedNamespaces, getSdkError} from '@walletconnect/utils';

import {Events} from '@/components/Modal/Events';
import {Methods} from '@/components/Modal/Methods';
import ModalStore from '@/store/ModalStore';
import {eip155Addresses} from '@/utils/EIP155WalletUtil';
import {web3wallet} from '@/utils/WalletConnectUtil';
import SettingsStore from '@/store/SettingsStore';
import {handleDeepLinkRedirect} from '@/utils/LinkingUtils';
import {useTheme} from '@/hooks/useTheme';
import {Chains} from '@/components/Modal/Chains';
import {
  EIP155Chains,
  EIP155_SIGNING_METHODS,
  PresetsUtil,
} from '@/utils/PresetsUtil';
import {RequestModal} from './RequestModal';

export default function SessionProposalModal() {
  const Theme = useTheme();
  // Get proposal data and wallet address from store
  const data = useSnapshot(ModalStore.state);
  const proposal = data?.data
    ?.proposal as SignClientTypes.EventArguments['session_proposal'];

  console.log('proposal', proposal);

  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isLoadingReject, setIsLoadingReject] = useState(false);

  const methods = proposal?.params?.optionalNamespaces?.eip155?.methods;
  const events = proposal?.params?.optionalNamespaces?.eip155?.events;

  const requestMetadata: SignClientTypes.Metadata =
    proposal?.params.proposer.metadata;

  const supportedNamespaces = useMemo(() => {
    // eip155
    const eip155Chains = Object.keys(EIP155Chains).map(
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

  const requestedChains = useMemo(() => {
    if (!proposal) {
      return [];
    }
    const required = [];
    for (const [key, values] of Object.entries(
      proposal.params.requiredNamespaces,
    )) {
      const chains = key.includes(':') ? key : values.chains;
      if (chains) {
        required.push(chains);
      }
    }

    const optional = [];
    for (const [key, values] of Object.entries(
      proposal.params.optionalNamespaces,
    )) {
      const chains = key.includes(':') ? key : values.chains;
      if (chains) {
        optional.push(chains);
      }
    }
    console.log('requestedChains', [
      ...new Set([...required.flat(), ...optional.flat()]),
    ]);
    return [...new Set([...required.flat(), ...optional.flat()])];
  }, [proposal]);

  // the chains that are supported by the wallet from the proposal
  const supportedChains = useMemo(() => {
    const chains = requestedChains
      .map(chain => PresetsUtil.getChainData(chain.split(':')[1]))
      .filter(chain => chain !== undefined);
    return chains;
  }, [requestedChains]);

  // Handle approve action, construct session namespace
  const onApprove = useCallback(async () => {
    if (proposal) {
      setIsLoadingApprove(true);
      const namespaces = buildApprovedNamespaces({
        proposal: proposal.params,
        supportedNamespaces,
      });

      console.log('approving namespaces:', namespaces);

      try {
        const session = await web3wallet.approveSession({
          id: proposal.id,
          namespaces,
        });
        SettingsStore.setSessions(
          Object.values(web3wallet.getActiveSessions()),
        );
        const sessionMetadata = session?.peer?.metadata;
        handleDeepLinkRedirect(sessionMetadata?.redirect);
      } catch (e) {
        console.log((e as Error).message, 'error');
        return;
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
        await web3wallet.rejectSession({
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
      <Chains chains={supportedChains} />
      <Methods methods={methods} />
      <Events events={events} />
    </RequestModal>
  );
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 16,
  },
});
