import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { Loader2, X } from '@/components/ui/icons';
import { colors, fonts, radius } from '@/constants/theme';
import { useDepositStore } from '@/stores/use-deposit-store';

/**
 * Native checkout surface. X-Frame-Options only restricts browser iframes, so on
 * iOS/Android the hosted BX checkout can be embedded in a WebView. Wallet
 * deeplinks (non-http schemes) are handed off to the OS; the store polls payment
 * status and advances to `complete` when it succeeds.
 */
export function CheckoutSurface(_props: { layout: 'desktop' | 'mobile' }) {
  const { amount, gatewayUrl, error, closeDeposit } = useDepositStore();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Pay with crypto</Text>
          <Text style={styles.subtitle}>${parseFloat(amount || '0').toFixed(2)} · WalletConnect Pay</Text>
        </View>
        <Pressable onPress={closeDeposit} style={styles.closeBtn}>
          <X size={16} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.statusBar}>
        <Loader2 size={13} color={colors.accent} />
        <Text style={styles.statusText}>{error ?? 'Waiting for payment'}</Text>
      </View>

      <View style={styles.webWrap}>
        {gatewayUrl ? (
          <WebView
            source={{ uri: gatewayUrl }}
            style={styles.web}
            // Hand wallet deeplinks (wc:, metamask:, etc.) to the OS.
            onShouldStartLoadWithRequest={(req) => {
              if (/^https?:/.test(req.url)) return true;
              Linking.openURL(req.url).catch(() => {});
              return false;
            }}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: '100%' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 12,
    paddingTop: 4,
  },
  title: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  subtitle: { fontFamily: fonts.mono, fontSize: 11, color: colors.textDim, marginTop: 2 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface3,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: colors.surface2,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  statusText: { fontFamily: fonts.mono, fontSize: 11, color: colors.text },
  webWrap: { flex: 1, minHeight: 480, backgroundColor: colors.surface },
  web: { flex: 1, backgroundColor: colors.surface },
});
