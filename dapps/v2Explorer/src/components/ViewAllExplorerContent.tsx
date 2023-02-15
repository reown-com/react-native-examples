import * as React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import {ExplorerItem} from './ExplorerItem';

interface ViewAllExplorerContentProps {
  isLoading: boolean;
  explorerData: any;
  openViewAllContent: () => void;
  setViewAllContentVisible: (value: boolean) => void;
}

export const ViewAllExplorerContent = ({
  isLoading,
  explorerData,
  setViewAllContentVisible,
}: ViewAllExplorerContentProps) => {
  return (
    <View>
      <View style={styles.sectionBackContainer}>
        <TouchableOpacity
          style={styles.twentyWidth}
          onPress={() => setViewAllContentVisible(false)}
          hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
          <Image
            style={styles.chevronImage}
            source={require('../assets/Chevron.png')}
          />
        </TouchableOpacity>
        <View style={styles.sixtyWidth}>
          <Text style={styles.sectionTitle}>Connect your wallet</Text>
        </View>
        <View style={styles.twentyWidth} />
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollExplorerContainer}
        bounces
        indicatorStyle="white">
        <ExplorerItem isLoading={isLoading} explorerData={explorerData} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionBackContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  chevronImage: {
    width: 8,
    height: 18,
  },
  twentyWidth: {
    width: '20%',
  },
  sixtyWidth: {
    width: '60%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollExplorerContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  sectionTitle: {
    fontWeight: '600',
    color: 'white',
    fontSize: 20,
    lineHeight: 24,
  },
});
