import { useSnapshot } from 'valtio';
import { useEffect, useState } from 'react';
import { View, Switch, StyleSheet, Platform } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { getVersion, getBuildNumber } from 'react-native-device-info';
import { NavigationProp, useNavigation } from '@react-navigation/native';

import SettingsStore from '@/store/SettingsStore';
import ModalStore from '@/store/ModalStore';
import { Card } from '@/components/Card';
import { storage } from '@/utils/storage';
import { Text } from '@/components/Text';
import { ScrollView } from 'react-native-gesture-handler';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import Toast from 'react-native-toast-message';
import { RootStackParamList } from '@/utils/TypesUtil';
import { Button } from '@/components/Button';

export default function Settings() {
  const { socketStatus, themeMode } = useSnapshot(SettingsStore.state);
  const [clientId, setClientId] = useState('');
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const Theme = useTheme();

  useEffect(() => {
    async function getAsyncData() {
      const _clientId = await storage.getItem('WALLETCONNECT_CLIENT_ID');
      if (_clientId) {
        setClientId(_clientId);
      }
    }
    getAsyncData();
  }, []);

  const copyToClipboard = (value: string) => {
    Clipboard.setString(value);
    Toast.show({
      type: 'info',
      text1: 'Value copied to clipboard',
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
          <Text variant="md-500" color="text-primary">
            Dark mode
          </Text>
          <Switch
            value={themeMode === 'dark'}
            onValueChange={toggleDarkMode}
            trackColor={Platform.select({
              android: {
                false: Theme['foreground-tertiary'],
                true: Theme['bg-accent-primary'],
              },
            })}
            thumbColor={Platform.select({ android: Theme.white })}
          />
        </Button>
        <Card
          title="Secret phrases"
          onPress={() => navigation.navigate('SecretPhrase')}
          icon="chevronRight"
        />
        <Card
          title="Import EVM Wallet"
          onPress={() => ModalStore.open('ImportWalletModal', {})}
          icon="chevronRight"
        />
      </View>
      <Text variant="lg-500" color="text-primary" style={styles.subtitle}>
        Device
      </Text>
      <View style={styles.sectionContainer}>
        <Card
          title="Client ID"
          value={clientId}
          onPress={() => copyToClipboard(clientId)}
        />
        <Card
          title="App version"
          value={`${getVersion()} (${getBuildNumber()})`}
        />
        <Card title="Socket status" value={socketStatus} />
        <Card
          title="Read full logs"
          onPress={() => navigation.navigate('Logs')}
          icon="chevronRight"
        />
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
    gap: Spacing[3],
    marginBottom: Spacing[4],
  },
  switchCard: {
    borderRadius: BorderRadius[4],
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
