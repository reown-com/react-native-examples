import * as React from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';

export const ViewAllBox = () => {
  return (
    <TouchableOpacity
      onPress={() => console.log('hi')}
      style={styles.explorerItem}>
      <View style={styles.explorerIcon} />
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
    backgroundColor: '#FFFFFF',
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
