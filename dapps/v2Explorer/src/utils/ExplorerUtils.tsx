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

export const navigateDeepLink = async (appLink: string, wcURI: string) => {
  // If Universal Link provided
  if (appLink == null) {
    const tempCoolWallet = formatNativeUrl('coolwallet:', wcURI);
    await Linking.openURL(tempCoolWallet);
    return;
  }
  const testtwo = formatUniversalUrl(appLink, wcURI);

  await Linking.openURL(testtwo);
  //   const supported = await Linking.canOpenURL(testtwo);

  //   if (supported) {
  //     // Opening the link with some app, if the URL scheme is "http" the web link should be opened
  //     // by some browser in the mobile
  //     await Linking.openURL(testtwo);
  //   } else {
  //     Alert.alert(`Don't know how to open this URL: ${testtwo}`);
  //   }
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
        // setError(error);
      },
    );
};
