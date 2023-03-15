import {Alert, Linking} from 'react-native';

// @ts-expect-error - `@env` is a virtualised module via Babel config.
import {ENV_PROJECT_ID} from '@env';
import {WalletInfo} from '../types/api';
import {isAndroid} from '../constants/Platform';
import InstalledAppModule from '../modules/InstalledAppModule';

function getUrlParams(url: string): {[key: string]: string} {
  const regex = /[?&]([^=#]+)=([^&#]*)/g;
  const params: {[key: string]: string} = {};
  let match: RegExpExecArray | null;

  while ((match = regex.exec(url)) !== null) {
    params[match[1]] = decodeURIComponent(match[2]);
  }

  return params;
}

export async function isAppInstalled(wallet: WalletInfo): Promise<boolean> {
  if (isAndroid) {
    const appUrl = wallet?.app?.android;
    if (appUrl) {
      // TODO: Change this when explorer-api returns the package name
      const packageName = getUrlParams(appUrl).id;
      return packageName
        ? await InstalledAppModule.isAppInstalled(packageName)
        : false;
    }
    return false;
  } else {
    return false;
  }
}

function formatNativeUrl(appUrl: string, wcUri: string): string {
  let safeAppUrl = appUrl;
  if (!safeAppUrl.includes('://')) {
    safeAppUrl = appUrl.replaceAll('/', '').replaceAll(':', '');
    safeAppUrl = `${safeAppUrl}://`;
  }
  const encodedWcUrl = encodeURIComponent(wcUri);
  return `${safeAppUrl}wc?uri=${encodedWcUrl}`;
}

function formatUniversalUrl(appUrl: string, wcUri: string): string {
  let plainAppUrl = appUrl;
  if (appUrl.endsWith('/')) {
    plainAppUrl = appUrl.slice(0, -1);
  }
  const encodedWcUrl = encodeURIComponent(wcUri);

  return `${plainAppUrl}/wc?uri=${encodedWcUrl}`;
}

export const navigateDeepLink = async (
  universalLink: string,
  deepLink: string,
  wcURI: string,
) => {
  let tempDeepLink;

  if (universalLink && universalLink !== '') {
    tempDeepLink = formatUniversalUrl(universalLink, wcURI);
  } else {
    tempDeepLink = formatNativeUrl(deepLink, wcURI);
  }

  try {
    // Note: Could not use .canOpenURL() to check if the app is installed
    // Due to having to add it to the iOS info

    await Linking.openURL(tempDeepLink);
  } catch (error) {
    Alert.alert(`Unable to open this DeepLink: ${tempDeepLink}`);
  }
};

const setInstalledFlag = async (
  wallets: WalletInfo[],
): Promise<WalletInfo[]> => {
  const promises = wallets.map(async wallet => {
    const isInstalled = await isAppInstalled(wallet);
    return {...wallet, isInstalled};
  });
  return Promise.all(promises);
};

export const fetchAllWallets = () => {
  return fetch(
    `https://explorer-api.walletconnect.com/v3/wallets?projectId=${ENV_PROJECT_ID}&sdks=sign_v2`,
  )
    .then(res => res.json())
    .then(
      wallet => {
        const result: WalletInfo[] = Object.keys(wallet?.listings).map(
          key => wallet?.listings[key],
        );
        return result;
      },
      () => {
        Alert.alert('Error', 'Error fetching all wallets');
      },
    )
    .then(async (wallets: WalletInfo[] | void) => {
      if (wallets) {
        return (await setInstalledFlag(wallets)).sort((a, b) => {
          if (a.isInstalled && !b.isInstalled) {
            return -1;
          } else if (!a.isInstalled && b.isInstalled) {
            return 1;
          } else {
            return 0;
          }
        });
      }
    });
};
