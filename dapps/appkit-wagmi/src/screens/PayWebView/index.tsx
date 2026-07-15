import React, {useCallback} from 'react';
import {Linking, StyleSheet} from 'react-native';
import {
  WebView,
  WebViewMessageEvent,
  WebViewNavigation,
} from 'react-native-webview';
import type {
  ShouldStartLoadRequest,
  WebViewOpenWindowEvent,
} from 'react-native-webview/lib/WebViewTypes';
import {RootStackScreenProps} from '@/utils/TypesUtil';
import {ToastUtils} from '@/utils/ToastUtils';

// The hosted Pay page reports the flow outcome by calling
// `window.ReactNativeWebView.postMessage(JSON.stringify({ type, ... }))`,
// mirroring the IC_COMPLETE / IC_ERROR contract in the wallet sample's
// CollectDataWebView. Names confirmed against the buyer-experience PR
// (PAY_SUCCESS / PAY_FAILURE). Raw payload is logged for reference.
type PayMessage = {
  type?: string;
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

  // Open wallet deeplinks with the COMPLETE url (including the `pay=` param).
  // Everything else loads in the WebView unchanged.
  const onShouldStartLoadWithRequest = useCallback(
    (request: ShouldStartLoadRequest): boolean => {
      console.log('[PayWebView] should start load:', request.url);
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
    console.log('[PayWebView] open window:', targetUrl);
    Linking.openURL(targetUrl).catch(() => {
      ToastUtils.showErrorToast(
        "Couldn't open wallet",
        'The wallet app may not be installed.',
      );
    });
  }, []);

  const onNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    console.log('[PayWebView] url changed:', navState.url);
  }, []);

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      const raw = event.nativeEvent.data;
      console.log('[PayWebView] message:', raw);

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
      onNavigationStateChange={onNavigationStateChange}
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
