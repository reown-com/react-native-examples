import React, {useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  useColorScheme,
  TouchableOpacity,
  Image,
} from 'react-native';
import {ExplorerItem} from './ExplorerItem';
import {ViewAllBox} from './ViewAllBox';
import QRIcon from '../assets/QR.png';

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
      <View style={styles.sectionTitleContainer}>
        <Text
          style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
          Connect your wallet
        </Text>
        <TouchableOpacity
          onPress={onQRPress}
          style={styles.qrButton}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Image source={QRIcon} style={styles.qrIcon} />
        </TouchableOpacity>
      </View>
      <View style={styles.explorerContainer}>
        <ExplorerItem
          isLoading={isLoading}
          explorerData={explorerData}
          currentWCURI={currentWCURI}
        />
        <ViewAllBox onPress={onViewAllPress} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    // TODO: Use safearea insets to make sure the content is not covered by the bottom bar in iOS
    paddingBottom: 30,
  },
  sectionTitleContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#141414',
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'center',
  },
  sectionTitleDark: {
    color: 'white',
  },
  explorerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  qrButton: {
    position: 'absolute',
    right: 16,
  },
  qrIcon: {
    height: 24,
    width: 24,
  },
});
