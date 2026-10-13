import {
  router,
  UnknownOutputParams,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import { Image } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/button";
import HeaderImage from "@/components/header-image";
import { Pressable as ScalePressable } from "@/components/pressable";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useIsTablet } from "@/hooks/use-is-tablet";
import { useTheme } from "@/hooks/use-theme-color";
import { useSendReceipt } from "@/services/hooks";
import { useLogsStore } from "@/store/useLogsStore";
import { isValidEmail } from "@/utils/email";
import { showErrorToast, showSuccessToast, showToast } from "@/utils/toast";
import { webInputReset } from "@/utils/web-input-reset";

interface EmailReceiptParams extends UnknownOutputParams {
  paymentId: string;
}

export default function EmailReceiptScreen() {
  const Theme = useTheme();
  const isTablet = useIsTablet();
  const { top, bottom } = useSafeAreaInsets();
  const { paymentId = "" } =
    useLocalSearchParams<EmailReceiptParams>() as Partial<EmailReceiptParams>;
  const navigation = useNavigation();
  const addLog = useLogsStore((state) => state.addLog);
  const { mutateAsync: sendReceipt, isPending } = useSendReceipt();

  const [email, setEmail] = useState("");
  const [hasError, setHasError] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isSendingRef = useRef(false);

  const bottomSpacing = Math.max(
    bottom + Spacing["spacing-3"],
    Spacing["spacing-5"],
  );
  const isSubmitDisabled = !email.trim() || hasError || isPending;

  const handleClose = () => {
    if (isSendingRef.current) return;
    router.back();
  };

  // payment-success stays mounted underneath and blocks the Android back
  // button; the most recently added listener runs first, so take over here.
  useEffect(() => {
    if (Platform.OS !== "android") return;
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (!isSendingRef.current) router.back();
        return true;
      },
    );
    return () => backHandler.remove();
  }, []);

  const handleChangeText = (text: string) => {
    setEmail(text);
    if (hasError) setHasError(false);
  };

  const handleClear = () => {
    setEmail("");
    setHasError(false);
  };

  const handleSend = async () => {
    if (isSendingRef.current || !email.trim()) return;
    if (!isValidEmail(email)) {
      setHasError(true);
      return;
    }

    isSendingRef.current = true;
    showToast({
      type: "loading",
      message: "Sending receipt…",
      autoHide: false,
    });
    try {
      await sendReceipt({ paymentId, email: email.trim() });
      showSuccessToast("Receipt sent");
      // The merchant may have swiped back (iOS) while the request was in
      // flight; popping again would leave the payment-success screen.
      if (navigation.isFocused()) router.back();
    } catch (error) {
      // Log only the status/code: the server message can echo the email.
      const { status, code } = (error ?? {}) as {
        status?: number;
        code?: string;
      };
      addLog("error", "Failed to send receipt", "email-receipt", "handleSend", {
        status,
        code,
      });
      showErrorToast("Couldn't send receipt. Try again.");
    } finally {
      isSendingRef.current = false;
    }
  };

  const borderColor = hasError
    ? Theme["icon-error"]
    : isFocused
      ? Theme["border-accent-primary"]
      : Theme["border-primary"];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: Theme["bg-primary"] }]}
      // Padding on Android too: older versions (e.g. Android 10) don't resize
      // the window for the keyboard under edge-to-edge. Where the window does
      // resize, the keyboard no longer overlaps the view, so no padding is added.
      behavior="padding"
    >
      <View
        style={[
          styles.content,
          isTablet && styles.contentTablet,
          {
            paddingTop: top + Spacing["spacing-3"],
            paddingBottom: bottomSpacing,
          },
        ]}
      >
        <View style={styles.header}>
          <ScalePressable
            testID="email-receipt-close"
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={handleClose}
            disabled={isPending}
            style={[
              styles.closeButton,
              { borderColor: Theme["border-secondary"] },
            ]}
          >
            <Image
              source={require("@/assets/images/close.png")}
              style={styles.closeIcon}
              tintColor={Theme["text-primary"]}
              cachePolicy="memory-disk"
            />
          </ScalePressable>
          <HeaderImage tintColor={Theme["text-primary"]} />
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.form}>
          <ThemedText
            fontSize={isTablet ? 24 : 18}
            lineHeight={isTablet ? 28 : 20}
            color="text-primary"
            style={styles.title}
          >
            Enter customer email
          </ThemedText>
          <View>
            <View
              style={[
                styles.inputContainer,
                {
                  borderColor,
                  backgroundColor: Theme["foreground-primary"],
                },
              ]}
            >
              <TextInput
                testID="email-receipt-input"
                value={email}
                onChangeText={handleChangeText}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onSubmitEditing={handleSend}
                placeholder="Customer email"
                placeholderTextColor={Theme["text-tertiary"]}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="go"
                editable={!isPending}
                autoFocus
                style={[
                  styles.input,
                  webInputReset,
                  { color: Theme["text-primary"] },
                ]}
              />
              {email.length > 0 && !isPending && (
                <ScalePressable
                  testID="email-receipt-clear"
                  accessibilityRole="button"
                  accessibilityLabel="Clear email"
                  onPress={handleClear}
                  style={styles.clearButton}
                >
                  <View
                    style={[
                      styles.clearCircle,
                      { backgroundColor: Theme["text-secondary"] },
                    ]}
                  >
                    <Image
                      source={require("@/assets/images/close.png")}
                      style={styles.clearIcon}
                      tintColor={Theme["bg-primary"]}
                      cachePolicy="memory-disk"
                    />
                  </View>
                </ScalePressable>
              )}
            </View>
            {hasError && (
              <ThemedText
                testID="email-receipt-error"
                fontSize={14}
                lineHeight={18}
                color="icon-error"
                style={styles.errorText}
              >
                Enter a valid email address
              </ThemedText>
            )}
          </View>
        </View>

        <Button
          type="accent"
          variant="primary"
          testID="email-receipt-submit"
          size={isTablet ? "lg" : "md"}
          onPress={handleSend}
          disabled={isSubmitDisabled}
        >
          Email receipt
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    width: "100%",
    paddingHorizontal: Spacing["spacing-5"],
  },
  contentTablet: {
    paddingHorizontal: Spacing["spacing-8"],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerSpacer: {
    width: 38,
    height: 38,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius["3"],
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  closeIcon: {
    width: 20,
    height: 20,
  },
  form: {
    flex: 1,
    gap: Spacing["spacing-5"],
    paddingTop: Spacing["extra-spacing-1"],
  },
  title: {
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 60,
    borderWidth: 1,
    borderRadius: BorderRadius["4"],
    paddingHorizontal: Spacing["spacing-5"],
    gap: Spacing["spacing-3"],
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    fontFamily: "KH Teka",
  },
  clearButton: {
    width: 32,
    height: 32,
    marginRight: -Spacing["spacing-2"],
    alignItems: "center",
    justifyContent: "center",
  },
  clearCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  clearIcon: {
    width: 10,
    height: 10,
  },
  errorText: {
    marginTop: Spacing["spacing-2"],
  },
});
