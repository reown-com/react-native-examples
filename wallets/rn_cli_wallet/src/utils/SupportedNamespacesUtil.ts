import SettingsStore from '@/store/SettingsStore';
import { ALL_CHAINS } from '@/utils/PresetsUtil';
import { EIP155_CHAINS, EIP155_SIGNING_METHODS } from '@/constants/Eip155';
import { SUI_CHAINS, SUI_EVENTS, SUI_SIGNING_METHODS } from '@/constants/Sui';
import { TON_CHAINS, TON_SIGNING_METHODS } from '@/constants/Ton';
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

// Shared by SessionProposalModal and the Explore auto-approve path
// (PickerUtil), so both approve the same namespaces.

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

export function buildSupportedNamespaces(
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

export function getCurrentWalletAddresses(): WalletAddresses {
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

export type SupportedNamespaces = ReturnType<typeof buildSupportedNamespaces>;

// Filter namespaces based on selected chains
export function filterNamespacesByChains(
  namespaces: SupportedNamespaces,
  selectedIds: string[],
): SupportedNamespaces {
  const filtered = { ...namespaces };

  (Object.keys(filtered) as Array<keyof typeof filtered>).forEach(ns => {
    filtered[ns] = {
      ...filtered[ns],
      chains: filtered[ns].chains.filter(chain => selectedIds.includes(chain)),
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
}
