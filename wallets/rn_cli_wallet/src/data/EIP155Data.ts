/**
 * @desc Reference list of eip155 chains
 * @url https://chainlist.org
 */

/**
 * Types
 */
export type TEIP155Chain = keyof typeof EIP155_CHAINS;

/**
 * Chains
 */
export const EIP155_MAINNET_CHAINS = {
  'eip155:1': {
    chainId: 1,
    name: 'Ethereum',
    logo: 'https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/256/Ethereum-ETH-icon.png',
    rgb: '99, 125, 234',
    rpc: 'https://cloudflare-eth.com/',
    namespace: 'eip155',
  },
  'eip155:43114': {
    chainId: 43114,
    name: 'Avalanche C-Chain',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTNV-5XMqK9hruFN1qe3gQ82UeRhd_feshesWQw-coqFNsm666Wavk_uoPyKG2_fVpc9M&usqp=CAU',
    rgb: '232, 65, 66',
    rpc: 'https://api.avax.network/ext/bc/C/rpc',
    namespace: 'eip155',
  },
  'eip155:137': {
    chainId: 137,
    name: 'Polygon',
    logo: 'https://cryptojobslist.com/_next/image?url=https%3A%2F%2Fstorage.googleapis.com%2Fjob-listing-logos%2F4cc8fd0d-1912-4e0f-b59d-40b0c412f1a2.jpg&w=256&q=75',
    rgb: '130, 71, 229',
    rpc: 'https://polygon-rpc.com/',
    namespace: 'eip155',
  },
  'eip155:10': {
    chainId: 10,
    name: 'Optimism',
    logo: 'https://d23exngyjlavgo.cloudfront.net/0xa_0x4200000000000000000000000000000000000042',
    rgb: '235, 0, 25',
    rpc: 'https://mainnet.optimism.io',
    namespace: 'eip155',
  },
};

export const EIP155_TEST_CHAINS = {
  'eip155:5': {
    chainId: 5,
    name: 'Ethereum Goerli',
    logo: 'https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/256/Ethereum-ETH-icon.png',
    rgb: '99, 125, 234',
    rpc: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    namespace: 'eip155',
  },
  'eip155:43113': {
    chainId: 43113,
    name: 'Avalanche Fuji',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTNV-5XMqK9hruFN1qe3gQ82UeRhd_feshesWQw-coqFNsm666Wavk_uoPyKG2_fVpc9M&usqp=CAU',
    rgb: '232, 65, 66',
    rpc: 'https://api.avax-test.network/ext/bc/C/rpc',
    namespace: 'eip155',
  },
  'eip155:80001': {
    chainId: 80001,
    name: 'Polygon Mumbai',
    logo: 'https://cryptojobslist.com/_next/image?url=https%3A%2F%2Fstorage.googleapis.com%2Fjob-listing-logos%2F4cc8fd0d-1912-4e0f-b59d-40b0c412f1a2.jpg&w=256&q=75',
    rgb: '130, 71, 229',
    rpc: 'https://matic-mumbai.chainstacklabs.com',
    namespace: 'eip155',
  },
  'eip155:420': {
    chainId: 420,
    name: 'Optimism Goerli',
    logo: 'https://d23exngyjlavgo.cloudfront.net/0xa_0x4200000000000000000000000000000000000042',
    rgb: '235, 0, 25',
    rpc: 'https://goerli.optimism.io',
    namespace: 'eip155',
  },
};

export const EIP155_CHAINS = {...EIP155_MAINNET_CHAINS, ...EIP155_TEST_CHAINS};

/**
 * Methods
 */
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
