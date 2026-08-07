/* global BroadcastChannel, localStorage, MutationObserver */
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

// Maestro (web) test-id bridge.
//
// Maestro web locates elements (`id:` selector) via a "resource-id" it derives
// from each DOM node with this precedence:
//   node.id || aria-label || name || title || htmlFor || data-testid
// react-native-web maps our `testID` to `data-testid` (the LAST fallback), and
// maps `accessibilityLabel` to `aria-label`. So any element that has BOTH a
// testID and an accessibilityLabel (e.g. the pay options, whose a11y label is
// the chain name) resolves to the aria-label, and Maestro's `id: <testID>`
// never matches — even though the element is plainly visible.
//
// Mirroring data-testid -> the DOM `id` (which Maestro checks FIRST) makes every
// `id: <testID>` flow resolve to the testID regardless of any aria-label. We
// only set it when the element has no explicit id of its own, so intentional
// ids are preserved. Web-only; harmless in the browser (RNW styles via classes,
// not ids).
function installMaestroTestIdBridge() {
  const mirror = el => {
    if (!el || !el.getAttribute) {
      return;
    }
    const tid = el.getAttribute('data-testid');
    if (tid && !el.id) {
      el.id = tid;
    }
  };
  const sync = root => {
    if (root && root.getAttribute) {
      mirror(root);
    }
    if (root && root.querySelectorAll) {
      root.querySelectorAll('[data-testid]').forEach(mirror);
    }
  };
  const start = () => {
    sync(document);
    const observer = new MutationObserver(mutations => {
      for (const m of mutations) {
        if (m.type === 'attributes') {
          mirror(m.target);
        }
        if (m.addedNodes) {
          m.addedNodes.forEach(sync);
        }
      }
    });
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['data-testid'],
    });
  };
  if (document.body) {
    start();
  } else {
    document.addEventListener('DOMContentLoaded', start);
  }
}

if (!handlePayIcCallback()) {
  installMaestroTestIdBridge();
  registerRootComponent(App);
}
