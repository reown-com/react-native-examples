import React, {useEffect, useRef} from 'react';
import {StyleSheet, View, Text, Animated} from 'react-native';
import {ExplorerItem} from './ExplorerItem';
import {ViewAllBox} from './ViewAllBox';

interface InitialExplorerContentProps {
  isLoading: boolean;
  explorerData: any;
  openViewAllContent: () => void;
}

export const InitialExplorerContent = ({
  isLoading,
  explorerData,
  openViewAllContent,
}: InitialExplorerContentProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={{opacity: fadeAnim}}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Connect your wallet</Text>
      </View>
      <View style={styles.explorerContainer}>
        <ExplorerItem isLoading={isLoading} explorerData={explorerData} />
        <ViewAllBox open={openViewAllContent} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sectionTitleContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    color: 'white',
    fontSize: 20,
    lineHeight: 24,
  },
  explorerContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
});
