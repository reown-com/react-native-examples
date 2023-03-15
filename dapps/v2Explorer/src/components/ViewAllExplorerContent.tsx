import React, {useRef, useEffect} from 'react';
import {
  Animated,
  StyleSheet,
  useColorScheme,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import ExplorerItem, {ITEM_HEIGHT} from './ExplorerItem';

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
        {isLoading ? (
          <ActivityIndicator />
        ) : (
          <FlatList
            data={explorerData || []}
            contentContainerStyle={styles.listContentContainer}
            indicatorStyle={isDarkMode ? 'white' : 'black'}
            showsVerticalScrollIndicator
            numColumns={4}
            getItemLayout={(data, index) => ({
              length: ITEM_HEIGHT,
              offset: ITEM_HEIGHT * index,
              index,
            })}
            renderItem={({item}) => (
              <ExplorerItem currentWCURI={currentWCURI} walletInfo={item} />
            )}
          />
        )}
      </>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  listContentContainer: {
    paddingBottom: 100,
    paddingHorizontal: 4,
  },
});
