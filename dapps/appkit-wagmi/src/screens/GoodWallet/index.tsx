import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {RootStackScreenProps} from '@/utils/TypesUtil';
import OmenStore from '@/stores/OmenStore';

import GoodWalletLogo from './GoodWalletLogo';
import {GOODWALLET_COLORS as C} from './theme';
import {TOKENS, Token, usdValue} from './tokens';

type Phase = 'select' | 'sending' | 'success';

function fmtToken(n: number): string {
  return n.toLocaleString('en-US', {maximumFractionDigits: 6});
}

function fmtUsd(n: number): string {
  return `$${n.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

function shortAddr(addr?: string): string {
  if (!addr) {
    return '';
  }
  return addr.length > 12 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}

function mockTxHash(): string {
  return `0x${Date.now().toString(16).padStart(64, '0')}`;
}

/**
 * GoodWallet — a mock wallet's native "deposit intent" screen. Reached when the BX deposit page
 * hands off via `gooddeposit://` (intercepted in OmenDepositWebView) and presented as a full-screen
 * modal so it reads as a separate wallet. Lists the tokens you hold, lets you pick one + set the
 * amount, shows the destination + requesting app, and on Confirm "sends" and returns to Omen with
 * the balance credited. All mocked — no real tx.
 */
function GoodDepositConfirm({route, navigation}: RootStackScreenProps<'GoodDepositConfirm'>) {
  const {to, app, amount: amountParam, network, token} = route.params;
  const appName = app || 'the app';

  // Preselect the token the host pre-picked (still changeable), else the first holding.
  const preselected = TOKENS.find(t => t.symbol === token) ?? TOKENS[0];
  const [selected, setSelected] = useState<Token>(preselected);
  const [amountStr, setAmountStr] = useState(
    amountParam && amountParam > 0 ? String(amountParam) : '',
  );
  const [phase, setPhase] = useState<Phase>('select');

  const amount = Number.parseFloat(amountStr) || 0;
  const isValid = amount > 0 && amount <= selected.balance;
  const credited = useMemo(() => usdValue(selected, amount), [selected, amount]);

  function handleConfirm() {
    if (!isValid) {
      return;
    }
    setPhase('sending');
    // Mock the on-chain send: brief pending, then credit Omen and bounce back to it.
    setTimeout(() => {
      OmenStore.credit({amount: credited, source: 'wallet', txHash: mockTxHash()});
      setPhase('success');
      setTimeout(() => navigation.popToTop(), 1500);
    }, 1200);
  }

  if (phase !== 'select') {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.centered}>
          {phase === 'sending' ? (
            <>
              <ActivityIndicator size="large" color={C.accent} />
              <Text style={styles.centerTitle}>Sending…</Text>
              <Text style={styles.centerSub}>
                {fmtToken(amount)} {selected.symbol} to {appName}
              </Text>
            </>
          ) : (
            <>
              <View style={styles.successBadge}>
                <Text style={styles.successGlyph}>✓</Text>
              </View>
              <Text style={styles.centerTitle}>{fmtUsd(credited)} sent</Text>
              <Text style={styles.centerSub}>Returning to {appName}…</Text>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <GoodWalletLogo />
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={hitSlop}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.requestCard}>
          <Text style={styles.requestLabel}>Deposit request</Text>
          <Text style={styles.requestApp}>{appName}</Text>
          {network ? <Text style={styles.requestAddr}>Network · {network}</Text> : null}
          {to ? <Text style={styles.requestAddr}>To {shortAddr(to)}</Text> : null}
        </View>

        <Text style={styles.sectionLabel}>Pay with</Text>
        <View style={styles.tokenList}>
          {TOKENS.map(tok => {
            const isSel = tok.symbol === selected.symbol;
            return (
              <TouchableOpacity
                key={tok.symbol}
                activeOpacity={0.7}
                onPress={() => setSelected(tok)}
                style={[styles.tokenRow, isSel && styles.tokenRowSelected]}>
                <View style={[styles.tokenBadge, {backgroundColor: tok.color}]}>
                  <Text style={styles.tokenBadgeText}>{tok.symbol.slice(0, 1)}</Text>
                </View>
                <View style={styles.tokenText}>
                  <Text style={styles.tokenName}>{tok.name}</Text>
                  <Text style={styles.tokenBal}>
                    {fmtToken(tok.balance)} {tok.symbol}
                  </Text>
                </View>
                <View style={[styles.radio, isSel && styles.radioSelected]}>
                  {isSel ? <View style={styles.radioDot} /> : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Amount</Text>
        <View style={styles.amountRow}>
          <TextInput
            value={amountStr}
            onChangeText={t => setAmountStr(t.replace(/[^0-9.]/g, ''))}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={C.textMuted}
            style={styles.amountInput}
          />
          <Text style={styles.amountSymbol}>{selected.symbol}</Text>
          <TouchableOpacity
            onPress={() => setAmountStr(String(selected.balance))}
            style={styles.maxBtn}>
            <Text style={styles.maxText}>Max</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.amountHint}>
          {amount > 0 ? `≈ ${fmtUsd(credited)}` : `Balance ${fmtToken(selected.balance)} ${selected.symbol}`}
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={!isValid}
          onPress={handleConfirm}
          style={[styles.confirm, !isValid && styles.confirmDisabled]}>
          <Text style={styles.confirmText}>Confirm deposit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default GoodDepositConfirm;

const hitSlop = {top: 10, bottom: 10, left: 10, right: 10};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
    backgroundColor: C.surface,
  },
  cancel: {
    color: C.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
  content: {
    padding: 20,
    gap: 10,
  },
  requestCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    gap: 2,
    marginBottom: 8,
  },
  requestLabel: {
    color: C.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  requestApp: {
    color: C.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  requestAddr: {
    color: C.textSecondary,
    fontSize: 13,
  },
  sectionLabel: {
    color: C.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
  },
  tokenList: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
  tokenRowSelected: {
    backgroundColor: C.accentTint,
  },
  tokenBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenBadgeText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  tokenText: {
    flex: 1,
  },
  tokenName: {
    color: C.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  tokenBal: {
    color: C.textSecondary,
    fontSize: 13,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: C.accent,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.accent,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  amountInput: {
    flex: 1,
    color: C.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    padding: 0,
  },
  amountSymbol: {
    color: C.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  maxBtn: {
    backgroundColor: C.accentTint,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  maxText: {
    color: C.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  amountHint: {
    color: C.textMuted,
    fontSize: 13,
    paddingLeft: 4,
  },
  footer: {
    padding: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.border,
    backgroundColor: C.surface,
  },
  confirm: {
    backgroundColor: C.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmDisabled: {
    backgroundColor: C.textMuted,
    opacity: 0.5,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  centerTitle: {
    color: C.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 8,
  },
  centerSub: {
    color: C.textSecondary,
    fontSize: 15,
    textAlign: 'center',
  },
  successBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successGlyph: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '800',
    lineHeight: 46,
  },
});
