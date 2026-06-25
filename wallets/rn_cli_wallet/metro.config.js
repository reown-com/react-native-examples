const { getSentryExpoConfig } = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

// Prevent ws (Node.js websocket) from being bundled - React Native has native WebSocket.
// The web3 stack (e.g. @solana/web3.js via rpc-websockets) pulls in Node's `ws`,
// which crashes at startup ("runtime not ready") in React Native.
config.resolver = {
  ...config.resolver,
  resolveRequest: (context, moduleName, platform) => {
    // Return empty module for ws - React Native uses native WebSocket
    if (moduleName === 'ws' || moduleName.startsWith('ws/')) {
      return {
        type: 'empty',
      };
    }

    return context.resolveRequest(context, moduleName, platform);
  },
};

// Inject ./polyfills.js before any app/library module runs (defines
// process.version, which some web3 deps read at module-eval time). Using
// getPolyfills (rather than a top-level import) guarantees it runs first,
// independent of Metro's inlineRequires/import ordering.
const originalGetPolyfills = config.serializer.getPolyfills;
config.serializer.getPolyfills = options => [
  ...(originalGetPolyfills ? originalGetPolyfills(options) : []),
  require.resolve('./polyfills.js'),
];

module.exports = config;
