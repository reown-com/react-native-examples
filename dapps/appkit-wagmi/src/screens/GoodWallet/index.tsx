import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {RootStackScreenProps} from '@/utils/TypesUtil';
import OmenStore from '@/stores/OmenStore';

import GoodWalletLogo from './GoodWalletLogo';
import {GOODWALLET_COLORS as C} from './theme';
import {
  WALLET_NETWORKS,
  WalletNetwork,
  WalletToken,
  networkImageUrl,
  usdValue,
} from './tokens';

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

/** A network logo from the WC assets CDN, with a neutral fallback if it fails to load. */
function NetworkImage({caip2, size}: {caip2: string; size: number}) {
  const [ok, setOk] = useState(true);
  const style = {width: size, height: size, borderRadius: size / 2};
  if (!ok) {
    return <View style={[style, {backgroundColor: C.surfaceAlt}]} />;
  }
  return (
    <Image
      source={{uri: networkImageUrl(caip2)}}
      style={style}
      onError={() => setOk(false)}
    />
  );
}

/**
 * GoodWallet — a mock wallet's native "deposit intent" screen. Reached when the BX deposit page
 * hands off `DEPOSIT_OPEN_WALLET` (via OmenDepositWebView) and presented as a full-screen modal so
 * it reads as a separate wallet. Pick a network → a token you hold → an amount, see the destination
 * + requesting app, Confirm; the tx is mocked, credits Omen, and returns. Network/token arrive
 * pre-selected from BX but stay changeable.
 */
function GoodDepositConfirm({route, navigation}: RootStackScreenProps<'GoodDepositConfirm'>) {
  const insets = useSafeAreaInsets();
  const {to, app, amount: amountParam, network, token} = route.params;
  const appName = app || 'the app';

  const initialNetwork =
    WALLET_NETWORKS.find(n => n.name === network) ?? WALLET_NETWORKS[0];
  const initialToken =
    initialNetwork.tokens.find(t => t.symbol === token) ?? initialNetwork.tokens[0];

  const [selectedNetwork, setSelectedNetwork] = useState<WalletNetwork>(initialNetwork);
  const [selectedToken, setSelectedToken] = useState<WalletToken>(initialToken);
  const [amountStr, setAmountStr] = useState(
    amountParam && amountParam > 0 ? String(amountParam) : '',
  );
  const [phase, setPhase] = useState<Phase>('select');

  const amount = Number.parseFloat(amountStr) || 0;
  const isValid = amount > 0 && amount <= selectedToken.balance;
  const credited = useMemo(() => usdValue(selectedToken, amount), [selectedToken, amount]);

  function pickNetwork(n: WalletNetwork) {
    setSelectedNetwork(n);
    // Keep the token symbol if the new network holds it, else its first holding.
    setSelectedToken(n.tokens.find(t => t.symbol === selectedToken.symbol) ?? n.tokens[0]);
    setAmountStr('');
  }

  function handleConfirm() {
    if (!isValid) {
      return;
    }
    setPhase('sending');
    setTimeout(() => {
      OmenStore.credit({amount: credited, source: 'wallet', txHash: mockTxHash()});
      setPhase('success');
      setTimeout(() => navigation.popToTop(), 1500);
    }, 1200);
  }

  if (phase !== 'select') {
    return (
      <View style={[styles.root, styles.centered]}>
        {phase === 'sending' ? (
          <>
            <ActivityIndicator size="large" color={C.accent} />
            <Text style={styles.centerTitle}>Sending…</Text>
            <Text style={styles.centerSub}>
              {fmtToken(amount)} {selectedToken.symbol} on {selectedNetwork.name}
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
    );
  }

  return (
    <View style={styles.root}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <GoodWalletLogo />
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          style={({pressed}) => [styles.closeBtn, pressed && styles.closeBtnPressed]}>
          <Text style={styles.closeGlyph}>✕</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, {paddingBottom: insets.bottom + 100}]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.requestCard}>
          <View style={styles.appAvatar}>
            <Text style={styles.appAvatarText}>{appName.slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={styles.requestText}>
            <Text style={styles.requestLabel}>Deposit to</Text>
            <Text style={styles.requestApp}>{appName}</Text>
            {to ? <Text style={styles.requestAddr}>{shortAddr(to)}</Text> : null}
          </View>
        </View>

        <Text style={styles.sectionLabel}>Network</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}>
          {WALLET_NETWORKS.map(n => {
            const isSel = n.name === selectedNetwork.name;
            return (
              <TouchableOpacity
                key={n.name}
                activeOpacity={0.7}
                onPress={() => pickNetwork(n)}
                style={[styles.chip, isSel && styles.chipSelected]}>
                <NetworkImage caip2={n.caip2} size={18} />
                <Text style={[styles.chipText, isSel && styles.chipTextSelected]}>{n.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionLabel}>Asset</Text>
        <View style={styles.tokenList}>
          {selectedNetwork.tokens.map((tok, i) => {
            const isSel = tok.symbol === selectedToken.symbol;
            return (
              <TouchableOpacity
                key={tok.symbol}
                activeOpacity={0.7}
                onPress={() => {
                  setSelectedToken(tok);
                  setAmountStr('');
                }}
                style={[
                  styles.tokenRow,
                  i > 0 && styles.tokenRowDivider,
                  isSel && styles.tokenRowSelected,
                ]}>
                <View style={[styles.tokenBadge, {backgroundColor: tok.color}]}>
                  <Text style={styles.tokenBadgeText}>{tok.symbol.slice(0, 1)}</Text>
                </View>
                <View style={styles.tokenText}>
                  <Text style={styles.tokenName}>{tok.name}</Text>
                  <Text style={styles.tokenSub}>
                    {fmtToken(tok.balance)} {tok.symbol}
                  </Text>
                </View>
                <View style={styles.tokenRight}>
                  <Text style={styles.tokenUsd}>{fmtUsd(tok.balance * tok.priceUsd)}</Text>
                  <View style={[styles.radio, isSel && styles.radioSelected]}>
                    {isSel ? <View style={styles.radioDot} /> : null}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Amount</Text>
        <View style={styles.amountCard}>
          <View style={styles.amountRow}>
            <TextInput
              value={amountStr}
              onChangeText={t => setAmountStr(t.replace(/[^0-9.]/g, ''))}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={C.textMuted}
              style={styles.amountInput}
            />
            <Text style={styles.amountSymbol}>{selectedToken.symbol}</Text>
            <TouchableOpacity
              onPress={() => setAmountStr(String(selectedToken.balance))}
              style={styles.maxBtn}>
              <Text style={styles.maxText}>Max</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.amountHint}>
            {amount > 0
              ? `≈ ${fmtUsd(credited)}`
              : `Balance ${fmtToken(selectedToken.balance)} ${selectedToken.symbol}`}
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, {paddingBottom: insets.bottom + 12}]}>
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={!isValid}
          onPress={handleConfirm}
          style={[styles.confirm, !isValid && styles.confirmDisabled]}>
          <Text style={styles.confirmText}>
            {amount > 0 ? `Deposit ${fmtUsd(credited)}` : 'Enter an amount'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default GoodDepositConfirm;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: C.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnPressed: {
    opacity: 0.6,
  },
  closeGlyph: {
    color: C.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 18,
  },
  content: {
    padding: 16,
    gap: 8,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 6,
  },
  appAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  requestText: {
    flex: 1,
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
    fontSize: 18,
    fontWeight: '700',
  },
  requestAddr: {
    color: C.textSecondary,
    fontSize: 13,
    marginTop: 1,
  },
  sectionLabel: {
    color: C.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 2,
  },
  chipRow: {
    gap: 8,
    paddingVertical: 2,
    paddingRight: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
  },
  chipSelected: {
    borderColor: C.accent,
    backgroundColor: C.accentTint,
  },
  chipText: {
    color: C.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: C.textPrimary,
  },
  tokenList: {
    backgroundColor: C.surface,
    borderRadius: 18,
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
  },
  tokenRowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.border,
  },
  tokenRowSelected: {
    backgroundColor: C.accentTint,
  },
  tokenBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenBadgeText: {
    color: '#FFFFFF',
    fontSize: 16,
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
  tokenSub: {
    color: C.textSecondary,
    fontSize: 13,
  },
  tokenRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tokenUsd: {
    color: C.textSecondary,
    fontSize: 13,
    fontWeight: '600',
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
  amountCard: {
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  amountInput: {
    flex: 1,
    color: C.textPrimary,
    fontSize: 30,
    fontWeight: '700',
    padding: 0,
  },
  amountSymbol: {
    color: C.textSecondary,
    fontSize: 16,
    fontWeight: '700',
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
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.border,
    backgroundColor: C.surface,
  },
  confirm: {
    backgroundColor: C.accent,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
  },
  confirmDisabled: {
    backgroundColor: C.textMuted,
    opacity: 0.4,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  centered: {
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
