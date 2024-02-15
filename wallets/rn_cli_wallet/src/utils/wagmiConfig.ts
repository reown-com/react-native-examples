import {
  createWeb3Modal,
  defaultWagmiConfig,
  Web3Modal,
} from '@web3modal/wagmi-react-native';
import {mainnet, sepolia} from 'viem/chains';
import {createConfig, http} from 'wagmi';
import {walletConnect} from 'wagmi/connectors';

// import {WalletConnectConnector} from 'wagmi/connectors/walletConnect';
// import {ENV_PROJECT_ID} from '@env';
// import {InjectedConnector} from 'wagmi/connectors/injected';

// import { walletConnect } from 'wagmi/connectors'

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    walletConnect({
      projectId: '3fcc6bba6f1de962d911bb5b5c3dba68',
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

// const metadata = {
//   name: 'RN Wallet',
//   description: 'RN Wallet sample app',
//   url: 'https://walletconnect.com',
//   icons: ['https://avatars.githubusercontent.com/u/37784886'],
// };

// const {chains, publicClient} = configureChains([mainnet], [publicProvider()]);

// export const wagmiConfig = createConfig({
//   autoConnect: true,
//   publicClient,
//   connectors: [
//     new WalletConnectConnector({
//       chains,
//       options: {projectId: ENV_PROJECT_ID, showQrModal: false, metadata},
//     }),
//     new InjectedConnector({chains, options: {shimDisconnect: true}}),
//   ],
// });

// export const wagmiConfig = createConfig({
//   chains: [mainnet],
//   connectors: [
//     walletConnect ({
//       projectId: '3fcc6bba6f1de962d911bb5b5c3dba68',
//     }),
//   ],
//   transports: {
//     [mainnet.id]: http(),
//     [sepolia.id]: http(),
//   },
// })
