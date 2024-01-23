import React, {useCallback, useMemo, useState} from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {AcceptRejectButton} from '../components/AcceptRejectButton';
import {Events} from '../components/Modal/Events';
import {Methods} from '../components/Modal/Methods';
import {ModalHeader} from '../components/Modal/ModalHeader';
import {Tag} from '../components/Tag';
import {useSnapshot} from 'valtio';
import ModalStore from '../store/ModalStore';
import {SignClientTypes} from '@walletconnect/types';
import {EIP155_CHAINS, EIP155_SIGNING_METHODS} from '../data/EIP155Data';
import {eip155Addresses} from '../utils/EIP155WalletUtil';
import {buildApprovedNamespaces, getSdkError} from '@walletconnect/utils';
import {web3wallet} from '../utils/WalletConnectUtil';
import SettingsStore from '../store/SettingsStore';
import {getChainData} from '../data/chainsUtil';
import {handleDeepLinkRedirect} from '../utils/LinkingUtils';

export default function SessionProposalModal() {
  // Get proposal data and wallet address from store
  const data = useSnapshot(ModalStore.state);
  const proposal = data?.data
    ?.proposal as SignClientTypes.EventArguments['session_proposal'];

  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isLoadingReject, setIsLoadingReject] = useState(false);
  console.log('proposal', data.data?.proposal);

  const name = proposal?.params?.proposer?.metadata?.name;
  const url = proposal?.params?.proposer?.metadata.url;
  const methods = proposal?.params?.optionalNamespaces?.eip155?.methods;
  const events = proposal?.params?.optionalNamespaces?.eip155?.events;
  // const chains = proposal?.params?.optionalNamespaces?.eip155?.chains;
  const icon = proposal?.params.proposer.metadata.icons[0];

  const supportedNamespaces = useMemo(() => {
    // eip155
    const eip155Chains = Object.keys(EIP155_CHAINS);
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
  console.log('supportedNamespaces', supportedNamespaces, eip155Addresses);

  const requestedChains = useMemo(() => {
    if (!proposal) {
      return [];
    }
    const required = [];
    for (const [key, values] of Object.entries(
      proposal.params.requiredNamespaces,
    )) {
      const chains = key.includes(':') ? key : values.chains;
      required.push(chains);
    }

    const optional = [];
    for (const [key, values] of Object.entries(
      proposal.params.optionalNamespaces,
    )) {
      const chains = key.includes(':') ? key : values.chains;
      optional.push(chains);
    }
    console.log('requestedChains', [
      ...new Set([...required.flat(), ...optional.flat()]),
    ]);
    return [...new Set([...required.flat(), ...optional.flat()])];
  }, [proposal]);

  // the chains that are supported by the wallet from the proposal
  const supportedChains = useMemo(
    () => requestedChains.map(chain => getChainData(chain!)),
    [requestedChains],
  );

  // get required chains that are not supported by the wallet
  const notSupportedChains = useMemo(() => {
    if (!proposal) {
      return [];
    }
    const required = [];
    for (const [key, values] of Object.entries(
      proposal.params.requiredNamespaces,
    )) {
      const chains = key.includes(':') ? key : values.chains;
      required.push(chains);
    }
    return required
      .flat()
      .filter(
        chain =>
          !supportedChains
            .map(
              supportedChain =>
                `${supportedChain?.namespace}:${supportedChain?.chainId}`,
            )
            .includes(chain!),
      );
  }, [proposal, supportedChains]);

  console.log('notSupportedChains', notSupportedChains);

  const getAddress = useCallback((namespace?: string) => {
    if (!namespace) {
      return 'N/A';
    }
    switch (namespace) {
      case 'eip155':
        return eip155Addresses[0];
    }
  }, []);

  // Hanlde approve action, construct session namespace
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
        setIsLoadingApprove(false);
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
        setIsLoadingReject(false);
        console.log((e as Error).message, 'error');
        return;
      }
    }
    setIsLoadingReject(false);
    ModalStore.close();
  }, [proposal]);

  return (
    <View style={styles.container}>
      <View style={styles.modalContainer}>
        <ModalHeader name={name} url={url} icon={icon} />

        <View style={styles.divider} />
        <Text style={styles.permissionsText}>REQUESTED PERMISSIONS:</Text>

        <View style={styles.chainContainer}>
          <View style={styles.flexRowWrapped}>
            {supportedChains?.map((chain, index: number) => {
              return (
                <Tag
                  key={index}
                  value={chain?.name.toUpperCase() || ''}
                  grey={true}
                />
              );
            })}
          </View>

          <Methods methods={methods} />
          <Events events={events} />
        </View>

        <View style={styles.flexRow}>
          <AcceptRejectButton accept={false} onPress={onReject} />
          <AcceptRejectButton accept={true} onPress={onApprove} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexRow: {
    flex: 1,
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
    backgroundColor: 'rgba(242, 242, 247, 0.8)',
    width: '100%',
    paddingTop: 30,
    minHeight: '70%',
    position: 'absolute',
    bottom: 44,
  },
  permissionsText: {
    color: 'rgba(60, 60, 67, 0.6)',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    paddingBottom: 8,
  },
  chainContainer: {
    width: '90%',
    padding: 10,
    borderRadius: 25,
    backgroundColor: 'rgba(80, 80, 89, 0.1)',
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: 'rgba(60, 60, 67, 0.36)',
    marginVertical: 16,
  },
});
