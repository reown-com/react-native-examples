import React from 'react';
import { Image, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useAccount, useWalletInfo } from '@reown/appkit-react-native';
import { FlexView, Text } from '@reown/appkit-ui-react-native';

interface Props {
  style?: StyleProp<ViewStyle>;
}

export function WalletInfoView({ style }: Props) {
  const { walletInfo } = useWalletInfo();
  const { address, chain } = useAccount();

  return walletInfo ? (
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
        {address && <Text numberOfLines={1} ellipsizeMode="middle" style={styles.address} variant="small-400">Address: {address}</Text>}
        {chain?.name && <Text numberOfLines={1} variant="small-400">Chain: {chain.name}</Text>}
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
  address: {
    maxWidth: '70%',
  },
});
