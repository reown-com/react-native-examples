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
import {ImageSourcePropType} from 'react-native';

// Helpers
export const EIP155_CHAINS: Record<string, Chain> = {
  '1': {
    id: 1,
    network: 'homestead',
    name: 'Ethereum',
    nativeCurrency: {name: 'Ether', symbol: 'ETH', decimals: 18},
    rpcUrl: 'https://eth.llamarpc.com',
    blockExplorer: 'https://etherscan.io',
  },
  '5': {
    id: 5,
    network: 'goerli',
    name: 'Ethereum Goerli',
    nativeCurrency: {name: 'Goerli Ether', symbol: 'ETH', decimals: 18},
    rpcUrl: 'https://rpc.ankr.com/eth_goerli',
    blockExplorer: 'https://goerli.etherscan.io',
  },
  '42161': {
    id: 42161,
    network: 'arbitrum',
    name: 'Arbitrum One',
    nativeCurrency: {name: 'Ether', symbol: 'ETH', decimals: 18},
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    blockExplorer: 'https://arbiscan.io',
  },
  '43114': {
    id: 43114,
    network: 'avalanche',
    name: 'Avalanche',
    nativeCurrency: {name: 'Avalanche', symbol: 'AVAX', decimals: 18},
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    blockExplorer: 'https://snowtrace.io',
  },
  '43113': {
    id: 43113,
    network: 'avalanche-fuji',
    name: 'Avalanche Fuji',
    nativeCurrency: {name: 'Avalanche', symbol: 'AVAX', decimals: 18},
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    blockExplorer: 'https://testnet.snowtrace.io',
  },
  '56': {
    id: 56,
    network: 'bsc',
    name: 'Binance Smart Chain',
    nativeCurrency: {name: 'BNB', symbol: 'BNB', decimals: 18},
    rpcUrl: 'https://rpc.ankr.com/bsc',
    blockExplorer: 'https://bscscan.com',
  },
  '250': {
    id: 250,
    network: 'fantom',
    name: 'Fantom',
    nativeCurrency: {name: 'Fantom', symbol: 'FTM', decimals: 18},
    rpcUrl: 'https://rpc.ankr.com/fantom',
    blockExplorer: 'https://ftmscan.com',
  },
  '10': {
    id: 10,
    network: 'optimism',
    name: 'Optimism',
    nativeCurrency: {name: 'Ether', symbol: 'ETH', decimals: 18},
    rpcUrl: 'https://mainnet.optimism.io',
    blockExplorer: 'https://optimistic.etherscan.io',
  },
  '11155420': {
    id: 11155420,
    network: 'optimism-sepholia',
    name: 'Optimism Sepholia',
    nativeCurrency: {name: 'Sepolia Ether', symbol: 'ETH', decimals: 18},
    rpcUrl: 'https://sepolia.optimism.io',
    blockExplorer: 'https://optimism-sepolia.blockscout.com',
  },
  '137': {
    id: 137,
    network: 'polygon',
    name: 'Polygon',
    nativeCurrency: {name: 'Matic', symbol: 'MATIC', decimals: 18},
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
  },
  '80001': {
    id: 80001,
    network: 'mumbai',
    name: 'Polygon Mumbai',
    nativeCurrency: {name: 'Matic', symbol: 'MATIC', decimals: 18},
    rpcUrl: 'https://rpc.ankr.com/polygon_mumbai',
    blockExplorer: 'https://mumbai.polygonscan.com',
  },
  '100': {
    id: 100,
    network: 'gnosis',
    name: 'Gnosis',
    nativeCurrency: {name: 'Gnosis', symbol: 'xDai', decimals: 18},
    rpcUrl: 'https://rpc.gnosischain.com',
    blockExplorer: 'https://gnosis.blockscout.com',
  },
  '9001': {
    id: 9001,
    network: 'evmos',
    name: 'Evmos',
    nativeCurrency: {name: 'Evmos', symbol: 'EVMOS', decimals: 18},
    rpcUrl: 'https://eth.bd.evmos.org:8545',
    blockExplorer: 'https://escan.live',
  },
  '324': {
    id: 324,
    network: 'zksync-era',
    name: 'zkSync Era',
    nativeCurrency: {name: 'Ether', symbol: 'ETH', decimals: 18},
    rpcUrl: 'https://mainnet.era.zksync.io',
    blockExplorer: 'https://explorer.zksync.io',
  },
  '314': {
    id: 314,
    network: 'filecoin-mainnet',
    name: 'Filecoin Mainnet',
    nativeCurrency: {name: 'Filecoin', symbol: 'FIL', decimals: 18},
    rpcUrl: 'https://api.node.glif.io/rpc/v1',
    blockExplorer: 'https://filscan.io',
  },
  '4689': {
    id: 4689,
    network: 'iotex',
    name: 'IoTeX',
    nativeCurrency: {name: 'IoTeX', symbol: 'IOTX', decimals: 18},
    rpcUrl: 'https://babel-api.mainnet.iotex.io',
    blockExplorer: 'https://iotexscan.io',
  },
  '1088': {
    id: 1088,
    network: 'andromeda',
    name: 'Metis',
    nativeCurrency: {name: 'Metis', symbol: 'METIS', decimals: 18},
    rpcUrl: 'https://andromeda.metis.io/?owner=1088',
    blockExplorer: 'https://andromeda-explorer.metis.io',
  },
  '1284': {
    id: 1284,
    network: 'moonbeam',
    name: 'Moonbeam',
    nativeCurrency: {name: 'GLMR', symbol: 'GLMR', decimals: 18},
    rpcUrl: 'https://moonbeam.public.blastapi.io',
    blockExplorer: 'https://moonscan.io',
  },
  '1285': {
    id: 1285,
    network: 'moonriver',
    name: 'Moonriver',
    nativeCurrency: {name: 'MOVR', symbol: 'MOVR', decimals: 18},
    rpcUrl: 'https://moonriver.public.blastapi.io',
    blockExplorer: 'https://moonriver.moonscan.io',
  },
  '7777777': {
    id: 7777777,
    network: 'zora',
    name: 'Zora',
    nativeCurrency: {name: 'Ether', symbol: 'ETH', decimals: 18},
    rpcUrl: 'https://rpc.zora.energy',
    blockExplorer: 'https://explorer.zora.energy',
  },
  '42220': {
    id: 42220,
    network: 'celo',
    name: 'Celo',
    nativeCurrency: {name: 'Celo', symbol: 'CELO', decimals: 18},
    rpcUrl: 'https://forno.celo.org',
    blockExplorer: 'https://explorer.celo.org/mainnet',
  },
  '8453': {
    id: 8453,
    network: 'base',
    name: 'Base',
    nativeCurrency: {name: 'Ether', symbol: 'ETH', decimals: 18},
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
  },
  '1313161554': {
    id: 1313161554,
    network: 'aurora',
    name: 'Aurora',
    nativeCurrency: {name: 'Ether', symbol: 'ETH', decimals: 18},
    rpcUrl: 'https://mainnet.aurora.dev',
    blockExplorer: 'https://aurorascan.dev',
  },
};

export const EIPNetworkImages: Record<string, ImageSourcePropType> = {
  '1': Ethereum,
  '5': Ethereum,
  '42161': Arbitrum,
  '43114': Avalanche,
  '43113': Avalanche,
  '56': Binance,
  '250': Fantom,
  '10': Optimism,
  '11155420': Optimism,
  '137': Polygon,
  '80001': Polygon,
  '100': Gnosis,
  '9001': Evmos,
  '324': ZkSync,
  '314': Filecoin,
  '4689': Iotx,
  '1088': Metis,
  '1284': Moonbeam,
  '1285': Moonriver,
  '7777777': Zora,
  '42220': Celo,
  '8453': Base,
  '1313161554': Aurora,
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

export const PresetsUtil = {
  getChainLogo: (chainId: string | number) => {
    const logo = EIPNetworkImages[String(chainId)];
    if (!logo) {
      return undefined;
    }
    return logo;
  },
  getChainData: (chainId: string | number) => {
    return EIP155_CHAINS[String(chainId)];
  },
};
