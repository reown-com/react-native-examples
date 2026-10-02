// Imported first in index.web.js (before App), so it runs before any web3
// module evaluates. The native build gets these from
// @walletconnect/react-native-compat + the Metro getPolyfills shim, but on web
// we set them here:
//   - process.version: some deps (hash-base -> readable-stream) call
//     `process.version.slice(0, 5)` at module load.
//   - Buffer: required by the web3 stack (@solana/web3.js, viem); browsers
//     don't provide it.
/* global globalThis */
const g = globalThis;
if (g.process == null) {
  g.process = {};
}
if (g.process.version == null) {
  g.process.version = '';
}
// We are in a browser: force `true`, overriding the `false` that the Metro
// polyfill (polyfills.js, which runs on all platforms) already set. Some web3
// deps (readable-stream, stream-browserify) branch on `process.browser`.
g.process.browser = true;
if (g.Buffer == null) {
  g.Buffer = require('buffer').Buffer;
}
