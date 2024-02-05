import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';

import {useTheme} from '../hooks/useTheme';

export function LoadingModal() {
  const Theme = useTheme();
  return (
    <View style={[styles.container, {backgroundColor: Theme['bg-125']}]}>
      <ActivityIndicator size="large" color={Theme['accent-100']} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 34,
    width: '100%',
    height: '30%',
    padding: 16,
    backgroundColor: 'red',
  },
});
