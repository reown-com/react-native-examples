import * as React from 'react';
import {
  Image,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';

interface ViewAllBoxProps {
  setViewAllContentVisible: any;
}
const viewAllIcon = require('../assets/ViewAll.png');

export const ViewAllBox = ({setViewAllContentVisible}: ViewAllBoxProps) => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <TouchableOpacity
      onPress={() => setViewAllContentVisible(true)}
      style={styles.explorerItem}>
      <Image style={styles.explorerIcon} source={viewAllIcon} />
      <View>
        <Text
          style={
            isDarkMode ? styles.explorerIconText : styles.explorerIconTextBlack
          }
          numberOfLines={1}>
          View All
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  explorerIcon: {
    height: 60,
    width: 60,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  explorerItem: {
    width: '25%',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  explorerIconText: {
    color: 'white',
    marginVertical: 8,
    maxWidth: 100,
  },
  explorerIconTextBlack: {
    color: '#1f1f1f',
    marginVertical: 8,
    maxWidth: 100,
  },
});
