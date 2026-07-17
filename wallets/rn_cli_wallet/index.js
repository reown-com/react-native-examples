import 'react-native-gesture-handler';
import '@walletconnect/react-native-compat';
import {registerRootComponent} from 'expo';
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

// registerRootComponent calls AppRegistry.registerComponent('main', () => App).
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately.
registerRootComponent(App);
