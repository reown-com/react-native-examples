import { EmptyState } from "@/components/empty-state";
import { router } from "expo-router";

/**
 * Shown when a payment is started before the terminal has merchant
 * credentials (outside Test Mode).
 */
export default function MerchantSetupScreen() {
  return (
    <EmptyState
      title="Set up your merchant details"
      subtitle="Add your merchant ID and customer API key in Settings to start taking payments."
      cta={{
        label: "Go to Settings",
        // Replace so going back from Settings returns to Home, not here.
        onPress: () => router.replace("/settings"),
      }}
    />
  );
}
