import {Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Constants from 'expo-constants';

type Environment = 'debug' | 'internal' | 'production';

export function getEnvironment(): Environment {
  // No native bundle id on web (device-info is native-only); treat as production.
  if (Platform.OS === 'web') {
    return 'production';
  }
  try {
    const bundleId = DeviceInfo.getBundleId();
    if (!bundleId || typeof bundleId !== 'string') {
      console.warn('Invalid bundle ID detected:', bundleId);
      return 'production';
    }
    if (bundleId.endsWith('.debug')) return 'debug';
    if (bundleId.endsWith('.internal')) return 'internal';
    return 'production';
  } catch (error) {
    console.warn('Failed to detect environment from bundle ID, defaulting to production', error);
    return 'production';
  }
}

const ENV_CONFIG = {
  debug: {
    name: 'AppKit + Multichain (debug)',
    description: 'AppKit + Multichain (debug)',
    native: 'w3mwagmisample-debug://',
    universal: 'https://lab.reown.com/rn_appkit_debug',
  },
  internal: {
    name: 'AppKit + Multichain (internal)',
    description: 'AppKit + Multichain (internal)',
    native: 'w3mwagmisample-internal://',
    universal: 'https://lab.reown.com/rn_appkit_internal',
  },
  production: {
    name: 'AppKit + Multichain',
    description: 'AppKit + Multichain',
    native: 'w3mwagmisample://',
    universal: 'https://lab.reown.com/rn_appkit',
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

export function getEnvironmentLabel(): string {
  const env = getEnvironment();
  return env.charAt(0).toUpperCase() + env.slice(1);
}

// "<version> (<build>) - <Environment>". On web, react-native-device-info's
// getVersion/getBuildNumber return "unknown", so read the version from the Expo
// config and use "web" for the build (matching pos-app).
export function getAppVersionLabel(): string {
  const label = getEnvironmentLabel();
  if (Platform.OS === 'web') {
    const version = Constants.expoConfig?.version ?? 'unknown';
    return `${version} (web) - ${label}`;
  }
  return `${DeviceInfo.getVersion()} (${DeviceInfo.getBuildNumber()}) - ${label}`;
}
