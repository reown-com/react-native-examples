import { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { SvgUri } from 'react-native-svg';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import { EXPLORE_APPS, ExploreApp, getAppIconUrl } from '@/utils/ExploreUtil';
import { HomeTabScreenProps } from '@/utils/TypesUtil';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';

type Props = HomeTabScreenProps<'Explore'>;

// Tiles are laid out two per row so both columns fill the width exactly.
const ROWS: ExploreApp[][] = [];
for (let i = 0; i < EXPLORE_APPS.length; i += 2) {
  ROWS.push(EXPLORE_APPS.slice(i, i + 2));
}

// The app's logo, or its letter on its brand color if the logo can't load.
function AppIcon({ app }: { app: ExploreApp }) {
  const Theme = useTheme();
  const uri = getAppIconUrl(app);
  const iconStyle = [styles.icon, { backgroundColor: Theme['bg-primary'] }];
  const [failed, setFailed] = useState(false);

  if (uri && !failed) {
    // Image can't render SVG, so SVG logos go through react-native-svg.
    if (uri.endsWith('.svg')) {
      return (
        <View style={iconStyle}>
          <SvgUri
            uri={uri}
            width="100%"
            height="100%"
            onError={() => setFailed(true)}
          />
        </View>
      );
    }
    return (
      <Image
        source={{ uri, cache: 'force-cache' }}
        style={iconStyle}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <View style={[styles.icon, { backgroundColor: app.color }]}>
      <Text variant="lg-500" style={styles.glyphText}>
        {app.glyph}
      </Text>
    </View>
  );
}

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
      <Text variant="lg-500" color="text-primary" style={styles.title}>
        Explore
      </Text>
      <View style={styles.grid}>
        {ROWS.map(row => (
          <View key={row[0].id} style={styles.row}>
            {row.map(app => (
              <View key={app.id} style={styles.cell}>
                <Button
                  style={[
                    styles.tile,
                    { backgroundColor: Theme['foreground-primary'] },
                  ]}
                  onPress={() => openApp(app)}
                >
                  <AppIcon app={app} />
                  <Text variant="md-500" color="text-primary">
                    {app.name}
                  </Text>
                </Button>
              </View>
            ))}
            {row.length === 1 && <View style={styles.cell} />}
          </View>
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
  title: {
    marginBottom: Spacing[4],
  },
  grid: {
    gap: Spacing[2],
  },
  row: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  // Plain Views split the row evenly; PressableScale alone sizes to its text.
  cell: {
    flex: 1,
  },
  tile: {
    flex: 1,
    borderRadius: BorderRadius[4],
    padding: Spacing[5],
    gap: Spacing[1],
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius[3],
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[2],
  },
  glyphText: {
    color: '#FFFFFF',
  },
});
