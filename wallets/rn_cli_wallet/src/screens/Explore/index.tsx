import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSnapshot } from 'valtio';

import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import SettingsStore from '@/store/SettingsStore';
import {
  buildPickerDappUrl,
  PICKER_DAPPS,
  PickerDapp,
} from '@/utils/PickerUtil';
import { HomeTabScreenProps } from '@/utils/TypesUtil';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';

type Props = HomeTabScreenProps<'Explore'>;

/**
 * Dapp Picker POC (H2b): a curated directory of fee-honoring dapps. Tapping a
 * tile opens the dapp in a webview with a monetized WC session
 * pre-established — the user lands already connected.
 */
export default function Explore({ navigation }: Props) {
  const Theme = useTheme();
  const { pickerHeadless } = useSnapshot(SettingsStore.state);

  const openDapp = (dapp: PickerDapp) => {
    navigation.navigate('DappBrowser', {
      url: buildPickerDappUrl(dapp),
      name: dapp.name,
    });
  };

  const onTilePress = (dapp: PickerDapp) => {
    if (!SettingsStore.state.pickerConsentAsked) {
      Alert.alert(
        'Auto-connect to dapps opened from Explore?',
        'Dapps opened from this screen will be connected to your wallet automatically, with fee sharing enabled. You still confirm every transaction.',
        [
          {
            text: 'Not now',
            style: 'cancel',
            onPress: () => {
              SettingsStore.setPickerConsent(false);
              openDapp(dapp);
            },
          },
          {
            text: 'Allow',
            onPress: () => {
              SettingsStore.setPickerConsent(true);
              openDapp(dapp);
            },
          },
        ],
      );
      return;
    }
    openDapp(dapp);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Theme['bg-primary'] }]}
      contentContainerStyle={styles.content}
    >
      <Text variant="lg-500" color="text-primary">
        Explore
      </Text>
      <Text variant="sm-400" color="text-secondary" style={styles.subtitle}>
        Fee-sharing dapps — tap to open connected ({pickerHeadless ? 'headless' : 'provider'} mode)
      </Text>
      <View style={styles.grid}>
        {PICKER_DAPPS.map(dapp => (
          <TouchableOpacity
            key={dapp.id}
            style={[
              styles.tile,
              {
                backgroundColor: Theme['foreground-primary'],
                borderColor: Theme['border-primary'],
              },
            ]}
            onPress={() => onTilePress(dapp)}
          >
            <View style={[styles.glyph, { backgroundColor: dapp.color }]}>
              <Text variant="lg-500" style={styles.glyphText}>
                {dapp.glyph}
              </Text>
            </View>
            <Text variant="md-500" color="text-primary">
              {dapp.name}
            </Text>
            <Text variant="sm-400" color="text-secondary">
              {dapp.description}
            </Text>
            <View
              style={[
                styles.badge,
                { backgroundColor: Theme['foreground-accent-primary-10'] },
              ]}
            >
              <Text variant="tiny-400" color="text-accent-primary">
                Fee-sharing · {dapp.chainLabel}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing[4],
  },
  subtitle: {
    marginTop: Spacing[1],
    marginBottom: Spacing[4],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  tile: {
    width: '47%',
    borderRadius: BorderRadius[4],
    borderWidth: 1,
    padding: Spacing[4],
    gap: Spacing[1],
  },
  glyph: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[2],
  },
  glyphText: {
    color: '#FFFFFF',
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    marginTop: Spacing[2],
  },
});
