import { useSnapshot } from 'valtio';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SignClientTypes } from '@walletconnect/types';
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils';
import Toast from 'react-native-toast-message';

import ModalStore from '@/store/ModalStore';
import { eip155Addresses } from '@/utils/EIP155WalletUtil';
import { walletKit } from '@/utils/WalletKitUtil';
import SettingsStore from '@/store/SettingsStore';
import { handleRedirect } from '@/utils/LinkingUtils';
import { RequestModal } from './RequestModal';
import { getSupportedChains } from '@/utils/HelperUtil';
import { suiAddresses } from '@/utils/SuiWalletUtil';
import { EIP155_CHAINS, EIP155_SIGNING_METHODS } from '@/constants/Eip155';
import { SUI_CHAINS, SUI_EVENTS, SUI_SIGNING_METHODS } from '@/constants/Sui';
import { TON_CHAINS, TON_SIGNING_METHODS } from '@/constants/Ton';
import { tonAddresses } from '@/utils/TonWalletUtil';
import { tronAddresses } from '@/utils/TronWalletUtil';
import { TRON_CHAINS, TRON_SIGNING_METHODS } from '@/constants/Tron';
import { AccordionCard } from '@/components/AccordionCard';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { AppPermissions } from '@/components/AppPermissions';
import { NetworkSelector } from '@/components/NetworkSelector';
import { ChainIcons } from '@/components/ChainIcons';
import { Text } from '@/components/Text';
import { Spacing } from '@/utils/ThemeUtil';

// Height constants for accordion animation
const PERMISSION_ROW_HEIGHT = 28;
const PERMISSIONS_COUNT = 3;
const PERMISSIONS_GAP = Spacing[2];
const PERMISSIONS_HEIGHT =
  PERMISSION_ROW_HEIGHT * PERMISSIONS_COUNT +
  PERMISSIONS_GAP * (PERMISSIONS_COUNT - 1);

const NETWORK_ROW_HEIGHT = 40;
const NETWORK_GAP = Spacing[2];
const MAX_VISIBLE_NETWORKS = 5;

type AccordionType = 'app' | 'network' | null;

export default function SessionProposalModal() {
  const { data } = useSnapshot(ModalStore.state);
  const { currentRequestVerifyContext } = useSnapshot(SettingsStore.state);
  const proposal =
    data?.proposal as SignClientTypes.EventArguments['session_proposal'];

  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isLoadingReject, setIsLoadingReject] = useState(false);
  const [expandedAccordion, setExpandedAccordion] =
    useState<AccordionType>(null);
  const [selectedChainIds, setSelectedChainIds] = useState<string[]>([]);
  const hasInitializedChains = useRef(false);

  const requestMetadata: SignClientTypes.Metadata =
    proposal?.params.proposer.metadata;

  const validation = currentRequestVerifyContext?.verified?.validation;
  const isScam = currentRequestVerifyContext?.verified?.isScam;

  const supportedNamespaces = useMemo(() => {
    const eip155Chains = Object.keys(EIP155_CHAINS);
    const eip155Methods = Object.values(EIP155_SIGNING_METHODS);

    const suiChains = Object.keys(SUI_CHAINS);
    const suiMethods = Object.values(SUI_SIGNING_METHODS);
    const suiEvents = Object.values(SUI_EVENTS);

    const tonChains = Object.keys(TON_CHAINS);
    const tonMethods = Object.values(TON_SIGNING_METHODS);
    const tonEvents = [] as string[];

    const tronChains = Object.keys(TRON_CHAINS);
    const tronMethods = Object.values(TRON_SIGNING_METHODS);
    const tronEvents = [] as string[];

    return {
      eip155: {
        chains: eip155Chains,
        methods: eip155Methods,
        events: ['accountsChanged', 'chainChanged'],
        accounts: eip155Chains
          .map(chain => `${chain}:${eip155Addresses[0]}`)
          .flat(),
      },
      sui: {
        chains: suiChains,
        methods: suiMethods,
        events: suiEvents,
        accounts: suiChains.map(chain => `${chain}:${suiAddresses[0]}`).flat(),
      },
      ton: {
        chains: tonChains,
        methods: tonMethods,
        events: tonEvents,
        accounts: tonChains.map(chain => `${chain}:${tonAddresses[0]}`).flat(),
      },
      tron: {
        chains: tronChains,
        methods: tronMethods,
        events: tronEvents,
        accounts: tronChains
          .map(chain => `${chain}:${tronAddresses[0]}`)
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

  // Initialize selected chains with all supported chains (only once)
  useEffect(() => {
    if (supportedChains.length > 0 && !hasInitializedChains.current) {
      hasInitializedChains.current = true;
      setSelectedChainIds(
        supportedChains.map(c => `${c.namespace}:${c.chainId}`),
      );
    }
  }, [supportedChains, proposal.id]);

  // Calculate network accordion height based on chain count (capped at MAX_VISIBLE_NETWORKS)
  const networkHeight = useMemo(() => {
    const chainCount = Math.min(supportedChains.length, MAX_VISIBLE_NETWORKS);
    return (
      NETWORK_ROW_HEIGHT * chainCount + NETWORK_GAP * Math.max(0, chainCount - 1)
    );
  }, [supportedChains.length]);

  const toggleAccordion = (type: AccordionType) => {
    setExpandedAccordion(prev => (prev === type ? null : type));
  };

  // Filter namespaces based on selected chains
  const filterNamespacesByChains = useCallback(
    (
      namespaces: typeof supportedNamespaces,
      selectedIds: string[],
    ): typeof supportedNamespaces => {
      const filtered = { ...namespaces };

      (Object.keys(filtered) as Array<keyof typeof filtered>).forEach(ns => {
        filtered[ns] = {
          ...filtered[ns],
          chains: filtered[ns].chains.filter(chain =>
            selectedIds.includes(chain),
          ),
          accounts: filtered[ns].accounts.filter(account =>
            selectedIds.some(id => account.startsWith(id)),
          ),
        };
      });

      // Remove namespaces with no chains
      (Object.keys(filtered) as Array<keyof typeof filtered>).forEach(ns => {
        if (filtered[ns].chains.length === 0) {
          delete filtered[ns];
        }
      });

      return filtered;
    },
    [],
  );

  const onApprove = useCallback(async () => {
    if (proposal) {
      setIsLoadingApprove(true);

      const filteredNamespaces = filterNamespacesByChains(
        supportedNamespaces,
        selectedChainIds,
      );

      const namespaces = buildApprovedNamespaces({
        proposal: proposal.params,
        supportedNamespaces: filteredNamespaces,
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
          text1: 'Connection failed',
          text2: (e as Error).message,
        });
      } finally {
        setIsLoadingApprove(false);
        ModalStore.close();
      }
    }
  }, [proposal, supportedNamespaces, selectedChainIds, filterNamespacesByChains]);

  const onReject = useCallback(async () => {
    if (proposal) {
      setIsLoadingReject(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await walletKit.rejectSession({
          id: proposal.id,
          reason: getSdkError('USER_REJECTED_METHODS'),
        });
        handleRedirect({
          peerRedirect: proposal.params.proposer.metadata.redirect,
          isLinkMode: false,
          error: 'User rejected connect request',
        });
      } catch (e) {
        console.log((e as Error).message, 'error');
        Toast.show({
          type: 'error',
          text1: 'Rejection failed',
          text2: (e as Error).message,
        });
      } finally {
        setIsLoadingReject(false);
        ModalStore.close();
      }
    }
  }, [proposal]);

  return (
    <RequestModal
      intention="Connect your wallet to"
      metadata={requestMetadata}
      onApprove={onApprove}
      onReject={onReject}
      approveLoader={isLoadingApprove}
      rejectLoader={isLoadingReject}
      approveLabel="Connect"
      approveDisabled={selectedChainIds.length === 0}
    >
      <View style={styles.container}>
        {/* App Accordion */}
        <AccordionCard
          headerContent={
            <Text
              variant="lg-400"
              color="text-tertiary"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {requestMetadata?.url?.replace(/^https?:\/\//, '') || 'unknown domain'}
            </Text>
          }
          rightContent={<VerifiedBadge validation={validation} isScam={isScam} />}
          isExpanded={expandedAccordion === 'app'}
          onPress={() => toggleAccordion('app')}
          expandedHeight={PERMISSIONS_HEIGHT}
        >
          <AppPermissions />
        </AccordionCard>

        {/* Network Accordion */}
        <AccordionCard
          headerContent={
            <Text variant="lg-400" color="text-tertiary">
              Network
            </Text>
          }
          rightContent={<ChainIcons chainIds={selectedChainIds} />}
          isExpanded={expandedAccordion === 'network'}
          onPress={() => toggleAccordion('network')}
          expandedHeight={networkHeight}
        >
          <NetworkSelector
            availableChains={supportedChains}
            selectedChainIds={selectedChainIds}
            onSelectionChange={setSelectedChainIds}
          />
        </AccordionCard>
      </View>
    </RequestModal>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    marginBottom: Spacing[2],
    rowGap: Spacing[2],
    width: '100%',
  },
});
