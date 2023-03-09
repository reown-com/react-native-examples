import React, {useEffect, useRef} from 'react';
import {StyleSheet, View, Text, Animated, useColorScheme} from 'react-native';
import {ExplorerItem} from './ExplorerItem';
import {ViewAllBox} from './ViewAllBox';

interface InitialExplorerContentProps {
  isLoading: boolean;
  explorerData: any;
  setViewAllContentVisible: () => void;
}

export const InitialExplorerContent = ({
  isLoading,
  explorerData,
  setViewAllContentVisible,
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
      </View>
      <View style={styles.explorerContainer}>
        <ExplorerItem isLoading={isLoading} explorerData={explorerData} />
        <ViewAllBox setViewAllContentVisible={setViewAllContentVisible} />
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
});
