import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { registerRootComponent } from "expo";

// @ts-expect-error - `@env` is a virtualised module via Babel config
import { ENV_PROJECT_ID, ENV_RELAY_URL } from "@env";
import useInitialization from "../utils/WalletConnectUtils";

export default function App() {
  const initalized = useInitialization();

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text>Web3Wallet Tutorial</Text>
      <Text>Initialized: {initalized ? "true" : "false"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

registerRootComponent(App);
