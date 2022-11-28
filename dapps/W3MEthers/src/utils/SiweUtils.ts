/* eslint-disable @typescript-eslint/no-unused-vars */

import type {
  SIWEVerifyMessageArgs,
  SIWECreateMessageArgs,
} from '@reown/appkit-siwe-react-native';
import {generateRandomBytes32} from '@walletconnect/utils';
import {createSIWEConfig, formatMessage} from '@reown/appkit-siwe-react-native';
import {mainnet, polygon} from './ChainUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOGGED_IN_KEY = '@w3mwagmi/logged_in';
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
    // The backend session should store the associated address and chainId
    // and return it via the `getSession` method.

    const logged = await AsyncStorage.getItem(LOGGED_IN_KEY);
    if (logged === 'true') {
      return {
        address: '0x',
        chainId: 1,
      };
    }
    return null;
  },

  verifyMessage: async ({
    message,
    signature,
    cacao,
  }: SIWEVerifyMessageArgs): Promise<boolean> => {
    // This function ensures the message is valid,
    // has not been tampered with, and has been appropriately
    // signed by the wallet address.

    // Call your sign-in backend function here and save the session
    // api.signIn({ message, signature, cacao });

    await AsyncStorage.setItem(LOGGED_IN_KEY, 'true');

    return true;
  },
  signOut: async (): Promise<boolean> => {
    // The users session must be destroyed when calling `signOut`.
    await AsyncStorage.removeItem(LOGGED_IN_KEY);

    return true;
  },
});
