const mainnet = {
  id: 1,
  caipId: "eip155:1",
  name: "Ethereum",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  blockTime: 12000,
  rpcUrls: {
    default: {
      http: ["https://eth.merkle.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://etherscan.io",
      apiUrl: "https://api.etherscan.io/api",
    },
  },
  tokens: {
    usdc: {
      address: "0xA0b86a33E6441A8469A53D2b5eE5a6B7bc2c9Beb",
      decimals: 6,
      standard: "ERC20",
      symbol: "USDC",
    },
    usdt: {
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      decimals: 6,
      standard: "ERC20",
      symbol: "USDT",
    },
  },
};

const optimism = {
  id: 10,
  caipId: "eip155:10",
  name: "OP Mainnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.optimism.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "Optimism Explorer",
      url: "https://optimistic.etherscan.io",
      apiUrl: "https://api-optimistic.etherscan.io/api",
    },
  },
  tokens: {
    usdc: {
      address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
      decimals: 6,
      standard: "ERC20",
      symbol: "USDC",
    },
    usdt: {
      address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
      decimals: 6,
      standard: "ERC20",
      symbol: "USDT",
    },
  },
};

const base = {
  id: 8453,
  caipId: "eip155:8453",
  name: "Base",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.base.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "Basescan",
      url: "https://basescan.org",
      apiUrl: "https://api.basescan.org/api",
    },
  },
  tokens: {
    usdc: {
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      decimals: 6,
      standard: "ERC20",
      symbol: "USDC",
    },
  },
};

const arbitrum = {
  id: 42161,
  caipId: "eip155:42161",
  name: "Arbitrum",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://arb1.arbitrum.io/rpc"],
    },
  },
  blockExplorers: {
    default: {
      name: "Arbiscan",
      url: "https://arbiscan.io",
      apiUrl: "https://api.arbiscan.io/api",
    },
  },
  tokens: {
    usdc: {
      address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      decimals: 6,
      standard: "ERC20",
      symbol: "USDC",
    },
    usdt: {
      address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      decimals: 6,
      standard: "ERC20",
      symbol: "USDT",
    },
  },
};

const sepolia = {
  id: 11155111,
  caipId: "eip155:11155111",
  name: "Sepolia",
  nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://sepolia.drpc.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://sepolia.etherscan.io",
      apiUrl: "https://api-sepolia.etherscan.io/api",
    },
  },
  tokens: {
    usdc: {
      address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      decimals: 6,
      standard: "ERC20",
      symbol: "USDC",
    },
  },
};

// const solana = {
//   id: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
//   caipId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
//   name: 'Solana',
//   nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
//   rpcUrls: {
//     default: {
//       http: ['https://rpc.walletconnect.org/v1']
//     }
//   },
//   blockExplorers: { default: { name: 'Solscan', url: 'https://solscan.io' } },
//   tokens: {
//     usdc: {
//       address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
//       decimals: 6,
//       standard: "token",
//       symbol: "USDC",
//     },
//   }
// }

// const solanaDevnet = {
//   id: 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
//   caipId: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
//   name: 'Solana Devnet',
//   nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
//   rpcUrls: {
//     default: { http: ['https://rpc.walletconnect.org/v1'] }
//   },
//   blockExplorers: { default: { name: 'Solscan', url: 'https://solscan.io' } },
//   tokens: {
//     usdc: {
//       address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
//       decimals: 6,
//       standard: "token",
//       symbol: "USDC",
//     },
//   }
// }

export const NETWORKS = {
  base,
  optimism,
  arbitrum,
  mainnet,
  sepolia,
  // solana,
  // solanaDevnet,
} as const;

export type NetworkKey = keyof typeof NETWORKS;
export type TokenKey = keyof (typeof NETWORKS)[NetworkKey]["tokens"];
