import { W3mButton } from "@web3modal/wagmi-react-native";
import * as React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useAccount, useContractRead, useContractWrite } from "wagmi";
import MintABI from "../../src/abis/MintABI.json";

export default function MintSection() {
  const { address, isConnected } = useAccount();

  const {
    data: nameData,
    isError,
    isLoading,
  } = useContractRead({
    address: "0xe5369d5ead171fe7e53c8bd501032194079dae0f",
    abi: MintABI,
    functionName: "name",
  });

  const {
    data: mintData,
    isLoading: mintingLoading,
    isSuccess,
    write: mint,
  } = useContractWrite({
    address: "0xe5369d5ead171fe7e53c8bd501032194079dae0f",
    abi: MintABI,
    functionName: "safeMint",
    args: [address],
  });

  return (
    <View>
      <Text style={{ textAlign: "center" }}>
        Name of Contract: {"\n"} {!isLoading ? nameData : "Loading..."}
      </Text>
      <View>
        <Pressable
          style={styles.mintButton}
          disabled={isLoading}
          onPress={() => mint?.()}
        >
          <Text style={{ color: "white" }}>Mint</Text>
        </Pressable>
        <Text style={{ textAlign: "center" }}>
          Mint Status:
          {"\n"}
          {isSuccess ? mintData?.hash.substring(0, 10) + "..." : "No data"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mintButton: {
    marginVertical: 10,
    backgroundColor: "#47A1FF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
});
