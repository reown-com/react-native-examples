import { Button, Image, Modal, StyleSheet, Text, View } from "react-native";
import { SignClientTypes } from "@walletconnect/types";
import { getSignParamsMessage } from "../utils/Helpers";
import {
  approveEIP155Request,
  rejectEIP155Request,
} from "../utils/EIP155Requests";
import { web3wallet } from "../utils/WalletConnectUtils";

interface SignModalProps {
  visible: boolean;
  setModalVisible: (arg1: boolean) => void;
  requestSession: any;
  requestEvent: SignClientTypes.EventArguments["session_request"] | undefined;
}

export default function SignModal({
  visible,
  setModalVisible,
  requestEvent,
  requestSession,
}: SignModalProps) {
  // CurrentProposal values

  if (!requestEvent || !requestSession) return null;

  const chainID = requestEvent?.params?.chainId?.toUpperCase();
  const method = requestEvent?.params?.request?.method;
  const message = getSignParamsMessage(requestEvent?.params?.request?.params);

  const requestName = requestSession?.peer?.metadata?.name;
  const requestIcon = requestSession?.peer?.metadata?.icons[0];
  const requestURL = requestSession?.peer?.metadata?.url;

  const { topic } = requestEvent;

  async function onApprove() {
    if (requestEvent) {
      const response = await approveEIP155Request(requestEvent);
      await web3wallet.respondSessionRequest({
        topic,
        response,
      });
      setModalVisible(false);
    }
  }

  async function onReject() {
    if (requestEvent) {
      const response = rejectEIP155Request(requestEvent);
      await web3wallet.respondSessionRequest({
        topic,
        response,
      });
      setModalVisible(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.container}>
        <View style={styles.modalContentContainer}>
          <Image
            style={styles.dappLogo}
            source={{
              uri: requestIcon,
            }}
          />

          <Text>{requestName}</Text>
          <Text>{requestURL}</Text>

          <Text>{message}</Text>

          <Text>Chains: {chainID}</Text>

          <View style={styles.marginVertical8}>
            <Text style={styles.subHeading}>Method:</Text>
            <Text>{method}</Text>
          </View>

          <View style={{ display: "flex", flexDirection: "row" }}>
            <Button onPress={() => onReject()} title="Cancel" />
            <Button onPress={() => onApprove()} title="Accept" />
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
  marginVertical8: {
    marginVertical: 8,
  },
  subHeading: {
    textAlign: "center",
    fontWeight: "600",
  },
});
