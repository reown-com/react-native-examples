declare module '*.png';
declare module '*.webp';
declare module '*.jpeg';

declare module 'react-native-config' {
  export interface NativeConfig {
    ENV_PROJECT_ID: string;
    ENV_PAY_API_KEY: string;
    ENV_SENTRY_DSN: string;
    ENV_TON_CENTER_API_KEY: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
