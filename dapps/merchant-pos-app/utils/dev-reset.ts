import { useMerchantStore } from "@/store/useMerchantStore";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { usePaymentLinksStore } from "@/store/usePaymentLinksStore";
import { usePaymentsStore } from "@/store/usePaymentsStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * DEV-ONLY: wipe all persisted app state so the same wallet can be onboarded
 * again. Clears the merchant registry, payments, links, the onboarding draft,
 * and the AppKit / WalletConnect session (AsyncStorage).
 */
export async function nukeAllStorage() {
  // Reset in-memory state immediately.
  useMerchantStore.setState({ merchants: {}, activeAddress: null });
  usePaymentsStore.setState({ payments: [] });
  usePaymentLinksStore.setState({ links: [] });
  useOnboardingStore.getState().reset();

  // Drop persisted copies (MMKV-backed zustand stores).
  await Promise.allSettled([
    useMerchantStore.persist.clearStorage(),
    usePaymentsStore.persist.clearStorage(),
    usePaymentLinksStore.persist.clearStorage(),
  ]);

  // Clear AppKit / WalletConnect sessions so the next connect is fresh.
  await AsyncStorage.clear();
}
