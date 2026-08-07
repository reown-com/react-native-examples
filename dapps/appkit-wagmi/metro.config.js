const path = require('path');
const {getSentryExpoConfig} = require('@sentry/react-native/metro');

const config = getSentryExpoConfig(__dirname);

// Web-only module redirects (react-native-mmkv has no web support -> localStorage shim).
const WEB_MODULE_ALIASES = {
  'react-native-mmkv': path.resolve(__dirname, 'src/shims/mmkv.web.ts'),
};

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

    if (platform === 'web' && WEB_MODULE_ALIASES[moduleName]) {
      return context.resolveRequest(
        context,
        WEB_MODULE_ALIASES[moduleName],
        platform,
      );
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
