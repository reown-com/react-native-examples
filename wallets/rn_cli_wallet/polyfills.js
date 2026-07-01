// Metro polyfill (metro.config.js serializer.getPolyfills): runs before the
// module system exists, so use plain global assignments only — no require()/
// import (require() here crashes the release/Hermes bundle with "Property
// 'require' doesn't exist"; dev masks it via a global require).
//
// Defines process.version for web3 deps that read it at module-eval time
// (e.g. readable-stream's process.version.slice(0,5)). Buffer is NOT set here
// (needs require); it comes from react-native-compat (native) / web-polyfills (web).
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
