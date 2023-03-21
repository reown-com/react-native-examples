import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

interface ITagProps {
  value: string;
  grey?: boolean;
}

export function Tag({value, grey}: ITagProps) {
  return (
    <View style={grey ? styles.greyTagContainer : styles.tagContainer}>
      <Text style={grey ? styles.greyMainText : styles.mainText}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tagContainer: {
    backgroundColor: 'rgba(221, 241, 248, 1)',
    minHeight: 26,
    paddingHorizontal: 8,
    paddingTop: 4,
    borderRadius: 28,
    marginRight: 4,
    marginBottom: 8,
  },
  greyTagContainer: {
    backgroundColor: 'rgba(60, 60, 67, 0.33)',
    minHeight: 26,
    paddingHorizontal: 8,
    paddingTop: 4,
    borderRadius: 28,
    marginRight: 10,
    marginBottom: 8,
  },
  mainText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: 'rgba(0, 172, 229, 1)',
  },
  greyMainText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 1)',
  },
  imageContainer: {
    width: 24,
    height: 24,
  },
});
