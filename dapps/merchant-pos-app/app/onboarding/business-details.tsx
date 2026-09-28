import { PrimaryButton } from "@/components/primary-button";
import { ProgressBar } from "@/components/progress-bar";
import { Screen } from "@/components/screen";
import { ScreenHeader } from "@/components/screen-header";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { showErrorToast } from "@/utils/toast";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function BusinessDetailsScreen() {
  const Theme = useTheme();
  const draft = useOnboardingStore();
  const [email, setEmail] = useState(draft.email);
  const [companyName, setCompanyName] = useState(draft.companyName);
  const [logoUri, setLogoUri] = useState<string | undefined>(draft.logoUri);

  const valid = EMAIL_RE.test(email.trim()) && companyName.trim().length > 0;

  const pickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setLogoUri(result.assets[0].uri);
    }
  };

  const onContinue = () => {
    if (!valid) {
      showErrorToast("Enter a valid email and company name");
      return;
    }
    draft.setBusinessDetails({
      email: email.trim(),
      companyName: companyName.trim(),
      logoUri,
    });
    router.push("/onboarding/networks");
  };

  return (
    <Screen>
      <ScreenHeader onBack={() => router.back()} step="1 of 5" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <ProgressBar step={1} total={5} />
          <ThemedText weight="500" style={styles.title}>
            Business details
          </ThemedText>
          <ThemedText color="text-secondary" style={styles.subtitle}>
            Tell us about your business so customers recognise you.
          </ThemedText>

          <TextField
            label="Email address"
            placeholder="you@company.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />
          <TextField
            label="Company name"
            placeholder="e.g. Acme Coffee Co."
            value={companyName}
            onChangeText={setCompanyName}
          />

          <ThemedText color="text-secondary" style={styles.label}>
            Logo
            <ThemedText color="text-tertiary" style={styles.label}>
              {"  (optional)"}
            </ThemedText>
          </ThemedText>
          <Pressable
            onPress={pickLogo}
            style={[
              styles.upload,
              {
                backgroundColor: Theme["foreground-primary"],
                borderColor: Theme["border-primary"],
              },
            ]}
          >
            {logoUri ? (
              <Image source={{ uri: logoUri }} style={styles.logo} />
            ) : (
              <>
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M4 16l4-4 4 4 4-6 4 6"
                    stroke={Theme["icon-default"]}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Rect
                    x={3}
                    y={3}
                    width={18}
                    height={18}
                    rx={3}
                    stroke={Theme["icon-default"]}
                    strokeWidth={1.5}
                  />
                </Svg>
                <ThemedText color="text-secondary" style={styles.uploadText}>
                  Tap to upload square image
                </ThemedText>
              </>
            )}
          </Pressable>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            label="Continue"
            onPress={onContinue}
            disabled={!valid}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: Spacing["spacing-6"],
    paddingTop: Spacing["spacing-2"],
    paddingBottom: Spacing["spacing-6"],
  },
  title: {
    fontSize: 22,
    marginTop: Spacing["spacing-6"],
    marginBottom: Spacing["spacing-2"],
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: Spacing["spacing-7"],
  },
  label: {
    fontSize: 13,
    marginBottom: 6,
  },
  upload: {
    height: 100,
    borderRadius: BorderRadius["4"],
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    overflow: "hidden",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  uploadText: {
    fontSize: 13,
  },
  footer: {
    paddingHorizontal: Spacing["spacing-6"],
    paddingTop: Spacing["spacing-3"],
    paddingBottom: Spacing["spacing-4"],
  },
});
