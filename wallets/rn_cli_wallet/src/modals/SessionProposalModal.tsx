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
import { ALL_CHAINS } from '@/utils/PresetsUtil';
import { EIP155_CHAINS, EIP155_SIGNING_METHODS } from '@/constants/Eip155';
import { SUI_CHAINS, SUI_EVENTS, SUI_SIGNING_METHODS } from '@/constants/Sui';
import { TON_CHAINS, TON_SIGNING_METHODS } from '@/constants/Ton';
import { getWallet } from '@/utils/TonWalletUtil';
import { TRON_CHAINS, TRON_SIGNING_METHODS } from '@/constants/Tron';
import {
  CANTON_CHAINS,
  CANTON_SIGNING_METHODS,
  CANTON_EVENTS,
} from '@/constants/Canton';
import {
  SOLANA_CHAINS,
  SOLANA_EVENTS,
  SOLANA_SIGNING_METHODS,
} from '@/constants/Solana';
import {
  BIP122_CHAINS,
  BIP122_EVENTS,
  BIP122_SIGNING_METHODS,
} from '@/constants/Bitcoin';
import {
  STELLAR_CHAINS,
  STELLAR_EVENTS,
  STELLAR_SIGNING_METHODS,
} from '@/constants/Stellar';
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

interface WalletAddresses {
  eip155Address: string;
  suiAddress: string;
  tonAddress: string;
  tronAddress: string;
  cantonAddress: string;
  solanaAddress: string;
  bitcoinAddresses: string[];
  stellarAddress: string;
}

function buildSupportedNamespaces(
  testNets: boolean,
  addresses: WalletAddresses,
) {
  const withoutTestnets = (chainIds: string[]) =>
    testNets ? chainIds : chainIds.filter(id => !ALL_CHAINS[id]?.isTestnet);

  const eip155Chains = withoutTestnets(Object.keys(EIP155_CHAINS));
  const suiChains = Object.keys(SUI_CHAINS);
  const tonChains = Object.keys(TON_CHAINS);
  const tronChains = Object.keys(TRON_CHAINS);
  const cantonChains = Object.keys(CANTON_CHAINS);
  const solanaChains = Object.keys(SOLANA_CHAINS);
  const bip122Chains = Object.keys(BIP122_CHAINS);
  const stellarChains = withoutTestnets(Object.keys(STELLAR_CHAINS));

  const accountsFor = (chains: string[], address: string) =>
    address ? chains.map(chain => `${chain}:${address}`) : [];

  return {
    eip155: {
      chains: eip155Chains,
      methods: Object.values(EIP155_SIGNING_METHODS),
      events: ['accountsChanged', 'chainChanged'],
      accounts: accountsFor(eip155Chains, addresses.eip155Address),
    },
    sui: {
      chains: suiChains,
      methods: Object.values(SUI_SIGNING_METHODS),
      events: Object.values(SUI_EVENTS),
      accounts: accountsFor(suiChains, addresses.suiAddress),
    },
    ton: {
      chains: tonChains,
      methods: Object.values(TON_SIGNING_METHODS),
      events: [] as string[],
      accounts: accountsFor(tonChains, addresses.tonAddress),
    },
    tron: {
      chains: tronChains,
      methods: Object.values(TRON_SIGNING_METHODS),
      events: [] as string[],
      accounts: accountsFor(tronChains, addresses.tronAddress),
    },
    canton: {
      chains: cantonChains,
      methods: Object.values(CANTON_SIGNING_METHODS),
      events: Object.values(CANTON_EVENTS),
      accounts: accountsFor(cantonChains, addresses.cantonAddress),
    },
    solana: {
      chains: solanaChains,
      methods: Object.values(SOLANA_SIGNING_METHODS),
      events: Object.values(SOLANA_EVENTS),
      accounts: accountsFor(solanaChains, addresses.solanaAddress),
    },
    bip122: {
      chains: bip122Chains,
      methods: Object.values(BIP122_SIGNING_METHODS),
      events: Object.values(BIP122_EVENTS),
      accounts: addresses.bitcoinAddresses.length
        ? bip122Chains.flatMap(chain =>
            addresses.bitcoinAddresses.map(address => `${chain}:${address}`),
          )
        : [],
    },
    stellar: {
      chains: stellarChains,
      methods: Object.values(STELLAR_SIGNING_METHODS),
      events: Object.values(STELLAR_EVENTS),
      accounts: accountsFor(stellarChains, addresses.stellarAddress),
    },
  };
}

function getCurrentWalletAddresses(): WalletAddresses {
  const state = SettingsStore.state;
  return {
    eip155Address: state.eip155Address,
    suiAddress: state.suiAddress,
    tonAddress: state.tonAddress,
    tronAddress: state.tronAddress,
    cantonAddress: state.cantonAddress,
    solanaAddress: state.solanaAddress,
    bitcoinAddresses: [...state.bitcoinAddresses],
    stellarAddress: state.stellarAddress,
  };
}

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

  // Filter namespaces based on selected chains
  const filterNamespacesByChains = useCallback(
    (
      namespaces: ReturnType<typeof buildSupportedNamespaces>,
      selectedIds: string[],
    ): ReturnType<typeof buildSupportedNamespaces> => {
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
  }, [proposal, selectedChainIds, filterNamespacesByChains, testNets]);

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
