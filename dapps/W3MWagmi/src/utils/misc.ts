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
    name: 'AppKit + Multichain (debug)',
    description: 'AppKit + Multichain (debug)',
    native: 'w3mwagmisample-debug://',
    universal: 'https://lab.reown.com/rn_appkit_debug',
    sentryTag: 'debug',
  },
  internal: {
    name: 'AppKit + Multichain (internal)',
    description: 'AppKit + Multichain (internal)',
    native: 'w3mwagmisample-internal://',
    universal: 'https://lab.reown.com/rn_appkit_internal',
    sentryTag: 'internal',
  },
  production: {
    name: 'AppKit + Multichain',
    description: 'AppKit + Multichain',
    native: 'w3mwagmisample://',
    universal: 'https://lab.reown.com/rn_appkit',
    sentryTag: 'production',
  },
};

export const getMetadata = () => {
  const env = getEnvironment();
  const config = ENV_CONFIG[env];
  return {
    name: config.name,
    description: config.description,
    url: 'https://reown.com/appkit',
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
