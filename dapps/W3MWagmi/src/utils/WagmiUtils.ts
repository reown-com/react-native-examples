import {CreateConfigParameters} from 'wagmi';
import {Chain} from 'viem';
import {MMKV} from 'react-native-mmkv';

import {
  arbitrum,
  mainnet,
  polygon,
  avalanche,
  bsc,
  optimism,
  gnosis,
  zkSync,
  zora,
  base,
  celo,
  aurora,
  sepolia,
  monadTestnet,
} from '@wagmi/core/chains';
import {solana, bitcoin} from '@reown/appkit-react-native';
import {WagmiAdapter} from '@reown/appkit-wagmi-react-native';
import {
  PhantomConnector,
  SolanaAdapter,
  SolflareConnector,
} from '@reown/appkit-solana-react-native';
import {BitcoinAdapter} from '@reown/appkit-bitcoin-react-native';
import {CoinbaseConnector} from '@reown/appkit-coinbase-react-native';

export const chains: CreateConfigParameters['chains'] = [
  mainnet,
  polygon,
  avalanche,
  arbitrum,
  bsc,
  optimism,
  gnosis,
  zkSync,
  zora,
  base,
  celo,
  aurora,
  sepolia,
  monadTestnet,
];

// Stable string ids used to persist the user's network selection.
export const SOLANA_ID = String(solana.id);
export const BITCOIN_ID = String(bitcoin.id);

/**
 * Registry of every selectable network, grouped by ecosystem.
 * Drives the NetworkSettings UI and the persisted selection.
 */
export const NETWORK_GROUPS: {
  title: string;
  items: {id: string; name: string}[];
}[] = [
  {
    title: 'EVM',
    items: chains.map(chain => ({id: String(chain.id), name: chain.name})),
  },
  {title: 'Solana', items: [{id: SOLANA_ID, name: solana.name}]},
  {title: 'Bitcoin', items: [{id: BITCOIN_ID, name: bitcoin.name}]},
];

// All selectable ids — used as the default (everything enabled).
export const ALL_NETWORK_IDS: string[] = NETWORK_GROUPS.flatMap(group =>
  group.items.map(item => item.id),
);

export interface NetworkConfig {
  wagmiAdapter: WagmiAdapter;
  adapters: any[];
  networks: any[];
  extraConnectors: any[];
}

/**
 * Builds the AppKit network configuration from the user's selection.
 *
 * AppKit's `createAppKit` is a singleton and cannot be reconfigured at runtime,
 * so this is read once at app launch and applied after a reload.
 *
 * The EVM (Wagmi) adapter is always present with at least one chain, since the
 * example relies on wagmi hooks / WagmiProvider throughout.
 */
export function buildNetworkConfig(
  projectId: string,
  enabledIds: string[],
): NetworkConfig {
  const enabled = new Set(enabledIds);

  // EVM: keep selected chains, fall back to mainnet if the user disabled them all.
  let enabledEvm = chains.filter(chain => enabled.has(String(chain.id)));
  if (enabledEvm.length === 0) {
    enabledEvm = [mainnet];
  }

  const wagmiAdapter = new WagmiAdapter({
    projectId,
    networks: enabledEvm as [Chain, ...Chain[]],
  });

  const adapters: any[] = [wagmiAdapter];
  const networks: any[] = [...enabledEvm];
  const extraConnectors: any[] = [
    new CoinbaseConnector({storage: new MMKV()}),
  ];

  if (enabled.has(SOLANA_ID)) {
    adapters.push(new SolanaAdapter());
    networks.push(solana);
    extraConnectors.push(new PhantomConnector(), new SolflareConnector());
  }

  if (enabled.has(BITCOIN_ID)) {
    adapters.push(new BitcoinAdapter());
    networks.push(bitcoin);
  }

  return {wagmiAdapter, adapters, networks, extraConnectors};
}
