import 'react-native-gesture-handler';
import '@walletconnect/react-native-compat';
import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';
import crypto, { install } from 'react-native-quick-crypto';

install();

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
AppRegistry.registerComponent(appName, () => App);
