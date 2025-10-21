
const mainnet = {
  id: 1,
  name: 'Ethereum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  blockTime: 12000,
  rpcUrls: {
    default: {
      http: ['https://eth.merkle.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://etherscan.io',
      apiUrl: 'https://api.etherscan.io/api',
    },
  }
}

const optimism = {
  id: 10,
  name: 'OP Mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.optimism.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Optimism Explorer',
      url: 'https://optimistic.etherscan.io',
      apiUrl: 'https://api-optimistic.etherscan.io/api',
    },
  },
}

const base = {
  id: 8453,
  name: 'Base',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.base.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Basescan',
      url: 'https://basescan.org',
      apiUrl: 'https://api.basescan.org/api',
    },
  }
}

export const NETWORKS = {
  ethereum: {
    id: "eip155:1",
    name: "Ethereum",
    displayName: "Ethereum",
    network: mainnet,
    usdcAddress: "0xA0b86a33E6441A8469A53D2b5eE5a6B7bc2c9Beb", // USDC on Ethereum
  },
  base: {
    id: "eip155:8453",
    name: "Base",
    displayName: "Base",
    network: base,
    usdcAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
  },
  optimism: {
    id: "eip155:10",
    name: "Optimism",
    displayName: "Optimism",
    network: optimism,
    usdcAddress: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", // USDC on Optimism
  },
} as const;

export type NetworkKey = keyof typeof NETWORKS;