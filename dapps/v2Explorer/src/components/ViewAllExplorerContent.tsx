import React, {useRef, useEffect} from 'react';
import {Animated, StyleSheet, ScrollView, useColorScheme} from 'react-native';
import {ExplorerItem} from './ExplorerItem';

import NavigationHeader from './NavigationHeader';

interface ViewAllExplorerContentProps {
  isLoading: boolean;
  explorerData: any;
  onBackPress: () => void;
  currentWCURI: string;
}

export const ViewAllExplorerContent = ({
  isLoading,
  explorerData,
  onBackPress,
  currentWCURI,
}: ViewAllExplorerContentProps) => {
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
    <Animated.View style={{opacity: fadeAnim}}>
      <>
        <NavigationHeader
          title="Connect your Wallet"
          onBackPress={onBackPress}
        />
        {/* TODO: Refactor with Flatlist */}
        <ScrollView
          scrollEnabled={true}
          contentContainerStyle={styles.scrollExplorerContainer}
          bounces
          showsVerticalScrollIndicator
          indicatorStyle={isDarkMode ? 'white' : 'black'}>
          <ExplorerItem
            isLoading={isLoading}
            explorerData={explorerData}
            currentWCURI={currentWCURI}
          />
        </ScrollView>
      </>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  scrollExplorerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
    paddingHorizontal: 4,
  },
});
