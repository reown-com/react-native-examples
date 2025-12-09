import { MerchantAccounts } from "@/api/merchant";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { memo } from "react";
import { Modal, Pressable, StyleSheet, View, TouchableOpacity } from "react-native";
import { MerchantAddressRow } from "./merchant-address-row";
import { ThemedText } from "./themed-text";

interface MerchantConfirmModalProps {
  visible: boolean;
  merchantId: string;
  merchantAccounts: MerchantAccounts | null;
  onConfirm: () => void;
  onCancel: () => void;
  isFirstSetup: boolean;
}

function MerchantConfirmModalBase({
  visible,
  merchantId,
  merchantAccounts,
  onConfirm,
  onCancel,
  isFirstSetup,
}: MerchantConfirmModalProps) {
  const theme = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable
          style={[styles.container, { backgroundColor: theme["bg-primary"] }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View
            style={[
              styles.warningBadge,
              { backgroundColor: theme["bg-accent-primary"] + "20" },
            ]}
          >
            <ThemedText fontSize={24} style={styles.warningIcon}>
              ⚠️
            </ThemedText>
          </View>

          <ThemedText
            fontSize={18}
            lineHeight={22}
            color="text-primary"
            style={styles.title}
          >
            {isFirstSetup ? "Set Merchant ID" : "Change Merchant ID"}
          </ThemedText>

          <ThemedText
            fontSize={14}
            lineHeight={18}
            color="text-secondary"
            style={styles.subtitle}
          >
            {isFirstSetup
              ? "Please verify the liquidation addresses below are correct. All payments will be sent to these addresses."
              : "You are about to change where funds are sent. Please verify the new liquidation addresses carefully."}
          </ThemedText>

          <View
            style={[
              styles.merchantIdBox,
              { backgroundColor: theme["foreground-secondary"] },
            ]}
          >
            <ThemedText
              fontSize={12}
              lineHeight={14}
              color="text-tertiary"
              style={styles.label}
            >
              Merchant ID
            </ThemedText>
            <ThemedText
              fontSize={14}
              lineHeight={16}
              color="text-primary"
              style={styles.merchantIdValue}
            >
              {merchantId}
            </ThemedText>
          </View>

          {merchantAccounts && (
            <View style={styles.addressesContainer}>
              <ThemedText
                fontSize={12}
                lineHeight={14}
                color="text-tertiary"
                style={styles.label}
              >
                Funds will be sent to:
              </ThemedText>
              <View style={styles.addressesList}>
                <MerchantAddressRow
                  label="EVM"
                  value={merchantAccounts.liquidationAddress}
                />
                <MerchantAddressRow
                  label="Solana"
                  value={merchantAccounts.solanaLiquidationAddress}
                />
              </View>
            </View>
          )}

          {!isFirstSetup && (
            <View
              style={[
                styles.warningBox,
                { backgroundColor: theme["icon-error"] + "15" },
              ]}
            >
              <ThemedText
                fontSize={12}
                lineHeight={16}
                style={[styles.warningText, { color: theme["icon-error"] }]}
              >
                Changing the merchant ID will redirect all future payments to
                different addresses. Only proceed if you are authorized to make
                this change.
              </ThemedText>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={onCancel}
              activeOpacity={0.7}
              style={[
                styles.button,
                styles.cancelButton,
                { backgroundColor: theme["foreground-secondary"] },
              ]}
            >
              <ThemedText fontSize={14} lineHeight={16} color="text-primary">
                Cancel
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              activeOpacity={0.7}
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: theme["bg-accent-primary"] },
              ]}
            >
              <ThemedText fontSize={14} lineHeight={16} color="text-white">
                {isFirstSetup ? "Confirm & Set PIN" : "Confirm Change"}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export const MerchantConfirmModal = memo(MerchantConfirmModalBase);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    maxWidth: 380,
    borderRadius: BorderRadius["5"],
    padding: Spacing["spacing-6"],
    alignItems: "center",
  },
  warningBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing["spacing-4"],
  },
  warningIcon: {
    textAlign: "center",
  },
  title: {
    fontWeight: "600",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginTop: Spacing["spacing-2"],
    paddingHorizontal: Spacing["spacing-2"],
  },
  merchantIdBox: {
    width: "100%",
    padding: Spacing["spacing-4"],
    borderRadius: BorderRadius["3"],
    marginTop: Spacing["spacing-5"],
  },
  label: {
    marginBottom: Spacing["spacing-1"],
  },
  merchantIdValue: {
    fontWeight: "500",
  },
  addressesContainer: {
    width: "100%",
    marginTop: Spacing["spacing-4"],
  },
  addressesList: {
    gap: Spacing["spacing-2"],
    marginTop: Spacing["spacing-2"],
  },
  warningBox: {
    width: "100%",
    padding: Spacing["spacing-3"],
    borderRadius: BorderRadius["2"],
    marginTop: Spacing["spacing-4"],
  },
  warningText: {
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: Spacing["spacing-3"],
    marginTop: Spacing["spacing-5"],
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: Spacing["spacing-4"],
    borderRadius: BorderRadius["3"],
    alignItems: "center",
  },
  cancelButton: {},
  confirmButton: {},
});
