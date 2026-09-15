import React from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
import {Button} from '@reown/appkit-ui-react-native';
import {useAccount} from '@reown/appkit-react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '@/utils/TypesUtil';
import {ToastUtils} from '@/utils/ToastUtils';
import {getMetadata} from '@/utils/misc';

// Adds the webview-embed params the Pay page (buyer-experience) expects:
// - returnUrl: our AppKit deeplink, so the wallet returns to this app after
//   signing (BX maps it to the WC session's metadata.redirect).
// - preferUniversalLinks: opens wallets via universal links
//   (AppKit experimental_preferUniversalLinks).
// Returns null for anything that isn't a valid https URL — plaintext clipboard
// content, or non-https schemes (javascript:/file:/http:) that would either
// fail to load or leak the payment session over an insecure transport.
function buildPayUrl(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:') {
      return null;
    }
    parsed.searchParams.set('returnUrl', getMetadata().redirect.native);
    parsed.searchParams.set('preferUniversalLinks', '1');
    return parsed.toString();
  } catch {
    return null;
  }
}

export function PasteUrlButton() {
  const {isConnected} = useAccount();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const onPress = async () => {
    try {
      const url = (await Clipboard.getString())?.trim();
      if (!url) {
        ToastUtils.showErrorToast(
          'No URL in clipboard',
          'Copy a payment URL, then try again.',
        );
        return;
      }
      const payUrl = buildPayUrl(url);
      if (!payUrl) {
        ToastUtils.showErrorToast(
          'Invalid payment URL',
          'Copy a valid https:// payment URL, then try again.',
        );
        return;
      }
      navigation.navigate('PayWebView', {url: payUrl});
    } catch {
      ToastUtils.showErrorToast(
        "Couldn't read clipboard",
        'Check app permissions, then try again.',
      );
    }
  };

  if (isConnected) {
    return null;
  }

  return (
    <Button testID="paste-payment-url-button" onPress={onPress}>
      Paste payment URL
    </Button>
  );
}
