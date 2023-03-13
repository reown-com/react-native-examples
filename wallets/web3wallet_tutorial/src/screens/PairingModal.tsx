import { Button, Image, Modal, StyleSheet, Text, View } from "react-native";
import { SignClientTypes } from "@walletconnect/types";

interface PairingModalProps {
  visible: boolean;
  setModalVisible: (arg1: boolean) => void;
  currentProposal:
    | SignClientTypes.EventArguments["session_proposal"]
    | undefined;
  handleAccept: () => void;
}

export default function PairingModal({
  visible,
  setModalVisible,
  currentProposal,
  handleAccept,
}: PairingModalProps) {
  // CurrentProposal values
  const name = currentProposal?.params?.proposer?.metadata?.name;
  const url = currentProposal?.params?.proposer?.metadata.url;
  const methods = currentProposal?.params?.requiredNamespaces.eip155.methods;
  const events = currentProposal?.params?.requiredNamespaces.eip155.events;
  const chains = currentProposal?.params?.requiredNamespaces.eip155.chains;
  const icon = currentProposal?.params.proposer.metadata.icons[0];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.container}>
        <View style={styles.modalContentContainer}>
          <Image
            style={styles.dappLogo}
            source={{
              uri: icon,
            }}
          />
          <Text>{name}</Text>
          <Text>{url}</Text>

          <Text>Chains: {chains}</Text>

          <View style={{ marginVertical: 8 }}>
            <Text style={{ textAlign: "center" }}>Methods:</Text>
            {methods?.map((method) => (
              <Text key={method}>{method}</Text>
            ))}
          </View>

          <View style={{ marginVertical: 8 }}>
            <Text style={{ textAlign: "center" }}>Events:</Text>
            {events?.map((events) => (
              <Text key={events}>{events}</Text>
            ))}
          </View>

          <View style={{ display: "flex", flexDirection: "row" }}>
            <Button onPress={() => setModalVisible(false)} title="Cancel" />
            <Button onPress={() => handleAccept()} title="Accept" />
          </View>
        </View>
      </View>
    </Modal>
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
    height: "50%",
    position: "absolute",
    backgroundColor: "white",
    // marginBottom: 100,
    bottom: 0,
  },
  dappLogo: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginVertical: 4,
  },
});
