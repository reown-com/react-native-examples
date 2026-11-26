import React from 'react';
import {Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSnapshot} from 'valtio';

import {RootStackParamList} from '@/utils/TypesUtil';
import OmenStore from '@/stores/OmenStore';

import {buildOmenDepositUrl} from './depositUrl';
import OmenLogo from './OmenLogo';
import {OMEN_COLORS} from './theme';

function formatUsd(n: number): string {
  const sign = n < 0 ? '-' : '';
  return `${sign}$${Math.abs(n)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/, ',')}`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
}

/**
 * Omen — a mock "funded account" host screen wearing the Omen brand skin (dark, violet accent),
 * mirroring the web demo (apps/deposit-demo). Shows a balance + activity and opens the
 * WalletConnect Pay deposit flow in an in-app WebView (OmenDepositWebView), which credits the
 * balance from the result posted back over the RN bridge. No context switch, no redirect.
 */
function OmenScreen() {
  const {balance, activity} = useSnapshot(OmenStore.state);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const onDeposit = () => {
    navigation.navigate('OmenDepositWebView', {url: buildOmenDepositUrl()});
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Text style={styles.chevron}>‹</Text>
        </TouchableOpacity>
        <OmenLogo />
        <Text style={styles.signOut}>Sign out</Text>
      </View>

      <View style={styles.banner}>
        <Text style={styles.bannerText}>Welcome Offer: Deposit $5, get $200</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.balanceBlock}>
          <Text style={styles.balanceLabel}>Account balance</Text>
          <Text style={styles.balance}>{formatUsd(balance)}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            testID="omen-deposit-button"
            onPress={onDeposit}
            activeOpacity={0.85}
            style={[styles.pill, styles.pillPrimary]}>
            <Text style={styles.pillPrimaryText}>+ Deposit crypto</Text>
          </TouchableOpacity>
          <View style={[styles.pill, styles.pillDisabled]}>
            <Text style={styles.pillDisabledText}>Withdraw</Text>
          </View>
        </View>

        <View style={styles.activity}>
          <Text style={styles.sectionLabel}>Activity</Text>
          {activity.map(tx => {
            const isCredit = tx.amount > 0;
            return (
              <View key={tx.id} style={styles.row}>
                <View
                  style={[
                    styles.rowBadge,
                    {backgroundColor: isCredit ? OMEN_COLORS.creditTint : OMEN_COLORS.surfaceRaised},
                  ]}>
                  <Text
                    style={[
                      styles.rowBadgeGlyph,
                      {color: isCredit ? OMEN_COLORS.credit : OMEN_COLORS.textSecondary},
                    ]}>
                    {isCredit ? '↓' : '↑'}
                  </Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowLabel}>{tx.label}</Text>
                  <View style={styles.rowMeta}>
                    <Text style={styles.rowDate}>{formatDate(tx.ts)}</Text>
                    {tx.txHash ? (
                      <>
                        <Text style={styles.rowDate}> · </Text>
                        <TouchableOpacity
                          onPress={() =>
                            Linking.openURL(`https://basescan.org/tx/${tx.txHash}`)
                          }>
                          <Text style={styles.rowLink}>View on explorer</Text>
                        </TouchableOpacity>
                      </>
                    ) : null}
                  </View>
                </View>
                <Text
                  style={[
                    styles.rowAmount,
                    {color: isCredit ? OMEN_COLORS.credit : OMEN_COLORS.textPrimary},
                  ]}>
                  {isCredit ? '+' : ''}
                  {formatUsd(tx.amount)}
                </Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.footer}>Deposits powered by WalletConnect</Text>
      </ScrollView>
    </View>
  );
}

export default OmenScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: OMEN_COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: OMEN_COLORS.border,
  },
  chevron: {
    color: OMEN_COLORS.textSecondary,
    fontSize: 30,
    lineHeight: 30,
    width: 24,
  },
  signOut: {
    color: OMEN_COLORS.textSecondary,
    fontSize: 14,
  },
  banner: {
    backgroundColor: OMEN_COLORS.accent,
    paddingVertical: 10,
    alignItems: 'center',
  },
  bannerText: {
    color: OMEN_COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 32,
  },
  balanceBlock: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  balanceLabel: {
    color: OMEN_COLORS.textSecondary,
    fontSize: 14,
  },
  balance: {
    color: OMEN_COLORS.textPrimary,
    fontSize: 44,
    fontWeight: '600',
    letterSpacing: -1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillPrimary: {
    backgroundColor: OMEN_COLORS.accent,
  },
  pillPrimaryText: {
    color: OMEN_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  pillDisabled: {
    backgroundColor: OMEN_COLORS.surfaceRaised,
  },
  pillDisabledText: {
    color: OMEN_COLORS.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
  activity: {
    gap: 4,
  },
  sectionLabel: {
    color: OMEN_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: OMEN_COLORS.surface,
  },
  rowBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBadgeGlyph: {
    fontSize: 16,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    color: OMEN_COLORS.textPrimary,
    fontSize: 14,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowDate: {
    color: OMEN_COLORS.textMuted,
    fontSize: 12,
  },
  rowLink: {
    color: OMEN_COLORS.accentSoft,
    fontSize: 12,
  },
  rowAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    color: OMEN_COLORS.textFaint,
    fontSize: 12,
    textAlign: 'center',
  },
});
