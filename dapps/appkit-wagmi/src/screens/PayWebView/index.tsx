import React, {useCallback} from 'react';
import {Linking, StyleSheet} from 'react-native';
import {
  WebView,
  WebViewMessageEvent
} from 'react-native-webview';
import type {
  ShouldStartLoadRequest,
  WebViewOpenWindowEvent,
} from 'react-native-webview/lib/WebViewTypes';
import {RootStackScreenProps} from '@/utils/TypesUtil';
import {ToastUtils} from '@/utils/ToastUtils';

type PayMessage = {
  type?: 'PAY_SUCCESS' | 'PAY_FAILURE';
  success?: boolean;
  error?: string;
};

// A wallet-connect deeplink carries the WC pairing URI in its `uri` query param.
function isWalletDeeplink(url: string): boolean {
  try {
    const wcUri = new URL(url).searchParams.get('uri');
    return !!wcUri && wcUri.startsWith('wc:');
  } catch {
    return false;
  }
}

function PayWebView({route, navigation}: RootStackScreenProps<'PayWebView'>) {
  const {url} = route.params;

  const onShouldStartLoadWithRequest = useCallback(
    (request: ShouldStartLoadRequest): boolean => {
      if (isWalletDeeplink(request.url)) {
        Linking.openURL(request.url).catch(() => {
          ToastUtils.showErrorToast(
            "Couldn't open wallet",
            'The wallet app may not be installed.',
          );
        });
        return false;
      }
      return true;
    },
    [],
  );

  // Some pages open the wallet via window.open() (a new window) rather than a
  // same-frame navigation, which routes here instead of onShouldStartLoadWithRequest.
  const onOpenWindow = useCallback((event: WebViewOpenWindowEvent) => {
    const {targetUrl} = event.nativeEvent;
    Linking.openURL(targetUrl).catch(() => {
      ToastUtils.showErrorToast(
        "Couldn't open wallet",
        'The wallet app may not be installed.',
      );
    });
  }, []);

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      const raw = event.nativeEvent.data;

      let message: PayMessage;
      try {
        message = JSON.parse(raw);
      } catch {
        // Non-JSON message — ignore.
        return;
      }

      const isSuccess =
        message.type === 'PAY_SUCCESS' || message.success === true;
      const isFailure =
        message.type === 'PAY_FAILURE' || message.success === false;

      if (isSuccess) {
        ToastUtils.showSuccessToast('Payment successful');
        navigation.goBack();
      } else if (isFailure) {
        ToastUtils.showErrorToast('Payment failed', message.error);
        navigation.goBack();
      }
    },
    [navigation],
  );

  return (
    <WebView
      source={{uri: url}}
      style={styles.webview}
      startInLoadingState
      javaScriptEnabled
      domStorageEnabled
      setSupportMultipleWindows
      onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
      onOpenWindow={onOpenWindow}
      onMessage={onMessage}
    />
  );
}

export default PayWebView;

const styles = StyleSheet.create({
  webview: {
    flex: 1,
  },
});
