import * as React from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';

interface ViewAllBoxProps {
  open: () => void;
}

export const ViewAllBox = ({open}: ViewAllBoxProps) => {
  return (
    <TouchableOpacity onPress={() => open()} style={styles.explorerItem}>
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
    backgroundColor: 'grey',
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
