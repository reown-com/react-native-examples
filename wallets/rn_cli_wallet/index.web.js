// Web entry point. The browser already provides crypto (globalThis.crypto with
// subtle + getRandomValues), so we skip react-native-quick-crypto (native JSI)
// and @walletconnect/react-native-compat (native polyfills). The global Buffer
// and process shims are set up in polyfills.js (a Metro polyfill that runs first).
import './web-polyfills';
import 'react-native-gesture-handler';
import {registerRootComponent} from 'expo';

import App from './src/screens/App';

// Pay identity-collection (IC) callback relay. The IC form is opened in a popup
// (see CollectDataWebView.web.tsx) with callbackUrl = our origin + ?pay_ic_callback=1.
// On completion the form redirects this popup here; relay the result to the
// opener (the wallet tab) and close, without booting the full app in the popup.
function handlePayIcCallback() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('pay_ic_callback') && window.opener) {
      window.opener.postMessage(
        {
          source: 'pay-ic-callback',
          status: params.get('status'),
          paymentId: params.get('paymentId'),
          code: params.get('code'),
          message: params.get('message'),
        },
        window.location.origin,
      );
      window.close();
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

if (!handlePayIcCallback()) {
  registerRootComponent(App);
}
