/**
 * @format
 */

import './polyfills';
import {AppRegistry} from 'react-native';
import App from './src/screens/App';
import {name as appName} from './app.json';

import crypto from 'react-native-quick-crypto';

const polyfillDigest = async (algorithm, data) => {
  const algo = algorithm.replace('-', '').toLowerCase();
  const hash = crypto.createHash(algo);
  hash.update(data);
  return hash.digest();
};

globalThis.crypto = crypto;
globalThis.crypto.subtle = {
  digest: polyfillDigest,
};

AppRegistry.registerComponent(appName, () => App);
