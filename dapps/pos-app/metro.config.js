const { getSentryExpoConfig } = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "crypto") {
    return context.resolveRequest(
      context,
      "react-native-quick-crypto",
      platform,
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
