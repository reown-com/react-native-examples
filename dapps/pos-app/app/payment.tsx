import { NumericKeyboard } from "@/components/numeric-keyboard";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTheme } from "@/hooks/use-theme-color";
import { getAvailableNetworks, Network, TokenKey } from "@/utils/networks";
import { showErrorToast } from "@/utils/toast";
import { useAccount } from "@reown/appkit-react-native";
import { router } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";

interface FormData {
  amount: string;
  token: TokenKey;
  networkName: string;
}

export default function PaymentScreen() {
  const { allAccounts } = useAccount();
  const Theme = useTheme();
  const availabeNetworks = getAvailableNetworks(
    allAccounts?.map((account) => account.chainId) || [],
  );

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      amount: "0",
      token: Object.keys(availabeNetworks[0]?.tokens || {})[0] as TokenKey,
      networkName: availabeNetworks[0]?.name || "",
    },
  });

  const watchAmount = watch("amount");
  const watchedToken = watch("token");
  const watchedNetwork = watch("networkName");
  const selectedNetwork = availabeNetworks.find(
    (network) => network.name === watchedNetwork,
  );

  const availableTokens = Object.keys(
    selectedNetwork?.tokens || {},
  ) as TokenKey[];

  const onNetworkChange = (network: Network) => {
    setValue("networkName", network.name);
    const networkData = availabeNetworks.find(
      (n) => String(n.id) === String(network.id),
    );

    if (Object.keys(networkData?.tokens || {}).includes(getValues("token"))) {
      return;
    }

    setValue("token", Object.keys(networkData?.tokens || {})[0] as TokenKey);
  };

  const onSubmit = (data: FormData) => {
    const networkData = availabeNetworks.find(
      (network) => network.name === data.networkName,
    );
    const recipientAddress = allAccounts?.find(
      (account) => account.chainId === String(networkData?.id),
    )?.address;

    if (!recipientAddress) {
      showErrorToast({
        title: "No valid recipient address found",
        message: "Please select another chain",
      });
      return;
    }

    let amount = data.amount.replace(",", ".");
    if (amount.endsWith(".")) {
      amount = amount.slice(0, -1);
    }

    router.push({
      pathname: "/scan",
      params: {
        amount,
        token: data.token,
        networkName: data.networkName,
        recipientAddress,
      },
    });
  };

  console.log("errors", errors);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <>
          {/* Amount Input */}
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Amount to Pay</ThemedText>
            <ThemedText
              style={[
                styles.input,
                { color: Theme.text, borderColor: Theme.border },
              ]}
            >
              ${watchAmount}
            </ThemedText>
            {errors.amount && (
              <ThemedText style={[styles.errorText, { color: Theme.error }]}>
                {errors.amount.message}
              </ThemedText>
            )}
          </ThemedView>

          {/* Network Selector */}
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Select Network</ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.buttonContainer}
            >
              {availabeNetworks.map((network) => (
                <TouchableOpacity
                  key={network.id}
                  style={[
                    styles.optionButton,
                    {
                      borderColor: Theme.border,
                      backgroundColor:
                        watchedNetwork === network.name
                          ? Theme.primary
                          : Theme.background,
                    },
                  ]}
                  onPress={() => {
                    onNetworkChange(network);
                  }}
                >
                  <ThemedText
                    style={[
                      styles.optionButtonText,
                      watchedNetwork === network.name &&
                        styles.optionButtonTextSelected,
                      {
                        color:
                          watchedNetwork === network.name
                            ? "white"
                            : Theme.text,
                      },
                    ]}
                  >
                    {network.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ThemedView>

          {/* Token Selector */}
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Select Token</ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.buttonContainer}
            >
              {availableTokens.map((token) => (
                <TouchableOpacity
                  key={token}
                  style={[
                    styles.optionButton,
                    {
                      borderColor: Theme.border,
                      backgroundColor:
                        watchedToken === token
                          ? Theme.primary
                          : Theme.background,
                    },
                  ]}
                  onPress={() => setValue("token", token as TokenKey)}
                >
                  <ThemedText
                    style={[
                      styles.optionButtonText,
                      watchedToken === token && styles.optionButtonTextSelected,
                      { color: watchedToken === token ? "white" : Theme.text },
                    ]}
                  >
                    {token}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ThemedView>

          {/* Amount Keyboard */}
          <ThemedView style={styles.section}>
            <ThemedView
              style={[styles.dividerLine, { backgroundColor: Theme.gray500 }]}
            />
            <Controller
              control={control}
              name="amount"
              rules={{
                validate: (value) => {
                  console.log("validate function called with:", value);
                  if (!value || value === "0") {
                    return "Amount is required";
                  }
                  return true;
                },
              }}
              render={({ field: { onChange, value: prev } }) => (
                <NumericKeyboard
                  onKeyPress={(key) => {
                    if (key === "erase") {
                      const newDisplay = prev?.slice(0, -1) || "";
                      onChange?.(newDisplay.replace(",", "."));
                    } else if (key === ",") {
                      if (prev.includes(",") || prev.includes(".")) return; // Don't add multiple commas
                      const newDisplay = prev + ",";
                      onChange?.(newDisplay.replace(",", "."));
                    } else {
                      const newDisplay = prev === "0" ? key : prev + key;
                      onChange?.(newDisplay.replace(",", "."));
                    }
                  }}
                />
              )}
            />
          </ThemedView>

          <TouchableOpacity
            style={[
              styles.generateButton,
              {
                backgroundColor: Theme.primary,
                shadowColor: Theme.primary,
              },
            ]}
            onPress={handleSubmit(onSubmit)}
          >
            <IconSymbol name="qrcode" size={20} color="white" />
            <ThemedText style={styles.generateButtonText}>
              Generate QR Code
            </ThemedText>
          </TouchableOpacity>
        </>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    fontSize: 32,
    fontWeight: "bold",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 20,
    margin: 0,
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    marginTop: 5,
  },
  buttonContainer: {
    marginTop: 10,
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 25,
    borderWidth: 1,
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  optionButtonTextSelected: {
    color: "white",
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    borderRadius: 12,
    marginTop: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  generateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  dividerLine: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#ddd",
    marginBottom: 12,
  },
});
