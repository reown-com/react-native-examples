import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { ArrowDownLeft, ArrowUpRight, BarChart3, ChevronRight } from '@/components/ui/icons';
import { colors, fonts, radius } from '@/constants/theme';
import { ActivityItem } from '@/data/activity';
import { formatUsd } from '@/utils/format';

interface DesktopHomeProps {
  balance: number;
  activity: ActivityItem[];
  onDeposit: () => void;
  isLoadingBalance?: boolean;
}

export function DesktopHome({ balance, activity, onDeposit, isLoadingBalance }: DesktopHomeProps) {
  const rows = activity.slice(0, 5);
  const showLoading = isLoadingBalance && balance === 0;

  return (
    <Animated.View entering={FadeInUp.duration(400)}>
      <View style={styles.welcome}>
        <Text style={styles.eyebrow}>Welcome back</Text>
        <Text style={styles.greeting}>Good afternoon, Mirna</Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>Portfolio value</Text>
          <Text style={styles.heroValue}>{showLoading ? '$—' : `$${formatUsd(balance)}`}</Text>
          <View style={styles.actions}>
            <Pressable onPress={onDeposit} style={[styles.action, styles.actionPrimary]}>
              <ArrowDownLeft size={16} color={colors.surface} />
              <Text style={[styles.actionText, { color: colors.surface }]}>Deposit</Text>
            </Pressable>
            <Pressable style={[styles.action, styles.actionSecondary]}>
              <ArrowUpRight size={16} color={colors.text} />
              <Text style={[styles.actionText, { color: colors.text }]}>Withdraw</Text>
            </Pressable>
            <Pressable style={[styles.action, styles.actionSecondary]}>
              <BarChart3 size={16} color={colors.text} />
              <Text style={[styles.actionText, { color: colors.text }]}>Trade</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.stats}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Open positions</Text>
            <Text style={styles.statValue}>7</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>This month</Text>
            <Text style={[styles.statValue, { color: colors.success }]}>+$284</Text>
          </View>
        </View>
      </View>

      <View style={styles.activitySection}>
        <View style={styles.activityHead}>
          <Text style={styles.activityTitle}>Recent activity</Text>
          <View style={styles.viewAll}>
            <Text style={styles.viewAllText}>View all</Text>
            <ChevronRight size={12} color={colors.textDim} />
          </View>
        </View>
        <View style={styles.activityList}>
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
                    <ArrowDownLeft size={14} color={colors.success} />
                  ) : (
                    <BarChart3 size={14} color={colors.textDim} />
                  )}
                </View>
                <View>
                  <Text style={styles.activityLabel}>{a.label}</Text>
                  <Text style={styles.activitySub}>
                    {a.sub} · {a.time}
                  </Text>
                </View>
              </View>
              <View style={styles.activityRight}>
                <Text style={styles.activityAmount}>{a.amount}</Text>
                <Text style={[styles.activityValue, { color: a.positive ? colors.success : colors.textDim }]}>
                  {a.value}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  welcome: { marginBottom: 48 },
  eyebrow: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.textDimmer,
  },
  greeting: { fontFamily: fonts.serif, fontSize: 32, color: colors.text, marginTop: 8 },
  grid: { flexDirection: 'row', gap: 24 },
  hero: { flex: 2, padding: 32, borderRadius: radius['2xl'], backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border },
  heroLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.textDimmer,
    marginBottom: 12,
  },
  heroValue: { fontFamily: fonts.serif, fontSize: 72, letterSpacing: -1.4, color: colors.text, marginBottom: 24 },
  actions: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radius.pill,
  },
  actionPrimary: { backgroundColor: colors.text },
  actionSecondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  actionText: { fontFamily: fonts.medium, fontSize: 14 },
  stats: { flex: 1, gap: 16 },
  statCard: { padding: 20, borderRadius: radius['2xl'], backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border },
  statLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.textDimmer,
    marginBottom: 8,
  },
  statValue: { fontFamily: fonts.serif, fontSize: 28, color: colors.text },
  activitySection: { marginTop: 40 },
  activityHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  activityTitle: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  viewAll: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewAllText: { fontFamily: fonts.mono, fontSize: 11, color: colors.textDim },
  activityList: { borderRadius: radius['2xl'], backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  empty: { paddingHorizontal: 20, paddingVertical: 28, alignItems: 'center' },
  emptyText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textDim },
  emptySub: { fontFamily: fonts.regular, fontSize: 12, color: colors.textDimmer, marginTop: 4 },
  activityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  activityLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  activityIcon: { width: 36, height: 36, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  activityLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  activitySub: { fontFamily: fonts.regular, fontSize: 11, color: colors.textDimmer },
  activityRight: { alignItems: 'flex-end' },
  activityAmount: { fontFamily: fonts.mono, fontSize: 13, color: colors.text },
  activityValue: { fontFamily: fonts.mono, fontSize: 10 },
});
