/**
 * @format
 */
/* global document, MutationObserver */

// Web entry point. The browser already provides crypto (globalThis.crypto with
// subtle + getRandomValues), so we skip @walletconnect/react-native-compat
// (native polyfills). The global Buffer and process shims are set up in
// web-polyfills.js, imported first before any web3 module evaluates.
import './web-polyfills';
import './web-fetch-patch';
import 'react-native-gesture-handler';
import {registerRootComponent} from 'expo';

import App from './src/App';

// Maestro (web) test-id bridge.
//
// Maestro web locates elements (`id:` selector) via a "resource-id" it derives
// from each DOM node with this precedence:
//   node.id || aria-label || name || title || htmlFor || data-testid
// react-native-web maps our `testID` to `data-testid` (the LAST fallback) and
// `accessibilityLabel` to `aria-label`, so any element with BOTH resolves to the
// aria-label and Maestro's `id: <testID>` never matches. Mirroring data-testid
// -> the DOM `id` (which Maestro checks FIRST) makes `id: <testID>` flows resolve
// regardless of any aria-label. We only set it when the element has no explicit
// id of its own, so intentional ids are preserved. Web-only; harmless in the
// browser (RNW styles via classes, not ids).
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

installMaestroTestIdBridge();
registerRootComponent(App);
