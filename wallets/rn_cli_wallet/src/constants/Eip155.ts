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
import { Chain } from '@/utils/TypesUtil';
import { ImageSourcePropType } from 'react-native';


// Helpers
export const EIP155_CHAINS: Record<string, Chain> = {
  'eip155:1': {
    chainId: '1',
    namespace: 'eip155',
    name: 'Ethereum',
    rpcUrl: 'https://eth.llamarpc.com',
  },
  'eip155:5': {
    chainId: '5',
    namespace: 'eip155',
    name: 'Ethereum Goerli',
    rpcUrl: 'https://rpc.ankr.com/eth_goerli',
  },
  'eip155:42161': {
    chainId: '42161',
    namespace: 'eip155',
    name: 'Arbitrum One',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
  },
  'eip155:43114': {
    chainId: '43114',
    namespace: 'eip155',
    name: 'Avalanche',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
  },
  'eip155:43113': {
    chainId: '43113',
    namespace: 'eip155',
    name: 'Avalanche Fuji',
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
  },
  'eip155:56': {
    chainId: '56',
    namespace: 'eip155',
    name: 'Binance Smart Chain',
    rpcUrl: 'https://rpc.ankr.com/bsc',
  },
  'eip155:250': {
    chainId: '250',
    namespace: 'eip155',
    name: 'Fantom',
    rpcUrl: 'https://rpc.ankr.com/fantom',
  },
  'eip155:10': {
    chainId: '10',
    namespace: 'eip155',
    name: 'Optimism',
    rpcUrl: 'https://mainnet.optimism.io',
  },
  'eip155:11155420': {
    chainId: '11155420',
    namespace: 'eip155',
    name: 'Optimism Sepholia',
    rpcUrl: 'https://sepolia.optimism.io',
  },
  'eip155:137': {
    chainId: '137',
    namespace: 'eip155',
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
  },
  'eip155:80001': {
    chainId: '80001',
    namespace: 'eip155',
    name: 'Polygon Mumbai',
    rpcUrl: 'https://rpc.ankr.com/polygon_mumbai',
  },
  'eip155:100': {
    chainId: '100',
    namespace: 'eip155',
    name: 'Gnosis',
    rpcUrl: 'https://rpc.gnosischain.com',
  },
  'eip155:9001': {
    chainId: '9001',
    namespace: 'eip155',
    name: 'Evmos',
    rpcUrl: 'https://eth.bd.evmos.org:8545',
  },
  'eip155:324': {
    chainId: '324',
    namespace: 'eip155',
    name: 'zkSync Era',
    rpcUrl: 'https://mainnet.era.zksync.io',
  },
  'eip155:314': {
    chainId: '314',
    namespace: 'eip155',
    name: 'Filecoin Mainnet',
    rpcUrl: 'https://api.node.glif.io/rpc/v1',
  },
  'eip155:4689': {
    chainId: '4689',
    namespace: 'eip155',
    name: 'IoTeX',
    rpcUrl: 'https://babel-api.mainnet.iotex.io',
  },
  'eip155:1088': {
    chainId: '1088',
    namespace: 'eip155',
    name: 'Metis',
    rpcUrl: 'https://andromeda.metis.io/?owner=1088',
  },
  'eip155:1284': {
    chainId: '1284',
    namespace: 'eip155',
    name: 'Moonbeam',
    rpcUrl: 'https://moonbeam.public.blastapi.io',
  },
  'eip155:1285': {
    chainId: '1285',
    namespace: 'eip155',
    name: 'Moonriver',
    rpcUrl: 'https://moonriver.public.blastapi.io',
  },
  'eip155:7777777': {
    chainId: '7777777',
    namespace: 'eip155',
    name: 'Zora',
    rpcUrl: 'https://rpc.zora.energy',
  },
  'eip155:42220': {
    chainId: '42220',
    namespace: 'eip155',
    name: 'Celo',
    rpcUrl: 'https://forno.celo.org',
  },
  'eip155:8453': {
    chainId: '8453',
    namespace: 'eip155',
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
  },
  'eip155:1313161554': {
    chainId: '1313161554',
    namespace: 'eip155',
    name: 'Aurora',
    rpcUrl: 'https://mainnet.aurora.dev',
  },
};

export const EIP155_NETWORK_IMAGES: Record<string, ImageSourcePropType> = {
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