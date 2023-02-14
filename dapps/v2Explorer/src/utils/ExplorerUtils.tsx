import {Alert, Linking} from 'react-native';

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
  //   console.log('testtwo: ', testtwo);

  //Then fallback on Native Link
  //const testtwo = formatNativeUrl(appLink, wcURI);

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
