import {Chain} from './TypesUtil';
import Ethereum from '@/assets/chains/ethereum.webp';
import Arbitrum from '@/assets/chains/arbitrum.webp';
import Avalanche from '@/assets/chains/avalanche.webp';
import Binance from '@/assets/chains/binance.webp';
import Fantom from '@/assets/chains/fantom.webp';
import Optimism from '@/assets/chains/optimism.webp';
import Polygon from '@/assets/chains/polygon.webp';
import Gnosis from '@/assets/chains/gnosis.webp';
import Evmos from '@/assets/chains/evmos.webp';
import ZkSync from '@/assets/chains/zksync.webp';
import Filecoin from '@/assets/chains/filecoin.webp';
import Iotx from '@/assets/chains/iotx.webp';
import Metis from '@/assets/chains/metis.webp';
import Moonbeam from '@/assets/chains/moonbeam.webp';
import Moonriver from '@/assets/chains/moonriver.webp';
import Zora from '@/assets/chains/zora.webp';
import Celo from '@/assets/chains/celo.webp';
import Base from '@/assets/chains/base.webp';
import Aurora from '@/assets/chains/aurora.webp';
import Sui from '@/assets/chains/sui.webp';
import {ImageSourcePropType} from 'react-native';

// Helpers
export const EIP155_CHAINS: Record<string, Chain> = {
  'eip155:1': {
    id: 1,
    caip2: 'eip155:1',
    network: 'homestead',
    name: 'Ethereum',
    nativeCurrency: {name: 'Ether', symbol: 'ETH', decimals: 18},
    rpcUrl: 'https://eth.llamarpc.com',
    blockExplorer: 'https://etherscan.io',
  },
  'eip155:5': {
    id: 5,
    caip2: 'eip155:5',
    network: 'goerli',
    name: 'Ethereum Goerli',
    nativeCurrency: {name: 'Goerli Ether', symbol: 'ETH', decimals: 18},
    rpcUrl: 'https://rpc.ankr.com/eth_goerli',
    blockExplorer: 'https://goerli.etherscan.io',
  },
  'eip155:42161': {
    id: 42161,
    caip2: 'eip155:42161',
    network: 'arbitrum',
    name: 'Arbitrum One',
    nativeCurrency: {name: 'Ether', symbol: 'ETH', decimals: 18},
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    blockExplorer: 'https://arbiscan.io',
  },
  'eip155:43114': {
    id: 43114,
    caip2: 'eip155:43114',
    network: 'avalanche',
    name: 'Avalanche',
    nativeCurrency: {name: 'Avalanche', symbol: 'AVAX', decimals: 18},
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    blockExplorer: 'https://snowtrace.io',
  },
  'eip155:43113': {
    id: 43113,
    caip2: 'eip155:43113',
    network: 'avalanche-fuji',
    name: 'Avalanche Fuji',
    nativeCurrency: {name: 'Avalanche', symbol: 'AVAX', decimals: 18},
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    blockExplorer: 'https://testnet.snowtrace.io',
  },
  'eip155:56': {
    id: 56,
    caip2: 'eip155:56',
    network: 'bsc',
    name: 'Binance Smart Chain',
    nativeCurrency: {name: 'BNB', symbol: 'BNB', decimals: 18},
    rpcUrl: 'https://rpc.ankr.com/bsc',
    blockExplorer: 'https://bscscan.com',
  },
  'eip155:250': {
    id: 250,
    caip2: 'eip155:250',
    network: 'fantom',
    name: 'Fantom',
    nativeCurrency: {name: 'Fantom', symbol: 'FTM', decimals: 18},
    rpcUrl: 'https://rpc.ankr.com/fantom',
    blockExplorer: 'https://ftmscan.com',
  },
  'eip155:10': {
    id: 10,
    caip2: 'eip155:10',
    network: 'optimism',
    name: 'Optimism',
    nativeCurrency: {name: 'Ether', symbol: 'ETH', decimals: 18},
    rpcUrl: 'https://mainnet.optimism.io',
    blockExplorer: 'https://optimistic.etherscan.io',
  },
  'eip155:11155420': {
    id: 11155420,
    caip2: 'eip155:11155420',
    network: 'optimism-sepholia',
    name: 'Optimism Sepholia',
    nativeCurrency: {name: 'Sepolia Ether', symbol: 'ETH', decimals: 18},
    rpcUrl: 'https://sepolia.optimism.io',
    blockExplorer: 'https://optimism-sepolia.blockscout.com',
  },
  'eip155:137': {
    id: 137,
    caip2: 'eip155:137',
    network: 'polygon',
    name: 'Polygon',
    nativeCurrency: {name: 'Matic', symbol: 'MATIC', decimals: 18},
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
  },
  'eip155:80001': {
    id: 80001,
    caip2: 'eip155:80001',
    network: 'mumbai',
    name: 'Polygon Mumbai',
    nativeCurrency: {name: 'Matic', symbol: 'MATIC', decimals: 18},
    rpcUrl: 'https://rpc.ankr.com/polygon_mumbai',
    blockExplorer: 'https://mumbai.polygonscan.com',
  },
  'eip155:100': {
    id: 100,
    caip2: 'eip155:100',
    network: 'gnosis',
    name: 'Gnosis',
    nativeCurrency: {name: 'Gnosis', symbol: 'xDai', decimals: 18},
    rpcUrl: 'https://rpc.gnosischain.com',
    blockExplorer: 'https://gnosis.blockscout.com',
  },
  'eip155:9001': {
    id: 9001,
    caip2: 'eip155:9001',
    network: 'evmos',
    name: 'Evmos',
    nativeCurrency: {name: 'Evmos', symbol: 'EVMOS', decimals: 18},
    rpcUrl: 'https://eth.bd.evmos.org:8545',
    blockExplorer: 'https://escan.live',
  },
  'eip155:324': {
    id: 324,
    caip2: 'eip155:324',
    network: 'zksync-era',
    name: 'zkSync Era',
    nativeCurrency: {name: 'Ether', symbol: 'ETH', decimals: 18},
    rpcUrl: 'https://mainnet.era.zksync.io',
    blockExplorer: 'https://explorer.zksync.io',
  },
  'eip155:314': {
    id: 314,
    caip2: 'eip155:314',
    network: 'filecoin-mainnet',
    name: 'Filecoin Mainnet',
    nativeCurrency: {name: 'Filecoin', symbol: 'FIL', decimals: 18},
    rpcUrl: 'https://api.node.glif.io/rpc/v1',
    blockExplorer: 'https://filscan.io',
  },
  'eip155:4689': {
    id: 4689,
    caip2: 'eip155:4689',
    network: 'iotex',
    name: 'IoTeX',
    nativeCurrency: {name: 'IoTeX', symbol: 'IOTX', decimals: 18},
    rpcUrl: 'https://babel-api.mainnet.iotex.io',
    blockExplorer: 'https://iotexscan.io',
  },
  'eip155:1088': {
    id: 1088,
    caip2: 'eip155:1088',
    network: 'andromeda',
    name: 'Metis',
    nativeCurrency: {name: 'Metis', symbol: 'METIS', decimals: 18},
    rpcUrl: 'https://andromeda.metis.io/?owner=1088',
    blockExplorer: 'https://andromeda-explorer.metis.io',
  },
  'eip155:1284': {
    id: 1284,
    caip2: 'eip155:1284',
    network: 'moonbeam',
    name: 'Moonbeam',
    nativeCurrency: {name: 'GLMR', symbol: 'GLMR', decimals: 18},
    rpcUrl: 'https://moonbeam.public.blastapi.io',
    blockExplorer: 'https://moonscan.io',
  },
  'eip155:1285': {
    id: 1285,
    caip2: 'eip155:1285',
    network: 'moonriver',
    name: 'Moonriver',
    nativeCurrency: {name: 'MOVR', symbol: 'MOVR', decimals: 18},
    rpcUrl: 'https://moonriver.public.blastapi.io',
    blockExplorer: 'https://moonriver.moonscan.io',
  },
  'eip155:7777777': {
    id: 7777777,
    caip2: 'eip155:7777777',
    network: 'zora',
    name: 'Zora',
    nativeCurrency: {name: 'Ether', symbol: 'ETH', decimals: 18},
    rpcUrl: 'https://rpc.zora.energy',
    blockExplorer: 'https://explorer.zora.energy',
  },
  'eip155:42220': {
    id: 42220,
    caip2: 'eip155:42220',
    network: 'celo',
    name: 'Celo',
    nativeCurrency: {name: 'Celo', symbol: 'CELO', decimals: 18},
    rpcUrl: 'https://forno.celo.org',
    blockExplorer: 'https://explorer.celo.org/mainnet',
  },
  'eip155:8453': {
    id: 8453,
    caip2: 'eip155:8453',
    network: 'base',
    name: 'Base',
    nativeCurrency: {name: 'Ether', symbol: 'ETH', decimals: 18},
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
  },
  'eip155:1313161554': {
    id: 1313161554,
    caip2: 'eip155:1313161554',
    network: 'aurora',
    name: 'Aurora',
    nativeCurrency: {name: 'Ether', symbol: 'ETH', decimals: 18},
    rpcUrl: 'https://mainnet.aurora.dev',
    blockExplorer: 'https://aurorascan.dev',
  },
};

export const EIPNetworkImages: Record<string, ImageSourcePropType> = {
  'eip155:1': Ethereum,
  'eip155:5': Ethereum,
  'eip155:42161': Arbitrum,
  'eip155:43114': Avalanche,
  'eip155:43113': Avalanche,
  'eip155:56': Binance,
  'eip155:250': Fantom,
  'eip155:10': Optimism,
  'eip155:11155420': Optimism,
  'eip155:137': Polygon,
  'eip155:80001': Polygon,
  'eip155:100': Gnosis,
  'eip155:9001': Evmos,
  'eip155:324': ZkSync,
  'eip155:314': Filecoin,
  'eip155:4689': Iotx,
  'eip155:1088': Metis,
  'eip155:1284': Moonbeam,
  'eip155:1285': Moonriver,
  'eip155:7777777': Zora,
  'eip155:42220': Celo,
  'eip155:8453': Base,
  'eip155:1313161554': Aurora,
};

export const EIP155_SIGNING_METHODS = {
  PERSONAL_SIGN: 'personal_sign',
  ETH_SIGN: 'eth_sign',
  ETH_SIGN_TRANSACTION: 'eth_signTransaction',
  ETH_SIGN_TYPED_DATA: 'eth_signTypedData',
  ETH_SIGN_TYPED_DATA_V3: 'eth_signTypedData_v3',
  ETH_SIGN_TYPED_DATA_V4: 'eth_signTypedData_v4',
  ETH_SEND_RAW_TRANSACTION: 'eth_sendRawTransaction',
  ETH_SEND_TRANSACTION: 'eth_sendTransaction',
};

// SUI

/**
 * Methods
 */
export const SUI_SIGNING_METHODS = {
  SUI_SIGN_TRANSACTION: 'sui_signTransaction',
  SUI_SIGN_AND_EXECUTE_TRANSACTION: 'sui_signAndExecuteTransaction',
  SUI_SIGN_PERSONAL_MESSAGE: 'sui_signPersonalMessage',
};

/**
 * Events
 */

export const SUI_EVENTS = {
  SUI_ACCOUNTS_CHANGED: 'sui_accountsChanged',
  SUI_CHAIN_CHANGED: 'sui_chainChanged',
};

export type ISuiChainId = typeof SUI_MAINNET_CAIP2 | typeof SUI_TESTNET_CAIP2;

export const SUI_NAMESPACE = 'sui';

export const SUI_MAINNET_ID = 'mainnet';
export const SUI_TESTNET_ID = 'testnet';
export const SUI_DEVNET_ID = 'devnet';
export const SUI_MAINNET_CAIP2 = `${SUI_NAMESPACE}:${SUI_MAINNET_ID}`;
export const SUI_TESTNET_CAIP2 = `${SUI_NAMESPACE}:${SUI_TESTNET_ID}`;
export const SUI_DEVNET_CAIP2 = `${SUI_NAMESPACE}:${SUI_DEVNET_ID}`;

export const SUI_MAINNET = {
  [SUI_MAINNET_CAIP2]: {
    id: SUI_MAINNET_ID,
    caip2: SUI_MAINNET_CAIP2,
    network: 'sui',
    name: 'SUI Mainnet',
    nativeCurrency: {name: 'SUI', symbol: 'SUI', decimals: 9},
    rpcUrl: 'https://fullnode.mainnet.sui.io',
    blockExplorer: 'https://suiscan.xyz',
  },
};
export const SUI_TESTNET = {
  [SUI_TESTNET_CAIP2]: {
    id: SUI_TESTNET_ID,
    caip2: SUI_TESTNET_CAIP2,
    network: 'sui',
    name: 'SUI Testnet',
    nativeCurrency: {name: 'SUI', symbol: 'SUI', decimals: 9},
    rpcUrl: 'https://fullnode.testnet.sui.io',
    blockExplorer: 'https://suiscan.xyz',
  },
};

export const SUI_DEVNET = {
  [SUI_DEVNET_CAIP2]: {
    id: SUI_DEVNET_ID,
    caip2: SUI_DEVNET_CAIP2,
    network: 'sui',
    name: 'SUI Devnet',
    nativeCurrency: {name: 'SUI', symbol: 'SUI', decimals: 9},
    rpcUrl: 'https://fullnode.devnet.sui.io',
    blockExplorer: 'https://suiscan.xyz',
  },
};

export const SUI_NETWORKS_IMAGES = {
  'sui:mainnet': Sui,
  'sui:testnet': Sui,
  'sui:devnet': Sui,
};

const NetworkImages: Record<string, ImageSourcePropType> = {
  ...EIPNetworkImages,
  ...SUI_NETWORKS_IMAGES,
};

export const SUI_CHAINS: Record<string, Chain> = {
  ...SUI_MAINNET,
  ...SUI_TESTNET,
  ...SUI_DEVNET,
};

export const ALL_CHAINS = {
  ...EIP155_CHAINS,
  ...SUI_CHAINS,
};

export const PresetsUtil = {
  getChainLogo: (chainId: string | number) => {
    const logo = NetworkImages[String(chainId)];
    if (!logo) {
      return undefined;
    }
    return logo;
  },
  getChainData: (chainId: string | number) => {
    return ALL_CHAINS[String(chainId)];
  },
};
