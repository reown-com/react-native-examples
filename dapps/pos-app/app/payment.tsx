import { NumericKeyboard } from "@/components/numeric-keyboard";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { getAvailableNetworks, Network, TokenKey } from "@/utils/networks";
import { showErrorToast } from "@/utils/toast";
import { useAccount } from "@reown/appkit-react-native";
import * as Haptics from "expo-haptics";
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setValue("networkName", network.name);
    const networkData = availabeNetworks.find(
      (n) => String(n.id) === String(network.id),
    );

    if (Object.keys(networkData?.tokens || {}).includes(getValues("token"))) {
      return;
    }

    setValue("token", Object.keys(networkData?.tokens || {})[0] as TokenKey);
  };

  const onTokenChange = (token: TokenKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setValue("token", token);
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

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <>
          Amount Container
          {/* <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Amount to Pay</ThemedText>
            <ThemedView
              style={[
                styles.amountContainer,
                { borderColor: Theme["border-primary"] },
              ]}
            >
              <Text
                style={[styles.amountText, { color: Theme["text-primary"] }]}
              >
                ${watchAmount}
              </Text>
              {errors.amount && (
                <Text
                  style={[styles.errorText, { color: Theme["text-error"] }]}
                >
                  {errors.amount.message}
                </Text>
              )}
            </ThemedView>
          </ThemedView> */}
          {/* Network Selector */}
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Select Network</ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.buttonContainer}
              bounces={false}
            >
              {availabeNetworks.map((network) => (
                <TouchableOpacity
                  key={network.id}
                  style={[
                    styles.optionButton,
                    {
                      borderColor: Theme["border-primary"],
                      backgroundColor:
                        watchedNetwork === network.name
                          ? Theme["bg-accent-primary"]
                          : Theme["foreground-primary"],
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
                            ? Theme["text-invert"]
                            : Theme["text-primary"],
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
              bounces={false}
              showsHorizontalScrollIndicator={false}
              style={styles.buttonContainer}
            >
              {availableTokens.map((token) => (
                <TouchableOpacity
                  key={token}
                  style={[
                    styles.optionButton,
                    {
                      borderColor: Theme["border-primary"],
                      backgroundColor:
                        watchedToken === token
                          ? Theme["bg-accent-primary"]
                          : Theme["foreground-primary"],
                    },
                  ]}
                  onPress={() => onTokenChange(token as TokenKey)}
                >
                  <ThemedText
                    style={[
                      styles.optionButtonText,
                      watchedToken === token && styles.optionButtonTextSelected,
                      {
                        color:
                          watchedToken === token
                            ? Theme["text-invert"]
                            : Theme["text-primary"],
                      },
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
              style={[
                styles.dividerLine,
                { backgroundColor: Theme["border-secondary"] },
              ]}
            />
            <Controller
              control={control}
              name="amount"
              rules={{
                validate: (value) => {
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
                backgroundColor: Theme["bg-accent-primary"],
                shadowColor: Theme["bg-accent-primary"],
              },
            ]}
            onPress={handleSubmit(onSubmit)}
          >
            <IconSymbol name="qrcode" size={20} color={Theme["text-invert"]} />
            <ThemedText
              style={[
                styles.generateButtonText,
                { color: Theme["text-invert"] },
              ]}
            >
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
    padding: Spacing["spacing-5"],
  },
  section: {
    marginBottom: Spacing["spacing-6"],
  },
  amountContainer: {
    marginTop: Spacing["spacing-1"],
    borderRadius: BorderRadius["3"],
    paddingVertical: Spacing["spacing-3"],
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["spacing-2"],
    borderWidth: StyleSheet.hairlineWidth,
  },
  amountText: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    marginTop: Spacing["spacing-1"],
  },
  buttonContainer: {
    marginTop: Spacing["spacing-2"],
  },
  optionButton: {
    paddingHorizontal: Spacing["spacing-5"],
    paddingVertical: Spacing["spacing-3"],
    marginRight: Spacing["spacing-2"],
    borderRadius: BorderRadius["full"],
    borderWidth: 1,
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  optionButtonTextSelected: {},
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["spacing-4"],
    borderRadius: BorderRadius["3"],
    marginTop: Spacing["spacing-5"],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: Spacing["spacing-2"],
  },
  dividerLine: {
    height: StyleSheet.hairlineWidth,
    marginBottom: Spacing["spacing-3"],
  },
});
