import {type AppKitNetwork} from '@reown/appkit-react-native';

export const mainnet: AppKitNetwork = {
  id: 1,
  name: 'Ethereum',
  nativeCurrency: {name: 'Ether', symbol: 'ETH', decimals: 18},
  rpcUrls: {
    default: {http: ['https://eth.llamarpc.com']},
  },
  blockExplorers: {
    default: {name: 'Etherscan', url: 'https://etherscan.io'},
  },
  chainNamespace: 'eip155',
  caipNetworkId: 'eip155:1',
};

export const polygon: AppKitNetwork = {
  id: 137,
  name: 'Polygon',
  nativeCurrency: {name: 'POL', symbol: 'POL', decimals: 18},
  rpcUrls: {
    default: {http: ['https://polygon-rpc.com']},
  },
  blockExplorers: {
    default: {name: 'PolygonScan', url: 'https://polygonscan.com'},
  },
  chainNamespace: 'eip155',
  caipNetworkId: 'eip155:137',
};

export const solanaDevnet: AppKitNetwork = {
  id: 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
  name: 'Solana Devnet',
  chainNamespace: 'solana',
  caipNetworkId: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
  nativeCurrency: {name: 'Solana', symbol: 'SOL', decimals: 9},
  rpcUrls: {
    default: {http: ['https://rpc.walletconnect.org/v1']},
  },
  blockExplorers: {
    default: {name: 'Solscan', url: 'https://solscan.io'},
  },
  testnet: true,
};
