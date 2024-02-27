declare module 'react-native-config' {
  export interface NativeConfig {
    ENV_PROJECT_ID: string;
    ENV_SENTRY_DSN: string;
    ENV_SENTRY_TAG: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
