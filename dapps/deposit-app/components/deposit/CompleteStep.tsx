import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { Check } from '@/components/ui/icons';
import { colors, fonts, radius } from '@/constants/theme';
import { useDepositStore } from '@/stores/use-deposit-store';

/**
 * Step 4 — success. Pops a success check, counts the deposited amount up from
 * zero, shows a mocked confirmed transaction row, and a Done CTA that closes the
 * flow. Balance + activity were already updated by the store before this step.
 */
export function CompleteStep({ layout }: { layout: 'desktop' | 'mobile' }) {
  const { amount, paymentId, closeDeposit } = useDepositStore();
  const target = parseFloat(amount) || 0;
  const [shown, setShown] = useState(0);
  const isMobile = layout === 'mobile';
  const shortId =
    paymentId && paymentId.length > 14
      ? `${paymentId.slice(0, 8)}…${paymentId.slice(-4)}`
      : paymentId;

  useEffect(() => {
    let frame: number;
    const start = Date.now();
    const dur = 900;
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(target * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return (
    <View style={isMobile ? styles.mobilePad : styles.desktopPad}>
      <View style={styles.body}>
        <Animated.View entering={ZoomIn.duration(500)} style={styles.check}>
          <Check size={36} color="#fff" strokeWidth={3} />
        </Animated.View>

        <Text style={styles.label}>Deposit complete</Text>
        <Text style={styles.amount}>+${shown.toFixed(2)}</Text>
        <Text style={styles.via}>via WalletConnect Pay</Text>

        <Animated.View entering={FadeIn.delay(200)} style={styles.txCard}>
          <Text style={styles.txLabel}>Payment ID</Text>
          <View style={styles.txRow}>
            <Text style={styles.txHash}>{shortId ?? '—'}</Text>
            <View style={styles.txStatus}>
              <Check size={10} color={colors.success} />
              <Text style={styles.txStatusText}>Confirmed</Text>
            </View>
          </View>
        </Animated.View>

        <Pressable onPress={closeDeposit} style={styles.cta}>
          <Text style={styles.ctaText}>Done</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  desktopPad: { padding: 40 },
  mobilePad: { paddingHorizontal: 24, paddingBottom: 32, paddingTop: 16 },
  body: { alignItems: 'center', paddingVertical: 24 },
  check: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.textDimmer,
    marginBottom: 12,
  },
  amount: { fontFamily: fonts.serif, fontSize: 56, letterSpacing: -1.1, color: colors.text, marginBottom: 8 },
  via: { fontFamily: fonts.mono, fontSize: 11, color: colors.textDim },
  txCard: {
    width: '100%',
    marginTop: 40,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: radius['2xl'],
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  txLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.textDimmer,
    marginBottom: 8,
  },
  txRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  txHash: { fontFamily: fonts.mono, fontSize: 11, color: colors.textDim },
  txStatus: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  txStatusText: { fontFamily: fonts.mono, fontSize: 10, color: colors.success },
  cta: {
    width: '100%',
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: radius['2xl'],
    backgroundColor: colors.text,
    alignItems: 'center',
  },
  ctaText: { fontFamily: fonts.medium, fontSize: 14, color: colors.surface },
});
