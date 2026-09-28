import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Building2, ChevronRight, Wallet, X } from '@/components/ui/icons';
import { colors, fonts, radius } from '@/constants/theme';
import { useDepositStore } from '@/stores/use-deposit-store';

const PRESETS = ['0.01', '0.10', '1', '2', '5'];

/**
 * Step 1 — amount entry. Method tabs (Wallet / Bank), a large amount input with
 * quick-pick chips, and the Continue CTA. Continue is enabled only for the
 * Wallet method with amount > 0; Bank is disabled ("Coming soon"), per the spec.
 */
export function DepositAmountStep({ layout }: { layout: 'desktop' | 'mobile' }) {
  const { amount, setAmount, method, setMethod, continueToCheckout, closeDeposit, isCreating, error } =
    useDepositStore();

  const valid = method === 'wallet' && parseFloat(amount) > 0 && !isCreating;
  const isMobile = layout === 'mobile';

  return (
    <View style={isMobile ? styles.mobilePad : styles.desktopPad}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Deposit</Text>
          <Text style={styles.subtitle}>Add funds to your account</Text>
        </View>
        <Pressable onPress={closeDeposit} style={styles.closeBtn}>
          <X size={16} color={colors.text} />
        </Pressable>
      </View>

      <Text style={styles.label}>Method</Text>
      <View style={styles.methods}>
        <Pressable
          onPress={() => setMethod('wallet')}
          style={[
            styles.method,
            {
              backgroundColor: method === 'wallet' ? colors.accentSoft : colors.surface2,
              borderColor: method === 'wallet' ? colors.accent : colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.methodIcon,
              { backgroundColor: method === 'wallet' ? colors.accent : colors.surface3 },
            ]}
          >
            <Wallet size={16} color={method === 'wallet' ? '#fff' : colors.textDim} />
          </View>
          <View>
            <Text style={styles.methodName}>Wallet</Text>
            <Text style={styles.methodHint}>Instant</Text>
          </View>
        </Pressable>

        <View style={[styles.method, styles.methodDisabled]}>
          <View style={[styles.methodIcon, { backgroundColor: colors.surface3 }]}>
            <Building2 size={16} color={colors.textDim} />
          </View>
          <View>
            <Text style={styles.methodName}>Bank</Text>
            <Text style={styles.methodHint}>Coming soon</Text>
          </View>
        </View>
      </View>

      <View style={styles.amountWrap}>
        <Text style={[styles.label, styles.amountLabel]}>Amount</Text>
        <View style={styles.amountInputRow}>
          <Text style={styles.dollar}>$</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0"
            placeholderTextColor={colors.textDimmer}
            keyboardType="decimal-pad"
            inputMode="decimal"
            autoFocus
            style={styles.amountInput}
          />
        </View>
        <View style={styles.presets}>
          {PRESETS.map((v) => (
            <Pressable key={v} onPress={() => setAmount(v)} style={styles.preset}>
              <Text style={styles.presetText}>${v}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        onPress={continueToCheckout}
        disabled={!valid}
        style={[
          styles.cta,
          {
            backgroundColor: valid ? colors.text : colors.surface3,
          },
        ]}
      >
        {isCreating ? (
          <ActivityIndicator size="small" color={colors.textDimmer} />
        ) : (
          <>
            <Text style={[styles.ctaText, { color: valid ? colors.surface : colors.textDimmer }]}>
              Continue
            </Text>
            <ChevronRight size={16} color={valid ? colors.surface : colors.textDimmer} />
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  desktopPad: { padding: 28 },
  mobilePad: { paddingHorizontal: 24, paddingBottom: 32, paddingTop: 8 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
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
  label: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.textDimmer,
    marginBottom: 12,
  },
  methods: { flexDirection: 'row', gap: 8, marginBottom: 28 },
  method: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  methodDisabled: { opacity: 0.6, backgroundColor: colors.surface2, borderColor: colors.border },
  methodIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodName: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  methodHint: { fontFamily: fonts.regular, fontSize: 10, color: colors.textDimmer },
  amountWrap: { alignItems: 'center', marginBottom: 24 },
  amountLabel: { textAlign: 'center' },
  amountInputRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: 4 },
  dollar: { fontFamily: fonts.serif, fontSize: 32, color: colors.textDim },
  amountInput: {
    fontFamily: fonts.serif,
    fontSize: 64,
    letterSpacing: -1.3,
    color: colors.text,
    textAlign: 'center',
    minWidth: 120,
    padding: 0,
  },
  presets: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 16 },
  preset: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetText: { fontFamily: fonts.mono, fontSize: 11, color: colors.textDim },
  error: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 12,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius['2xl'],
    minHeight: 48,
  },
  ctaText: { fontFamily: fonts.medium, fontSize: 14 },
});
