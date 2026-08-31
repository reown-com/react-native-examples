import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DepositOverlay } from '@/components/deposit/DepositOverlay';
import { BottomNav } from '@/components/home/BottomNav';
import { DesktopHome } from '@/components/home/DesktopHome';
import { MobileHome } from '@/components/home/MobileHome';
import { Sidebar } from '@/components/home/Sidebar';
import { SettingsModal } from '@/components/SettingsModal';
import { colors } from '@/constants/theme';
import { useDevice } from '@/hooks/use-device';
import { useDepositStore } from '@/stores/use-deposit-store';

/**
 * Home screen. Renders the desktop layout (sidebar + scrollable main) on a wide
 * web viewport, otherwise the mobile layout (content + bottom nav). The deposit
 * flow opens as an overlay on top of either.
 */
export default function HomeScreen() {
  const device = useDevice();
  const { balance, activity, openDeposit, isLoadingBalance } = useDepositStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const openSettings = () => setSettingsOpen(true);

  if (device === 'desktop') {
    return (
      <View style={styles.desktop}>
        <Sidebar onSettings={openSettings} />
        <View style={styles.desktopMain}>
          <View style={styles.desktopContent}>
            <DesktopHome
              balance={balance}
              activity={activity}
              onDeposit={openDeposit}
              isLoadingBalance={isLoadingBalance}
            />
          </View>
        </View>
        <DepositOverlay device={device} />
        <SettingsModal visible={settingsOpen} device={device} onClose={() => setSettingsOpen(false)} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.mobile} edges={['top', 'bottom']}>
      <View style={styles.mobileContent}>
        <MobileHome
          balance={balance}
          activity={activity}
          onDeposit={openDeposit}
          isLoadingBalance={isLoadingBalance}
        />
      </View>
      <BottomNav onSettings={openSettings} />
      <DepositOverlay device={device} />
      <SettingsModal visible={settingsOpen} device={device} onClose={() => setSettingsOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  desktop: { flex: 1, flexDirection: 'row', backgroundColor: colors.surface },
  desktopMain: { flex: 1, backgroundColor: colors.surface },
  desktopContent: { flex: 1, paddingHorizontal: 40, paddingVertical: 40, maxWidth: 1100, width: '100%', alignSelf: 'center' },
  mobile: { flex: 1, backgroundColor: colors.surface },
  mobileContent: { flex: 1 },
});
