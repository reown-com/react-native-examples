import React, {useCallback, useState} from 'react';
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
import {PaySuccessView} from './PaySuccessView';

type PayMessage = {
  type?: 'PAY_SUCCESS' | 'PAY_FAILURE';
  success?: boolean;
  error?: string;
  // Optional success summary shown as the result title.
  message?: string;
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

  // Once the Pay page reports success we swap the WebView for the success
  // result screen (Lottie checkmark), mirroring the wallet sample's Pay flow.
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
  // Only hand wallet deeplinks off to the OS — ignore any other window.open()
  // target so a page can't drive Linking.openURL to arbitrary native schemes
  // (tel:/sms:/intent:...). This mirrors the isWalletDeeplink gate above, which
  // also matches https universal links (they carry the same `uri=wc:` param),
  // so preferUniversalLinks wallets keep working.
  const onOpenWindow = useCallback((event: WebViewOpenWindowEvent) => {
    const {targetUrl} = event.nativeEvent;
    if (!isWalletDeeplink(targetUrl)) {
      return;
    }
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
        setSuccessMessage(message.message ?? '');
      } else if (isFailure) {
        ToastUtils.showErrorToast('Payment failed', message.error);
        navigation.goBack();
      }
    },
    [navigation],
  );

  // A failed main-frame load (network error, DNS failure, unreachable host)
  // otherwise leaves the user stranded on a blank/default error page. Surface
  // it and back out. onHttpError is intentionally not wired: it can fire for
  // sub-resources (e.g. a 404 tracking pixel) and would eject a valid session.
  const onLoadError = useCallback(() => {
    ToastUtils.showErrorToast(
      'Failed to load payment page',
      'Check your connection and try again.',
    );
    navigation.goBack();
  }, [navigation]);

  if (successMessage !== null) {
    return (
      <PaySuccessView
        message={successMessage || undefined}
        onDone={() => navigation.goBack()}
      />
    );
  }

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
      onError={onLoadError}
    />
  );
}

export default PayWebView;

const styles = StyleSheet.create({
  webview: {
    flex: 1,
  },
});
