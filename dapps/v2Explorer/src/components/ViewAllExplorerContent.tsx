import React, {useRef, useEffect} from 'react';
import {
  Animated,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  useColorScheme,
} from 'react-native';
import {ExplorerItem} from './ExplorerItem';
import Chevron from '../assets/Chevron.png';

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
        <View style={styles.sectionContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress}
            hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
            <Image style={styles.chevronIcon} source={Chevron} />
          </TouchableOpacity>
          <Text
            style={[
              styles.sectionTitle,
              isDarkMode && styles.sectionTitleDark,
            ]}>
            Connect your wallet
          </Text>

          <View style={styles.backButton} />
        </View>
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
  sectionContainer: {
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 18,
    height: 18,
  },
  chevronIcon: {
    width: 8,
    height: 18,
  },
  scrollExplorerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#1f1f1f',
    fontSize: 20,
    lineHeight: 24,
  },
  sectionTitleDark: {
    color: 'white',
  },
});
