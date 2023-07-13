import React from 'react';

import { SafeAreaView, StyleSheet, Text } from 'react-native';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text>Test</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default App;
