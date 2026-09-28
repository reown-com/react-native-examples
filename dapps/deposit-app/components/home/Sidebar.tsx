import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ArrowUpRight, BarChart3, Home, Settings, Wallet } from '@/components/ui/icons';
import { colors, fonts, radius } from '@/constants/theme';

const NAV = [
  { key: 'home', label: 'Home', Icon: Home },
  { key: 'trade', label: 'Trade', Icon: BarChart3 },
  { key: 'balance', label: 'Balance', Icon: Wallet },
  { key: 'earn', label: 'Earn', Icon: ArrowUpRight },
  { key: 'settings', label: 'Settings', Icon: Settings },
] as const;

/** Desktop left sidebar: brand, nav (only Home active), and the user chip. */
export function Sidebar({ onSettings }: { onSettings?: () => void }) {
  return (
    <View style={styles.sidebar}>
      <View style={styles.brand}>
        <View style={styles.logo}>
          <View style={styles.logoMark} />
        </View>
        <Text style={styles.brandName}>Tradedemo</Text>
      </View>

      <View style={styles.nav}>
        {NAV.map(({ key, label, Icon }) => {
          const active = key === 'home';
          return (
            <Pressable
              key={key}
              onPress={key === 'settings' ? onSettings : undefined}
              style={[
                styles.navItem,
                {
                  backgroundColor: active ? colors.surface : 'transparent',
                  borderColor: active ? colors.border : 'transparent',
                },
              ]}
            >
              <Icon size={16} color={active ? colors.text : colors.textDim} />
              <Text
                style={[
                  styles.navLabel,
                  { color: active ? colors.text : colors.textDim, fontFamily: active ? fonts.medium : fonts.regular },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.userChip}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>M</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            Mirna
          </Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            mirna@reown.com
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 220,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    backgroundColor: colors.surface2,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, marginBottom: 40 },
  logo: {
    width: 28,
    height: 28,
    borderRadius: radius.lg,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMark: { width: 12, height: 12, borderRadius: 4, backgroundColor: colors.accent },
  brandName: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
  nav: { gap: 4 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  navLabel: { fontSize: 13 },
  userChip: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontFamily: fonts.medium, fontSize: 13 },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { fontFamily: fonts.medium, fontSize: 12, color: colors.text },
  userEmail: { fontFamily: fonts.mono, fontSize: 10, color: colors.textDimmer },
});
