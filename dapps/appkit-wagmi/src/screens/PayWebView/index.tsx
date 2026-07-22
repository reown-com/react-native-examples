import React, {useCallback, useState} from 'react';
import {Linking, StyleSheet} from 'react-native';
import {
  WebView,
  WebViewMessageEvent
} from 'react-native-webview';
import type {ShouldStartLoadRequest} from 'react-native-webview/lib/WebViewTypes';
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
  // result screen (Lottie checkmark).
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
      onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
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
