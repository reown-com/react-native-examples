import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {GOODWALLET_COLORS} from './theme';

/**
 * GoodWallet brand mark — drawn in code (no image asset). An emerald rounded-square badge with a
 * checkmark glyph next to the "GoodWallet" wordmark, matching the wallet's own (light) skin.
 */
function GoodWalletLogo() {
  return (
    <View style={styles.root}>
      <View style={styles.badge}>
        <Text style={styles.glyph}>✓</Text>
      </View>
      <Text style={styles.wordmark}>GoodWallet</Text>
    </View>
  );
}

export default GoodWalletLogo;

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: GOODWALLET_COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
  },
  wordmark: {
    color: GOODWALLET_COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
});
