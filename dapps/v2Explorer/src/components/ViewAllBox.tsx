import * as React from 'react';
import {Image, StyleSheet, View, Text, TouchableOpacity} from 'react-native';

interface ViewAllBoxProps {
  open: () => void;
}
const viewAllIcon = require('../assets/ViewAll.png');

export const ViewAllBox = ({open}: ViewAllBoxProps) => {
  return (
    <TouchableOpacity onPress={() => open()} style={styles.explorerItem}>
      <Image style={styles.explorerIcon} source={viewAllIcon} />
      <View>
        <Text style={styles.explorerIconText} numberOfLines={1}>
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
  },
  explorerItem: {
    width: '25%',
    // height: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  explorerIconText: {
    color: 'white',
    marginVertical: 8,
    maxWidth: 100,
  },
});
