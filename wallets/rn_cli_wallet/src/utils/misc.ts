import DeviceInfo from 'react-native-device-info';

type Environment = 'debug' | 'internal' | 'production';

export function getEnvironment(): Environment {
  const bundleId = DeviceInfo.getBundleId();
  if (bundleId.endsWith('.debug')) return 'debug';
  if (bundleId.endsWith('.internal')) return 'internal';
  return 'production';
}

const ENV_CONFIG = {
  debug: {
    native: 'rn-web3wallet-debug://',
    universal: 'https://lab.reown.com/rn_walletkit_debug',
    sentryTag: 'debug',
  },
  internal: {
    native: 'rn-web3wallet-internal://',
    universal: 'https://lab.reown.com/rn_walletkit_internal',
    sentryTag: 'internal',
  },
  production: {
    native: 'rn-web3wallet://',
    universal: 'https://lab.reown.com/rn_walletkit',
    sentryTag: 'production',
  },
};

export const getMetadata = () => {
  const env = getEnvironment();
  const config = ENV_CONFIG[env];
  return {
    name: 'React Native Wallet Example',
    description: 'React Native WalletKit by Reown',
    url: 'https://reown.com/walletkit',
    icons: ['https://avatars.githubusercontent.com/u/179229932'],
    redirect: {
      native: config.native,
      universal: config.universal,
      linkMode: true,
    },
  };
};

export const SENTRY_TAG = ENV_CONFIG[getEnvironment()].sentryTag;

export function getEnvironmentLabel(): string {
  const env = getEnvironment();
  return env.charAt(0).toUpperCase() + env.slice(1);
}
