const {getDefaultConfig} = require('@react-native/metro-config');
const { withSentryConfig } = require("@sentry/react-native/metro");

const config = getDefaultConfig(__dirname);
module.exports = withSentryConfig(config);
