declare module 'react-native-config' {
  export interface NativeConfig {
    ENV_PROJECT_ID: string;
    ENV_SENTRY_DSN: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
