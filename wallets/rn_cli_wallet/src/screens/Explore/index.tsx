import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import { EXPLORE_APPS, ExploreApp } from '@/utils/ExploreUtil';
import { HomeTabScreenProps } from '@/utils/TypesUtil';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';

type Props = HomeTabScreenProps<'Explore'>;

/**
 * Explore (H2b): a curated directory of apps. Tapping a tile opens the app in
 * a webview that auto-connects to this wallet — the user lands connected.
 */
export default function Explore({ navigation }: Props) {
  const Theme = useTheme();

  const openApp = (app: ExploreApp) => {
    navigation.navigate('AppBrowser', {
      url: app.url,
      name: app.name,
    });
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
        Tap an app to open it already connected
      </Text>
      <View style={styles.grid}>
        {EXPLORE_APPS.map(app => (
          <TouchableOpacity
            key={app.id}
            style={[
              styles.tile,
              {
                backgroundColor: Theme['foreground-primary'],
                borderColor: Theme['border-primary'],
              },
            ]}
            onPress={() => openApp(app)}
          >
            <View style={[styles.glyph, { backgroundColor: app.color }]}>
              <Text variant="lg-500" style={styles.glyphText}>
                {app.glyph}
              </Text>
            </View>
            <Text variant="md-500" color="text-primary">
              {app.name}
            </Text>
            <Text variant="sm-400" color="text-secondary">
              {app.description}
            </Text>
            <View
              style={[
                styles.badge,
                { backgroundColor: Theme['foreground-accent-primary-10'] },
              ]}
            >
              <Text variant="tiny-400" color="text-accent-primary">
                Fee-sharing · {app.chainLabel}
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
