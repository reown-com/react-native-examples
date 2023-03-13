import { StatusBar } from "expo-status-bar";
import { Button, Modal, StyleSheet, Text, View } from "react-native";
import { registerRootComponent } from "expo";

// @ts-expect-error - `@env` is a virtualised module via Babel config
import { ENV_PROJECT_ID, ENV_RELAY_URL } from "@env";
import useInitialization, { web3WalletPair } from "../utils/WalletConnectUtils";
import { useState } from "react";
import useWalletConnectEventsManager from "../utils/WalletConnectEvents";

export default function App() {
  const initalized = useInitialization();
  useWalletConnectEventsManager(initalized);

  const [modalVisible, setModalVisible] = useState(false);

  /* ToDo:
    1. TextInput for WCURI
        pass in a random address first
        then pass through a mnemonic we created
    2. Button to pair
  */

  const fakeURI =
    "wc:d09761a0da2b478f13e3a2b2667eb545f8bc7d3c8a31a5007ae0defa9ae01a38@2?relay-protocol=irn&symKey=013ec1e9c2cc176af7af862419dc454a457422848a23a5c742dc567cf1661971";
  async function pair() {
    const pairing = await web3WalletPair({ uri: fakeURI });
    return pairing;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <View style={styles.container}>
        <Text>Web3Wallet Tutorial</Text>
        <Text>Initialized: {initalized ? "true" : "false"}</Text>
        <Button onPress={() => setModalVisible(true)} title="Open Modal" />
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.container}>
          <View style={styles.modalContentContainer}>
            <Text>Pairing Modal</Text>
            <Button onPress={() => pair()} title="Pair Session" />
            <Button
              onPress={() => setModalVisible(false)}
              title="Close Modal"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContentContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 34,
    borderWidth: 1,
    width: "100%",
    height: "40%",
    position: "absolute",
    // marginBottom: 100,
    bottom: 0,
  },
});

registerRootComponent(App);
