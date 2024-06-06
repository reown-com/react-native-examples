import type {
  SIWEVerifyMessageArgs,
  SIWECreateMessageArgs,
} from '@web3modal/siwe-react-native';
import {generateRandomBytes32} from '@walletconnect/utils';
import {createSIWEConfig, formatMessage} from '@web3modal/siwe-react-native';
import {mainnet, polygon} from './ChainUtils';

const chains = [mainnet, polygon];

export const siweConfig = createSIWEConfig({
  signOutOnAccountChange: false,
  signOutOnNetworkChange: false,
  // We don't require any async action to populate params but other apps might

  getMessageParams: async () => ({
    domain: 'rn-w3m-ethers-sample://',
    uri: 'rn-w3m-ethers-sample://',
    chains: chains.map(chain => chain.chainId),
    statement: 'Please sign with your account',
    iat: new Date().toISOString(),
  }),
  createMessage: ({address, ...args}: SIWECreateMessageArgs) =>
    formatMessage(args, address),
  getNonce: async () => {
    // This should point to your SIWE backend

    const nonce = generateRandomBytes32();

    return nonce;
  },
  getSession: async () => {
    // This should point to your SIWE backend

    return Promise.resolve({
      address: '0x',
      chainId: 1,
    });
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  verifyMessage: async ({message, signature, cacao}: SIWEVerifyMessageArgs) => {
    // This should point to your SIWE backend

    return true;
  },
  signOut: async () => {
    // This should point to your SIWE backend
    try {
      return await Promise.resolve(true);
    } catch (error) {
      return false;
    }
  },
});
