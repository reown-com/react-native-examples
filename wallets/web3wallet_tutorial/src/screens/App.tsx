import "fast-text-encoding";
import "@walletconnect/react-native-compat";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { registerRootComponent } from "expo";
import { SignClientTypes, SessionTypes } from "@walletconnect/types";
import { getSdkError } from "@walletconnect/utils";

import useInitialization, {
  currentETHAddress,
  web3wallet,
  web3WalletPair,
} from "../utils/WalletConnectUtils";
import React, { useCallback, useEffect, useState } from "react";
import PairingModal from "./PairingModal";
import { EIP155_SIGNING_METHODS } from "../utils/EIP155Lib";
import SignModal from "./SignModal";

export default function App() {
  useInitialization();

  const [modalVisible, setModalVisible] = useState(false);
  const [signModalVisible, setSignModalVisible] = useState(false);
  const [successfulSession, setSuccessfulSession] = useState(false);

  const [currentWCURI, setCurrentWCURI] = useState("");
  const [currentProposal, setCurrentProposal] = useState();

  const [requestSession, setRequestSession] = useState();
  const [requestEventData, setRequestEventData] = useState();

  async function pair() {
    const pairing = await web3WalletPair({ uri: currentWCURI });
    return pairing;
  }

  const onSessionProposal = useCallback(
    (proposal: SignClientTypes.EventArguments["session_proposal"]) => {
      setModalVisible(true);
      setCurrentProposal(proposal);
    },
    []
  );

  async function handleAccept() {
    const { id, params } = currentProposal;
    const { requiredNamespaces, relays } = params;

    if (currentProposal) {
      const namespaces: SessionTypes.Namespaces = {};
      Object.keys(requiredNamespaces).forEach((key) => {
        const accounts: string[] = [];
        requiredNamespaces[key].chains.map((chain) => {
          [currentETHAddress].map((acc) => accounts.push(`${chain}:${acc}`));
        });

        namespaces[key] = {
          accounts,
          methods: requiredNamespaces[key].methods,
          events: requiredNamespaces[key].events,
        };
      });

      await web3wallet.approveSession({
        id,
        relayProtocol: relays[0].protocol,
        namespaces,
      });

      setModalVisible(false);
      setCurrentWCURI("");
      setCurrentProposal(undefined);
      setSuccessfulSession(true);
    }
  }

  async function disconnect() {
    const activeSessions = await web3wallet.getActiveSessions();
    const topic = Object.values(activeSessions)[0].topic;

    if (activeSessions) {
      await web3wallet.disconnectSession({
        topic,
        reason: getSdkError("USER_DISCONNECTED"),
      });
    }
    setSuccessfulSession(false);
  }

  async function handleReject() {
    const { id } = currentProposal;

    if (currentProposal) {
      await web3wallet.rejectSession({
        id,
        reason: getSdkError("USER_REJECTED_METHODS"),
      });

      setModalVisible(false);
      setCurrentWCURI("");
      setCurrentProposal(undefined);
    }
  }

  const onSessionRequest = useCallback(
    async (requestEvent: SignClientTypes.EventArguments["session_request"]) => {
      const { topic, params } = requestEvent;
      const { request } = params;
      const requestSessionData =
        web3wallet.engine.signClient.session.get(topic);

      switch (request.method) {
        case EIP155_SIGNING_METHODS.ETH_SIGN:
        case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
          setRequestSession(requestSessionData);
          setRequestEventData(requestEvent);
          setSignModalVisible(true);
          return;
      }
    },
    []
  );

  useEffect(() => {
    web3wallet?.on("session_proposal", onSessionProposal);
    web3wallet?.on("session_request", onSessionRequest);
  }, [
    pair,
    handleAccept,
    handleReject,
    currentETHAddress,
    onSessionRequest,
    onSessionProposal,
    successfulSession,
  ]);

  return (
    <View style={styles.container}>
      <View style={styles.container}>
        <Text>Web3Wallet Tutorial</Text>
        <Text style={styles.addressContent}>
          ETH Address: {currentETHAddress ? currentETHAddress : "Loading..."}
        </Text>

        {!successfulSession ? (
          <View>
            <TextInput
              style={styles.textInputContainer}
              onChangeText={setCurrentWCURI}
              value={currentWCURI}
              placeholder="Enter WC URI (wc:1234...)"
            />
            <Button onPress={() => pair()} title="Pair Session" />
          </View>
        ) : (
          <Button onPress={() => disconnect()} title="Disconnect" />
        )}
      </View>

      <PairingModal
        handleAccept={handleAccept}
        handleReject={handleReject}
        visible={modalVisible}
        setModalVisible={setModalVisible}
        currentProposal={currentProposal}
      />

      <SignModal
        visible={signModalVisible}
        setModalVisible={setSignModalVisible}
        requestEvent={requestEventData}
        requestSession={requestSession}
      />
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
    bottom: 0,
  },
  textInputContainer: {
    height: 40,
    width: 250,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
    marginVertical: 10,
    padding: 4,
  },
  addressContent: {
    textAlign: "center",
    marginVertical: 8,
  },
});

registerRootComponent(App);
