import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { ArrowDownLeft, BarChart3 } from '@/components/ui/icons';
import { colors, fonts, radius } from '@/constants/theme';
import { ActivityItem } from '@/data/activity';
import { formatUsd } from '@/utils/format';

interface MobileHomeProps {
  balance: number;
  activity: ActivityItem[];
  onDeposit: () => void;
  isLoadingBalance?: boolean;
}

export function MobileHome({ balance, activity, onDeposit, isLoadingBalance }: MobileHomeProps) {
  const rows = activity.slice(0, 4);
  const showLoading = isLoadingBalance && balance === 0;

  return (
    <Animated.View entering={FadeInUp.duration(400)} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Welcome back</Text>
            <Text style={styles.name}>Mirna</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>M</Text>
          </View>
        </View>

        <View style={styles.balanceBlock}>
          <Text style={styles.balanceLabel}>Portfolio value</Text>
          <Text style={styles.balanceValue}>{showLoading ? '$—' : `$${formatUsd(balance)}`}</Text>
        </View>

        <Pressable onPress={onDeposit} style={styles.depositBtn}>
          <ArrowDownLeft size={18} color={colors.surface} />
          <Text style={styles.depositText}>Deposit</Text>
        </Pressable>
        <View style={styles.secondaryRow}>
          <Pressable style={styles.secondaryBtn}>
            <Text style={styles.secondaryText}>Trade</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn}>
            <Text style={styles.secondaryText}>Earn</Text>
          </Pressable>
        </View>

        <View style={styles.activityHead}>
          <Text style={styles.activityTitle}>Activity</Text>
          <Text style={styles.viewAll}>View all</Text>
        </View>
        <View>
          {rows.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No activity yet</Text>
              <Text style={styles.emptySub}>Your deposits will show up here.</Text>
            </View>
          ) : null}
          {rows.map((a, i) => (
            <View
              key={i}
              style={[
                styles.activityRow,
                i < rows.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
            >
              <View style={styles.activityLeft}>
                <View
                  style={[
                    styles.activityIcon,
                    { backgroundColor: a.type === 'deposit' ? colors.successSoft : colors.surface3 },
                  ]}
                >
                  {a.type === 'deposit' ? (
                    <ArrowDownLeft size={13} color={colors.success} />
                  ) : (
                    <BarChart3 size={13} color={colors.textDim} />
                  )}
                </View>
                <View>
                  <Text style={styles.activityLabel}>{a.label}</Text>
                  <Text style={styles.activitySub}>
                    {a.sub} · {a.time}
                  </Text>
                </View>
              </View>
              <Text style={styles.activityAmount}>{a.amount}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 },
  eyebrow: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.textDimmer,
  },
  name: { fontFamily: fonts.medium, fontSize: 16, color: colors.text, marginTop: 4 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontFamily: fonts.medium, fontSize: 13 },
  balanceBlock: { marginBottom: 24 },
  balanceLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.textDimmer,
    marginBottom: 12,
  },
  balanceValue: { fontFamily: fonts.serif, fontSize: 52, letterSpacing: -1, color: colors.text },
  depositBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: radius['2xl'],
    backgroundColor: colors.text,
    marginBottom: 12,
  },
  depositText: { fontFamily: fonts.medium, fontSize: 15, color: colors.surface },
  secondaryRow: { flexDirection: 'row', gap: 8, marginBottom: 40 },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius['2xl'],
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  secondaryText: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  activityHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  activityTitle: { fontFamily: fonts.medium, fontSize: 12, color: colors.text },
  viewAll: { fontFamily: fonts.mono, fontSize: 10, color: colors.textDim },
  empty: { paddingVertical: 24, alignItems: 'center' },
  emptyText: { fontFamily: fonts.medium, fontSize: 12, color: colors.textDim },
  emptySub: { fontFamily: fonts.regular, fontSize: 11, color: colors.textDimmer, marginTop: 4 },
  activityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  activityLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  activityIcon: { width: 32, height: 32, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  activityLabel: { fontFamily: fonts.medium, fontSize: 12, color: colors.text },
  activitySub: { fontFamily: fonts.regular, fontSize: 10, color: colors.textDimmer },
  activityAmount: { fontFamily: fonts.mono, fontSize: 12, color: colors.text },
});
