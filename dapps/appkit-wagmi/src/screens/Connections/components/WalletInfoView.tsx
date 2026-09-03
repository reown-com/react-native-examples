import React from 'react';
import { Image, StyleSheet, StyleProp, View, ViewStyle } from 'react-native';
import { useAccount, useWalletInfo } from '@reown/appkit-react-native';
import { FlexView, Text } from '@reown/appkit-ui-react-native';

interface Props {
  style?: StyleProp<ViewStyle>;
}

export function WalletInfoView({ style }: Props) {
  const { walletInfo } = useWalletInfo();
  const { address, chain, isConnected } = useAccount();

  // Gate on isConnected (not walletInfo): after the post-approve redirect reload
  // the session rehydrates (isConnected true) but walletInfo/AppKit metadata may
  // not, so a walletInfo gate would hide the connected state. Maestro uses
  // `dapp-connected` as the connected target and its absence to assert disconnect.
  return isConnected ? (
    // Plain RN View wrapper carries the testID reliably (AppKit-UI components
    // don't guarantee testID forwarding).
    <View testID="dapp-connected">
      <FlexView style={style} alignItems="center">
        <Text variant="small-600" style={styles.label}>
          Connected to
        </Text>
        <FlexView flexDirection="row" alignItems="center">
          {walletInfo?.icons?.[0] && (
            <Image style={styles.logo} source={{ uri: walletInfo?.icons?.[0] }} />
          )}
          {walletInfo?.name && <Text variant="small-400">{walletInfo?.name}</Text>}
        </FlexView>
        {address && <Text testID="connected-address" numberOfLines={1} ellipsizeMode="middle" style={styles.address} variant="small-400">{`Address: ${address}`}</Text>}
        {chain?.name && <Text testID="connected-chain" numberOfLines={1} variant="small-400">{`Chain: ${chain.name}`}</Text>}
      </FlexView>
    </View>
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
  address: {
    maxWidth: '70%',
  },
});
