import { useSnapshot } from 'valtio';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SignClientTypes } from '@walletconnect/types';
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils';
import { showToast } from '@/utils/ToastUtil';

import LogStore from '@/store/LogStore';
import ModalStore from '@/store/ModalStore';
import { walletKit } from '@/utils/WalletKitUtil';
import SettingsStore from '@/store/SettingsStore';
import { ensureWalletsForChainIds } from '@/utils/WalletInitializationUtil';
import { handleRedirect } from '@/utils/LinkingUtils';
import { RequestModal } from './RequestModal';
import { getSupportedChains } from '@/utils/HelperUtil';
import {
  buildSupportedNamespaces,
  filterNamespacesByChains,
  getCurrentWalletAddresses,
} from '@/utils/SupportedNamespacesUtil';
import { getWallet } from '@/utils/TonWalletUtil';
import { AccordionCard } from '@/components/AccordionCard';
import { AppInfoCard } from '@/components/AppInfoCard';
import { NetworkSelector } from '@/components/NetworkSelector';
import { ChainIcons } from '@/components/ChainIcons';
import { Text } from '@/components/Text';
import { Spacing } from '@/utils/ThemeUtil';
import { haptics } from '@/utils/haptics';

// Height constants for accordion animation
const NETWORK_ROW_HEIGHT = 40;
const NETWORK_GAP = Spacing[2];
const MAX_VISIBLE_NETWORKS = 5;

type AccordionType = 'app' | 'network' | null;

export default function SessionProposalModal() {
  const { data } = useSnapshot(ModalStore.state);
  const { currentRequestVerifyContext, testNets } = useSnapshot(
    SettingsStore.state,
  );
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

  const supportedChains = useMemo(() => {
    if (!proposal) {
      return [];
    }

    return getSupportedChains(
      proposal.params.requiredNamespaces,
      proposal.params.optionalNamespaces,
    );
    // getSupportedChains reads the current `testNets` setting internally; the
    // toggle lives in Settings and can't change while this modal is open.
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
      NETWORK_ROW_HEIGHT * chainCount +
      NETWORK_GAP * Math.max(0, chainCount - 1)
    );
  }, [supportedChains.length]);

  const toggleAccordion = (type: AccordionType) => {
    setExpandedAccordion(prev => (prev === type ? null : type));
  };

  const onApprove = useCallback(async () => {
    if (proposal) {
      setIsLoadingApprove(true);

      try {
        // The idle queue may not have reached every requested namespace yet.
        // Restore selected signers before advertising their accounts.
        await ensureWalletsForChainIds(selectedChainIds);
        const refreshedNamespaces = buildSupportedNamespaces(
          testNets,
          getCurrentWalletAddresses(),
        );
        const filteredNamespaces = filterNamespacesByChains(
          refreshedNamespaces,
          selectedChainIds,
        );
        const namespaces = buildApprovedNamespaces({
          proposal: proposal.params,
          supportedNamespaces: filteredNamespaces,
        });

        // Build session properties for TON
        const sessionProperties: Record<string, string> = {};

        if (namespaces.ton) {
          const tonWallet = await getWallet();
          sessionProperties.ton_getPublicKey = tonWallet.getPublicKey();
          sessionProperties.ton_getStateInit = tonWallet.getStateInit();
        }

        const session = await walletKit.approveSession({
          id: proposal.id,
          namespaces,
          sessionProperties:
            Object.keys(sessionProperties).length > 0
              ? sessionProperties
              : undefined,
        });
        haptics.requestResponse();
        SettingsStore.setSessions(Object.values(walletKit.getActiveSessions()));

        handleRedirect({
          peerRedirect: session.peer.metadata.redirect,
          isLinkMode: session?.transportType === 'link_mode',
        });
      } catch (e) {
        LogStore.error(
          (e as Error).message,
          'SessionProposalModal',
          'onApprove',
        );
        showToast({
          type: 'error',
          text1: 'Connection failed',
          text2: (e as Error).message,
        });
      } finally {
        setIsLoadingApprove(false);
        ModalStore.close();
      }
    }
  }, [proposal, selectedChainIds, testNets]);

  const onReject = useCallback(async () => {
    if (proposal) {
      setIsLoadingReject(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await walletKit.rejectSession({
          id: proposal.id,
          reason: getSdkError('USER_REJECTED_METHODS'),
        });
        haptics.requestResponse();
        handleRedirect({
          peerRedirect: proposal.params.proposer.metadata.redirect,
          isLinkMode: false,
          error: 'User rejected connect request',
        });
      } catch (e) {
        LogStore.error(
          (e as Error).message,
          'SessionProposalModal',
          'onReject',
        );
        showToast({
          type: 'error',
          text1: 'Couldn’t reject request',
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
        <AppInfoCard
          url={requestMetadata?.url}
          validation={validation}
          isScam={isScam}
          isExpanded={expandedAccordion === 'app'}
          onPress={() => toggleAccordion('app')}
        />

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
          hideExpand={supportedChains.length <= 1}
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
