import {Alert, Linking} from 'react-native';

// @ts-expect-error - `@env` is a virtualised module via Babel config.
import {ENV_PROJECT_ID} from '@env';

function formatNativeUrl(appUrl: string, wcUri: string): string {
  let safeAppUrl = appUrl;
  if (!safeAppUrl.includes('://')) {
    safeAppUrl = appUrl.replaceAll('/', '').replaceAll(':', '');
    safeAppUrl = `${safeAppUrl}://`;
  }
  const encodedWcUrl = encodeURIComponent(wcUri);
  console.log(`${safeAppUrl}wc?uri=${encodedWcUrl}`);
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
  // console.log('incoming universal', universalLink);
  // console.log('incoming deepLink', deepLink);

  if (universalLink && universalLink !== '') {
    tempDeepLink = formatUniversalUrl(universalLink, wcURI);
  } else {
    tempDeepLink = formatNativeUrl(deepLink, wcURI);
  }

  // if (
  //   appLink &&
  //   appLink === '' &&
  //   !appLink.includes('https://') &&
  //   !appLink.includes('http://')
  // ) {
  //   tempDeepLink = formatNativeUrl(appLink, wcURI);
  // } else {
  //   tempDeepLink = formatUniversalUrl(appLink, wcURI);
  // }

  try {
    // Note: Could not use .canOpenURL() to check if the app is installed
    // Due to having to add it to the iOS info
    await Linking.openURL(tempDeepLink);
  } catch (error) {
    Alert.alert(`Unable to open this DeepLink: ${tempDeepLink}`);
  }
};

export const fetchInitialWallets = async (
  setIsLoading: () => void,
  setExplorerData: () => void,
) => {
  fetch(
    `https://explorer-api.walletconnect.com/v3/wallets?projectId=${ENV_PROJECT_ID}&sdks=sign_v2&entries=7&page=1`,
  )
    .then(res => res.json())
    .then(
      wallet => {
        const tempRes = [];
        Object.keys(wallet?.listings).forEach(function (key) {
          tempRes.push(wallet?.listings[key]);
        });
        setIsLoading(true);
        setExplorerData(tempRes);
        setIsLoading(false);
      },
      error => {
        setIsLoading(false);
        console.log('error', error);
      },
    );
};

export const fetchViewAllWallets = async (
  setIsLoading: () => void,
  setViewAllExplorerData: () => void,
) => {
  fetch(
    `https://explorer-api.walletconnect.com/v3/wallets?projectId=${ENV_PROJECT_ID}&sdks=sign_v2`,
  )
    .then(res => res.json())
    .then(
      wallet => {
        const tempRes = [];
        Object.keys(wallet?.listings).forEach(function (key) {
          tempRes.push(wallet?.listings[key]);
        });
        setIsLoading(false);
        setViewAllExplorerData(tempRes);
        setIsLoading(true);
      },
      error => {
        setIsLoading(false);
        console.log('error', error);
      },
    );
};
