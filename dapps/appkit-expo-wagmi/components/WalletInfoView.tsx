import React from 'react';
import {Image, StyleSheet, StyleProp, ViewStyle} from 'react-native';
import {useWalletInfo} from '@reown/appkit-react-native';
import {FlexView, Text} from '@reown/appkit-ui-react-native';

interface Props {
  style?: StyleProp<ViewStyle>;
}

export function WalletInfoView({style}: Props) {
  const {walletInfo} = useWalletInfo();

  return walletInfo ? (
    <FlexView style={style} alignItems="center">
      <Text variant="small-600" style={styles.label}>
        Connected to
      </Text>
      <FlexView flexDirection="row" alignItems="center">
        {walletInfo?.icons?.[0] && (
          <Image style={styles.logo} source={{uri: walletInfo?.icons?.[0]}} />
        )}
        {walletInfo?.name && (
          <Text variant="small-400">{walletInfo?.name}</Text>
        )}
      </FlexView>
    </FlexView>
  ) : null;
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 2,
  },
  logo: {
    width: 20,
    height: 20,
    borderRadius: 5,
    marginRight: 4,
  },
});
