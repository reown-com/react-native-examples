import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, SlideInDown, ZoomIn } from 'react-native-reanimated';

import { Check, X } from '@/components/ui/icons';
import { colors, fonts, radius } from '@/constants/theme';
import { Device } from '@/hooks/use-device';
import { useDepositStore } from '@/stores/use-deposit-store';

/**
 * Lightweight Settings modal, opened from the Settings nav item. Currently hosts
 * a single demo affordance: clear the persisted deposits + cached balance.
 */
export function SettingsModal({
  visible,
  device,
  onClose,
}: {
  visible: boolean;
  device: Device;
  onClose: () => void;
}) {
  const { clearDemoData } = useDepositStore();
  const [cleared, setCleared] = useState(false);
  const isMobile = device === 'mobile';

  const onClear = () => {
    clearDemoData();
    setCleared(true);
    setTimeout(() => setCleared(false), 1800);
  };

  const content = (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Pressable onPress={onClose} style={styles.closeBtn}>
          <X size={16} color={colors.text} />
        </Pressable>
      </View>

      <Text style={styles.sectionLabel}>Demo</Text>
      <Pressable onPress={onClear} style={styles.row}>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>Clear demo data</Text>
          <Text style={styles.rowSub}>Removes saved deposits and cached balance.</Text>
        </View>
        {cleared ? (
          <View style={styles.done}>
            <Check size={14} color={colors.success} />
            <Text style={styles.doneText}>Cleared</Text>
          </View>
        ) : (
          <Text style={styles.action}>Clear</Text>
        )}
      </Pressable>
    </>
  );

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      {isMobile ? (
        <Animated.View entering={FadeIn.duration(200)} style={styles.mobileBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
          <Animated.View entering={SlideInDown.duration(350)} style={styles.sheet}>
            <View style={styles.handleWrap}>
              <View style={styles.handle} />
            </View>
            <View style={styles.body}>{content}</View>
          </Animated.View>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn.duration(200)} style={styles.desktopBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
          <Animated.View entering={ZoomIn.duration(300)} style={styles.card}>
            <View style={styles.body}>{content}</View>
          </Animated.View>
        </Animated.View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  desktopBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(15,15,15,0.5)',
  },
  card: {
    width: 440,
    borderRadius: radius['2xl'],
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  mobileBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    borderTopLeftRadius: radius['4xl'],
    borderTopRightRadius: radius['4xl'],
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  handleWrap: { alignItems: 'center', paddingVertical: 8 },
  handle: { width: 40, height: 4, borderRadius: radius.pill, backgroundColor: colors.border2 },
  body: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 28 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface3,
  },
  sectionLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.textDimmer,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radius.xl,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowText: { flex: 1, paddingRight: 12 },
  rowTitle: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  rowSub: { fontFamily: fonts.regular, fontSize: 11, color: colors.textDimmer, marginTop: 2 },
  action: { fontFamily: fonts.medium, fontSize: 13, color: colors.danger },
  done: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  doneText: { fontFamily: fonts.mono, fontSize: 11, color: colors.success },
});
