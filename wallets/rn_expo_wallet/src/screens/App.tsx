import { registerRootComponent } from "expo";

import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <Text>WalletConnect</Text>
      <Text>Sign V2 Expo Examples</Text>
      <Text>Connected: </Text>
      <Button title="Connect" onPress={() => console.log("hi")} />
    </View>
  );
}

registerRootComponent(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
