/* global BroadcastChannel, localStorage */
// Web entry point. The browser already provides crypto (globalThis.crypto with
// subtle + getRandomValues), so we skip react-native-quick-crypto (native JSI)
// and @walletconnect/react-native-compat (native polyfills). The global Buffer
// and process shims are set up in polyfills.js (a Metro polyfill that runs first).
import './web-polyfills';
import 'react-native-gesture-handler';
import {registerRootComponent} from 'expo';

import App from './src/screens/App';

// Pay identity-collection (IC) callback relay. The IC form is opened in a new
// tab (see CollectDataWebView.web.tsx) with callbackUrl = our origin +
// ?pay_ic_callback=1. On completion the form redirects that tab back here.
//
// We CANNOT use window.opener.postMessage: pay.walletconnect.com sets a
// Cross-Origin-Opener-Policy that severs window.opener once the tab visits it.
// Instead we relay the result to the original wallet tab via BroadcastChannel
// (with a localStorage fallback) — both same-origin and unaffected by COOP —
// then close this tab without booting the app.
function handlePayIcCallback() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (!params.get('pay_ic_callback')) {
      return false;
    }
    const result = {
      source: 'pay-ic-callback',
      status: params.get('status'),
      paymentId: params.get('paymentId'),
      code: params.get('code'),
      message: params.get('message'),
    };
    try {
      const channel = new BroadcastChannel('pay-ic-callback');
      channel.postMessage(result);
      channel.close();
    } catch {}
    try {
      // Fallback for browsers without BroadcastChannel: storage event.
      localStorage.setItem(
        'pay_ic_callback_result',
        JSON.stringify({ ...result, t: Date.now() }),
      );
    } catch {}
    window.close();
    // If the browser blocked window.close(), show a hint instead of the app.
    if (document.body) {
      document.body.innerHTML =
        '<p style="font-family:sans-serif;padding:24px">Verification received — you can close this tab.</p>';
    }
    return true;
  } catch {
    return false;
  }
}

if (!handlePayIcCallback()) {
  registerRootComponent(App);
}
