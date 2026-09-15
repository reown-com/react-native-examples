import 'react-native-gesture-handler';
import '@walletconnect/react-native-compat';
import {registerRootComponent} from 'expo';
import crypto, { install } from 'react-native-quick-crypto';
import { pbkdf2 as ethersPbkdf2 } from 'ethers';

install();

// ethers v6 derives the BIP39 seed (PBKDF2-HMAC-SHA512 x2048) with its pure-JS
// @noble/hashes implementation, which blocks the JS thread during EIP155 wallet
// restore on startup. Route it through quick-crypto's native pbkdf2 instead.
// (register() must run before any HDNodeWallet.fromPhrase call.)
ethersPbkdf2.register((password, salt, iterations, keylen, algo) =>
  crypto.pbkdf2Sync(password, salt, iterations, keylen, algo),
);

const polyfillDigest = async (algorithm, data) => {
  const algo = algorithm.replace('-', '').toLowerCase();
  const hash = crypto.createHash(algo);
  hash.update(data);
  return hash.digest();
};

// eslint-disable-next-line no-undef
globalThis.crypto.subtle = {
  digest: polyfillDigest,
};

import App from './src/screens/App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App).
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately.
registerRootComponent(App);
