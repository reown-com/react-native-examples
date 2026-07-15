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
function buildPayUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    parsed.searchParams.set('returnUrl', getMetadata().redirect.native);
    parsed.searchParams.set('preferUniversalLinks', '1');
    return parsed.toString();
  } catch {
    return rawUrl;
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
      navigation.navigate('PayWebView', {url: buildPayUrl(url)});
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
