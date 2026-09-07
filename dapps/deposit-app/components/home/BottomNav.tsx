import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BarChart3, Home, Settings, Wallet } from '@/components/ui/icons';
import { colors, fonts } from '@/constants/theme';

const NAV = [
  { key: 'home', label: 'Home', Icon: Home },
  { key: 'trade', label: 'Trade', Icon: BarChart3 },
  { key: 'balance', label: 'Balance', Icon: Wallet },
  { key: 'settings', label: 'Settings', Icon: Settings },
] as const;

/** Mobile bottom tab bar (only Home active), matching the spec's nav set. */
export function BottomNav({ onSettings }: { onSettings?: () => void }) {
  return (
    <View style={styles.bar}>
      {NAV.map(({ key, label, Icon }) => {
        const active = key === 'home';
        return (
          <Pressable
            key={key}
            onPress={key === 'settings' ? onSettings : undefined}
            style={styles.item}
          >
            <Icon size={20} color={active ? colors.text : colors.textDimmer} />
            <Text style={[styles.label, { color: active ? colors.text : colors.textDimmer }]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  item: { alignItems: 'center', gap: 4 },
  label: { fontFamily: fonts.medium, fontSize: 9 },
});
