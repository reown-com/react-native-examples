import React from 'react';
import {useWalletInfo, useProvider} from '@reown/appkit-react-native';
import {
  BorderRadius,
  FlexView,
  IconBox,
  Image,
  Spacing,
  Text,
} from '@reown/appkit-ui-react-native';
import {useTheme} from '@reown/appkit-ui-react-native';
import {StyleSheet} from 'react-native';
import {useSnapshot} from 'valtio';

import SettingsStore from '@/stores/SettingsStore';

export function WalletInfo() {
  const {walletInfo = {}} = useWalletInfo();
  const {provider} = useProvider();
  // Re-render when a link-mode request comes in (see App.tsx deeplink handler).
  const {isCurrentRequestLinkMode} = useSnapshot(SettingsStore.state);
  const Theme = useTheme();

  const linkMode = walletInfo?.redirect?.linkMode;

  // `transportType` lives on the active WalletConnect session ('relay' | 'link_mode').
  // `Provider` doesn't type the underlying session, so read it loosely and fall back
  // to the app's own link-mode flag.
  const sessionTransport = (provider as any)?.session?.transportType as
    | string
    | undefined;
  const transportType =
    sessionTransport ?? (isCurrentRequestLinkMode ? 'link_mode' : undefined);
  const transportLabel =
    transportType === 'link_mode'
      ? 'Link Mode'
      : transportType === 'relay'
      ? 'Relay'
      : undefined;

  return (
    <FlexView
      style={[
        styles.container,
        {
          backgroundColor: Theme['gray-glass-005'],
        },
      ]}>
      <FlexView
        flexDirection="row"
        alignItems="center"
        margin={['xs', '0', 's', '0']}>
        {walletInfo.icon ? (
          <Image style={styles.image} source={walletInfo?.icon} />
        ) : (
          <IconBox
            background
            icon="walletPlaceholder"
            size="sm"
            style={styles.image}
          />
        )}
        <Text variant="paragraph-600">{walletInfo?.name}</Text>
      </FlexView>
      <FlexView>
        {/* @ts-ignore */}
        {walletInfo?.redirect?.native && (
          <>
            <Text variant="small-600">Deep link:</Text>
            {/* @ts-ignore */}
            <Text variant="small-400">{walletInfo?.redirect?.native}</Text>
          </>
        )}
        {/* @ts-ignore */}
        {walletInfo?.redirect?.universal && (
          <>
            <Text style={styles.text} variant="small-600">
              Universal link:
            </Text>
            {/* @ts-ignore */}
            <Text variant="small-400">{walletInfo?.redirect?.universal}</Text>
          </>
        )}
        {typeof linkMode === 'boolean' && (
          <>
            <Text style={styles.text} variant="small-600">
              Link mode:
            </Text>
            <Text variant="small-400">
              {linkMode ? 'Supported' : 'Not supported'}
            </Text>
          </>
        )}
        {transportLabel && (
          <>
            <Text style={styles.text} variant="small-600">
              Transport mode:
            </Text>
            <Text variant="small-400">{transportLabel}</Text>
          </>
        )}
      </FlexView>
    </FlexView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.m,
    borderRadius: BorderRadius.s,
  },
  image: {
    height: 25,
    width: 25,
    marginRight: 4,
    borderRadius: BorderRadius.full,
  },
  text: {
    marginTop: Spacing.xs,
  },
});
