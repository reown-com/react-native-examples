import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {OMEN_COLORS} from './theme';

/**
 * Omen brand mark — drawn entirely in code (no image asset) so the demo stays self-contained.
 * A circular accent badge with a crescent glyph next to the "Omen" wordmark, mirroring the web
 * host (apps/deposit-demo). Kept tiny and presentational.
 */
function OmenLogo() {
  return (
    <View style={styles.root}>
      <View style={styles.badge}>
        <Text style={styles.glyph}>◑</Text>
      </View>
      <Text style={styles.wordmark}>Omen</Text>
    </View>
  );
}

export default OmenLogo;

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: OMEN_COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    color: OMEN_COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 18,
  },
  wordmark: {
    color: OMEN_COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
});
