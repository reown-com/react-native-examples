// Loaded as a Metro polyfill (see metro.config.js -> serializer.getPolyfills),
// so it runs before any application or library module is evaluated.
//
// React Native's `process` shim does not define `version`, but some web3
// transitive dependencies (e.g. @mysten/sui -> bip39 / ed25519-hd-key ->
// hash-base -> readable-stream) call `process.version.slice(0, 5)` at
// module-evaluation time. Without this, that throws "Cannot read property
// 'slice' of undefined" and crashes the app before React mounts.
/* eslint-disable no-undef */
(function () {
  var g = typeof globalThis !== 'undefined' ? globalThis : global;
  if (g.process == null) {
    g.process = {};
  }
  if (g.process.version == null) {
    g.process.version = '';
  }
  if (g.process.browser == null) {
    g.process.browser = false;
  }
})();
