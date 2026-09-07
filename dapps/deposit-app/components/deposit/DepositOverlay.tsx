import React from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, SlideInDown, ZoomIn } from 'react-native-reanimated';

import { CheckoutSurface } from '@/components/deposit/CheckoutSurface';
import { CompleteStep } from '@/components/deposit/CompleteStep';
import { DepositAmountStep } from '@/components/deposit/DepositAmountStep';
import { colors, radius } from '@/constants/theme';
import { Device } from '@/hooks/use-device';
import { useDepositStore } from '@/stores/use-deposit-store';

/**
 * Renders the deposit flow as a centered modal (desktop) or a bottom sheet
 * (mobile), switching content from the store's state machine:
 * amount → checkout → complete.
 */
export function DepositOverlay({ device }: { device: Device }) {
  const { isOpen, step, closeDeposit } = useDepositStore();
  const isMobile = device === 'mobile';
  // The native checkout embeds a WebView, which needs a bounded height rather
  // than the intrinsic sizing a ScrollView gives it.
  const isNativeCheckout = step === 'checkout' && Platform.OS !== 'web';

  const stepContent = (layout: Device) => {
    switch (step) {
      case 'amount':
        return <DepositAmountStep layout={layout} />;
      case 'checkout':
        return <CheckoutSurface layout={layout} />;
      case 'complete':
        return <CompleteStep layout={layout} />;
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="none" onRequestClose={closeDeposit}>
      {isMobile ? (
        <Animated.View entering={FadeIn.duration(200)} style={styles.mobileBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeDeposit} />
          <Animated.View
            entering={SlideInDown.duration(350)}
            style={[styles.sheet, isNativeCheckout && styles.sheetTall]}
          >
            <View style={styles.handleWrap}>
              <View style={styles.handle} />
            </View>
            {isNativeCheckout ? (
              <View style={styles.sheetFill}>{stepContent('mobile')}</View>
            ) : (
              <ScrollView keyboardShouldPersistTaps="handled">{stepContent('mobile')}</ScrollView>
            )}
          </Animated.View>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn.duration(200)} style={styles.desktopBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeDeposit} />
          <Animated.View entering={ZoomIn.duration(300)} style={styles.card}>
            <ScrollView keyboardShouldPersistTaps="handled">{stepContent('desktop')}</ScrollView>
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
    width: 480,
    maxHeight: '90%',
    borderRadius: radius['2xl'],
    backgroundColor: colors.surface,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 80,
    shadowOffset: { width: 0, height: 30 },
    elevation: 24,
  },
  mobileBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    maxHeight: '92%',
    borderTopLeftRadius: radius['4xl'],
    borderTopRightRadius: radius['4xl'],
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  sheetTall: { height: '92%' },
  sheetFill: { flex: 1 },
  handleWrap: { alignItems: 'center', paddingVertical: 8 },
  handle: { width: 40, height: 4, borderRadius: radius.pill, backgroundColor: colors.border2 },
});
