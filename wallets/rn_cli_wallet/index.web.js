// Web entry point. The browser already provides crypto (globalThis.crypto with
// subtle + getRandomValues), so we skip react-native-quick-crypto (native JSI)
// and @walletconnect/react-native-compat (native polyfills). The global Buffer
// and process shims are set up in polyfills.js (a Metro polyfill that runs first).
import './web-polyfills';
import 'react-native-gesture-handler';
import {registerRootComponent} from 'expo';

import App from './src/screens/App';

registerRootComponent(App);
