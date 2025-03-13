import React from 'react';
import {useWalletInfo} from '@reown/appkit-wagmi-react-native';
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
export function WalletInfo() {
  const {walletInfo = {}} = useWalletInfo();
  const Theme = useTheme();

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
