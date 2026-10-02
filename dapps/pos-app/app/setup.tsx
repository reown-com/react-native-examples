import { usePendingSetupStore } from "@/store/usePendingSetupStore";
import { toSetupPayload } from "@/utils/parse-setup-qr";
import { showErrorToast } from "@/utils/toast";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";

// Target of the `wpay://setup?apiKey=…&merchantId=…` deep link, opened when the
// merchant dashboard's setup QR is scanned with the device's own camera. It
// renders nothing: it hands the payload to settings (same path as the in-app
// scanner) and leaves, so the secret never stays in the route params.
export default function SetupDeepLinkScreen() {
  const { apiKey, merchantId } = useLocalSearchParams<{
    apiKey?: string;
    merchantId?: string;
  }>();
  const setPendingSetup = usePendingSetupStore(
    (state) => state.setPendingSetup,
  );

  useEffect(() => {
    const payload = toSetupPayload(apiKey, merchantId);
    if (!payload) {
      showErrorToast(
        "This setup link is incomplete. Scan the QR from your merchant dashboard again.",
      );
      router.dismissTo("/");
      return;
    }
    setPendingSetup(payload);
    // Reuses the settings screen if it's already in the stack.
    router.dismissTo("/settings");
  }, [apiKey, merchantId, setPendingSetup]);

  return null;
}
