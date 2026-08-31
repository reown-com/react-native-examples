import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { ArrowUpRight, Loader2, X } from '@/components/ui/icons';
import { colors, fonts, radius } from '@/constants/theme';
import { useDepositStore } from '@/stores/use-deposit-store';

/**
 * Web checkout surface. The hosted BX checkout (pay.walletconnect.com) forbids
 * iframing, so on Continue it is opened in a new tab and this panel shows a
 * "waiting for payment" state while the store polls the payment status. The user
 * can re-open the tab if they closed it.
 */
export function CheckoutSurface({ layout }: { layout: 'desktop' | 'mobile' }) {
  const { amount, error, reopenCheckout, closeDeposit } = useDepositStore();
  const isMobile = layout === 'mobile';

  const spin = useSharedValue(0);
  useEffect(() => {
    spin.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(spin);
  }, [spin]);
  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value * 360}deg` }] }));

  return (
    <View style={isMobile ? styles.mobilePad : styles.desktopPad}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Pay with crypto</Text>
          <Text style={styles.subtitle}>${parseFloat(amount || '0').toFixed(2)} · WalletConnect Pay</Text>
        </View>
        <Pressable onPress={closeDeposit} style={styles.closeBtn}>
          <X size={16} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>WC</Text>
        </View>

        <Text style={styles.heading}>Complete your payment</Text>
        <Text style={styles.desc}>
          Finish the deposit in the WalletConnect Pay tab that just opened. This window updates
          automatically once it’s confirmed.
        </Text>

        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <View style={styles.waiting}>
            <Animated.View style={spinStyle}>
              <Loader2 size={14} color={colors.accent} />
            </Animated.View>
            <Text style={styles.waitingText}>Waiting for payment</Text>
          </View>
        )}

        <Pressable onPress={reopenCheckout} style={styles.reopen}>
          <Text style={styles.reopenText}>Open checkout again</Text>
          <ArrowUpRight size={16} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  desktopPad: { padding: 28 },
  mobilePad: { paddingHorizontal: 24, paddingBottom: 32, paddingTop: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
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
  body: { alignItems: 'center', paddingVertical: 28 },
  badge: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  badgeText: { color: '#fff', fontFamily: fonts.bold, fontSize: 20 },
  heading: { fontFamily: fonts.serif, fontSize: 24, color: colors.text, marginBottom: 8, textAlign: 'center' },
  desc: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textDim,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 19,
  },
  waiting: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  waitingText: { fontFamily: fonts.mono, fontSize: 11, color: colors.text },
  error: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.danger,
    marginTop: 24,
    textAlign: 'center',
  },
  reopen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 28,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reopenText: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
});
