declare module '*.png';
declare module '*.webp';

declare module 'react-native-config' {
  export interface NativeConfig {
    ENV_PROJECT_ID: string;
    ENV_SENTRY_DSN: string;
    ENV_TON_CENTER_API_KEY: string;
    ENV_BLOCKCHAIN_API_URL: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
