import React, {useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  Animated,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import ExplorerItem from './ExplorerItem';
import {ViewAllBox} from './ViewAllBox';
import QRIcon from '../assets/QR.png';
import NavigationHeader from './NavigationHeader';
import {WalletInfo} from '../types/api';
import {DEVICE_HEIGHT} from '../constants/Platform';

interface InitialExplorerContentProps {
  isLoading: boolean;
  explorerData: any;
  onViewAllPress: () => void;
  currentWCURI: string;
  onQRPress: () => void;
}

export const InitialExplorerContent = ({
  isLoading,
  explorerData,
  onViewAllPress,
  currentWCURI,
  onQRPress,
}: InitialExplorerContentProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.container, {opacity: fadeAnim}]}>
      <NavigationHeader
        title="Connect your Wallet"
        onActionPress={onQRPress}
        actionIcon={QRIcon}
        actionIconStyle={styles.qrIcon}
      />
      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={isDarkMode ? 'white' : 'black'} />
        </View>
      ) : (
        <View style={styles.explorerContainer}>
          {explorerData.map((item: WalletInfo) => (
            <ExplorerItem
              walletInfo={item}
              key={item.id}
              currentWCURI={currentWCURI}
            />
          ))}
          <ViewAllBox onPress={onViewAllPress} />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    // TODO: Use safearea insets to make sure the content is not covered by the bottom bar in iOS
    paddingBottom: 12,
  },
  explorerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  loader: {
    height: DEVICE_HEIGHT * 0.2,
    justifyContent: 'center',
  },
  qrIcon: {
    height: 24,
    width: 24,
  },
});
