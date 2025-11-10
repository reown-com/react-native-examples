const { getSentryExpoConfig } = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

// Add resolver to mock react-native-vision-camera for web
config.resolver = {
  ...config.resolver,
  resolveRequest: (context, moduleName, platform) => {
    // Mock react-native-vision-camera for web builds
    if (platform === "web" && moduleName === "react-native-vision-camera") {
      return {
        filePath: require.resolve("./utils/vision-camera-mock.web.js"),
        type: "sourceFile",
      };
    }

    // Use default resolution for other modules
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;
