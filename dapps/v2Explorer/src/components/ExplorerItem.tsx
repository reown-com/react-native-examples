import React from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import {WalletInfo} from '../types/api';
import {navigateDeepLink} from '../utils/ExplorerUtils';

interface ExplorerItemProps {
  currentWCURI: string;
  walletInfo: WalletInfo;
}

export const ITEM_HEIGHT = 80;

function ExplorerItem({currentWCURI, walletInfo}: ExplorerItemProps) {
  const isDarkMode = useColorScheme() === 'dark';

  const onPress = () => {
    navigateDeepLink(
      walletInfo.mobile.universal,
      walletInfo.mobile.native,
      currentWCURI,
    );
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      key={walletInfo.id}
      style={styles.container}>
      <Image style={styles.icon} source={{uri: walletInfo.image_url.md}} />
      <Text
        style={[styles.name, isDarkMode && styles.nameDark]}
        numberOfLines={1}>
        {walletInfo.name}
      </Text>
      {walletInfo.isInstalled ? (
        <Text
          style={[
            styles.installedText,
            isDarkMode && styles.installedTextDark,
          ]}>
          Installed
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '25%',
    height: 80,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginVertical: 16,
  },
  icon: {
    height: 60,
    width: 60,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  name: {
    color: '#1F1F1F',
    marginTop: 5,
    maxWidth: 100,
    fontSize: 12,
    fontWeight: '600',
  },
  nameDark: {
    color: 'white',
  },
  installedText: {
    color: '#9EA9A9',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  installedTextDark: {
    color: '#6E7777',
  },
});

export default ExplorerItem;
