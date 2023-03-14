import * as React from 'react';
import {
  Image,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';

import ViewAllIcon from '../assets/ViewAll.png';

interface ViewAllBoxProps {
  setViewAllContentVisible: any;
}

export const ViewAllBox = ({setViewAllContentVisible}: ViewAllBoxProps) => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <TouchableOpacity
      onPress={() => setViewAllContentVisible(true)}
      style={styles.explorerItem}>
      <Image style={styles.explorerIcon} source={ViewAllIcon} />
      <View>
        <Text
          style={[
            styles.explorerIconText,
            isDarkMode && styles.explorerIconTextDark,
          ]}
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
    color: '#1f1f1f',
    marginVertical: 8,
    maxWidth: 100,
    fontWeight: '600',
    fontSize: 12,
  },
  explorerIconTextDark: {
    color: 'white',
  },
});
