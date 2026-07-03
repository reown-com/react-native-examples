import { useSnapshot } from 'valtio';
import { useEffect, useState } from 'react';
import { View, Switch, StyleSheet, Platform } from 'react-native';
import { getVersion, getBuildNumber } from '@/utils/AppInfo';
import { NavigationProp, useNavigation } from '@react-navigation/native';

import { getEnvironmentLabel } from '@/utils/misc';
import { setClipboardString } from '@/utils/ClipboardUtil';
import SettingsStore from '@/store/SettingsStore';
import ModalStore from '@/store/ModalStore';
import { Card } from '@/components/Card';
import { storage } from '@/utils/storage';
import { Text } from '@/components/Text';
import { ScrollView } from 'react-native-gesture-handler';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { showToast } from '@/utils/ToastUtil';
import { RootStackParamList } from '@/utils/TypesUtil';
import { Button } from '@/components/Button';

export default function Settings() {
  const { socketStatus, themeMode } = useSnapshot(SettingsStore.state);
  const [clientId, setClientId] = useState('');
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const Theme = useTheme();

  // react-native-web paints the Switch "on" state via activeTrackColor/
  // activeThumbColor (not React Native's trackColor/thumbColor, which only
  // cover native). These props aren't in RN's Switch types, so pass them
  // only on web.
  const webAccentSwitchProps = (
    Platform.OS === 'web'
      ? {
          activeTrackColor: Theme['bg-accent-primary'],
          activeThumbColor: Theme.white,
        }
      : {}
  ) as object;

  useEffect(() => {
    async function getAsyncData() {
      const _clientId = await storage.getItem('WALLETCONNECT_CLIENT_ID');
      if (_clientId) {
        setClientId(_clientId);
      }
    }
    getAsyncData();
  }, []);

  const copyToClipboard = (value: string, label: string = 'Value') => {
    setClipboardString(value);
    showToast({
      type: 'info',
      text1: `${label} copied`,
    });
  };

  const toggleDarkMode = () => {
    const newMode = themeMode === 'dark' ? 'light' : 'dark';
    SettingsStore.setThemeMode(newMode);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Theme['bg-primary'] }]}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text variant="lg-500" color="text-primary" style={styles.subtitle}>
        Preferences
      </Text>
      <View style={styles.sectionContainer}>
        <Button
          onPress={toggleDarkMode}
          style={[
            styles.switchCard,
            { backgroundColor: Theme['foreground-primary'] },
          ]}
        >
          <View style={styles.switchCardContent}>
            <Text variant="md-500" color="text-primary">
              Dark mode
            </Text>
            {/* Display-only: the whole card (PressableScale) owns the toggle.
                pointerEvents="none" lets a tap on the switch pass through to the
                card's onPress, so it toggles exactly once. Without this, on web
                the switch's own click also bubbles to the card and toggles twice
                (net no change). */}
            <View pointerEvents="none" style={styles.switch}>
              <Switch
                value={themeMode === 'dark'}
                trackColor={Platform.select({
                  android: {
                    false: Theme['foreground-tertiary'],
                    true: Theme['bg-accent-primary'],
                  },
                })}
                thumbColor={Platform.select({ android: Theme.white })}
                {...webAccentSwitchProps}
              />
            </View>
          </View>
        </Button>
        <Card
          title="Secret keys & phrases"
          onPress={() => navigation.navigate('SecretPhrase')}
        />
        <Card
          title="Import wallet"
          onPress={() => ModalStore.open('ImportWalletModal', {})}
        />
      </View>
      <Text variant="lg-500" color="text-primary" style={styles.subtitle}>
        Device
      </Text>
      <View style={styles.sectionContainer}>
        <Card
          title="Client ID"
          value={
            clientId ? `${clientId.slice(0, 8)}..${clientId.slice(-8)}` : ''
          }
          onPress={() => copyToClipboard(clientId, 'Client ID')}
        />
        <Card
          title="App version"
          value={`${getVersion()} (${getBuildNumber()}) - ${getEnvironmentLabel()}`}
        />
        <Card title="Socket status" value={socketStatus} />
        <Card title="Read logs" onPress={() => navigation.navigate('Logs')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing[5],
  },
  subtitle: {
    marginBottom: Spacing[3],
    marginTop: Spacing[2],
  },
  sectionContainer: {
    gap: Spacing[2],
    marginBottom: Spacing[4],
  },
  switchCard: {
    borderRadius: BorderRadius[4],
    height: 76,
  },
  switchCardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[6],
  },
  switch: {
    alignSelf: 'center',
  },
});
