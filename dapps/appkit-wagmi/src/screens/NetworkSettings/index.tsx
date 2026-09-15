import React, {useEffect, useMemo, useRef} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import {useSnapshot} from 'valtio';

import AppKitConfigStore from '@/stores/AppKitConfigStore';
import {NETWORK_GROUPS} from '@/utils/WagmiUtils';
import {useTheme} from '@/hooks/useTheme';
import {RootStackScreenProps} from '@/utils/TypesUtil';

type Props = RootStackScreenProps<'NetworkSettings'>;

function NetworkSettingsScreen({navigation}: Props) {
  const Theme = useTheme();
  const {enabledNetworkIds, siwxEnabled} = useSnapshot(AppKitConfigStore.state);

  // Snapshot the config on mount so we can tell if the user changed anything.
  const initialIds = useRef<string[]>(AppKitConfigStore.getEnabledNetworkIds());
  const initialSiwx = useRef<boolean>(AppKitConfigStore.getSiwxEnabled());

  const isDirty = useMemo(() => {
    if (siwxEnabled !== initialSiwx.current) {
      return true;
    }
    const initial = initialIds.current;
    if (initial.length !== enabledNetworkIds.length) {
      return true;
    }
    const initialSet = new Set(initial);
    return enabledNetworkIds.some(id => !initialSet.has(id));
  }, [enabledNetworkIds, siwxEnabled]);

  // Remind the user on the way out that changes only apply after a restart.
  // We don't block navigation: `beforeRemove` + preventDefault isn't supported
  // on native-stack, and the change is already persisted — a restart is all
  // that's needed to apply it.
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      if (!isDirty) {
        return;
      }

      Alert.alert(
        'Restart required',
        'Close and reopen the app to apply your network and SIWX changes.',
      );
    });

    return unsubscribe;
  }, [navigation, isDirty]);

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: Theme['bg-100']}]}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic">
      <Text style={[styles.description, {color: Theme['fg-150']}]}>
        Configure AppKit and choose which networks the app connects with.
        Changes take effect after you close and reopen the app.
      </Text>

      <Text style={[styles.subtitle, {color: Theme['fg-100']}]}>
        Authentication
      </Text>
      <View
        style={[styles.section, {backgroundColor: Theme['gray-glass-005']}]}>
        <View style={styles.row}>
          <Text style={[styles.rowLabel, {color: Theme['fg-100']}]}>
            SIWX (One-Click Auth)
          </Text>
          <Switch
            value={siwxEnabled}
            onValueChange={() => AppKitConfigStore.toggleSiwx()}
            trackColor={{true: Theme['accent-100']}}
          />
        </View>
      </View>

      {NETWORK_GROUPS.map(group => (
        <View key={group.title}>
          <Text style={[styles.subtitle, {color: Theme['fg-100']}]}>
            {group.title}
          </Text>
          <View
            style={[styles.section, {backgroundColor: Theme['gray-glass-005']}]}>
            {group.items.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.row,
                  index > 0 && {
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: Theme['gray-glass-010'],
                  },
                ]}>
                <Text style={[styles.rowLabel, {color: Theme['fg-100']}]}>
                  {item.name}
                </Text>
                <Switch
                  value={enabledNetworkIds.includes(item.id)}
                  onValueChange={() => AppKitConfigStore.toggleNetwork(item.id)}
                  trackColor={{true: Theme['accent-100']}}
                />
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

export default NetworkSettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  description: {
    fontSize: 14,
    marginVertical: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  section: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '500',
    flexShrink: 1,
  },
});
