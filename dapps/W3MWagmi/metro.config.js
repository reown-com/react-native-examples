const {withSentryConfig} = require('@sentry/react-native/metro');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const config = getDefaultConfig(__dirname);

// Prevent ws (Node.js websocket) from being bundled - React Native has native WebSocket
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

module.exports = withSentryConfig(config);