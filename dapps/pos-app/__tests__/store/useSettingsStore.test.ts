import { useSettingsStore } from "@/store/useSettingsStore";
import { resetSettingsStore } from "../utils/store-helpers";

// Get the mocked secure store
const SecureStore = require("expo-secure-store");

describe("useSettingsStore", () => {
  beforeEach(() => {
    resetSettingsStore();
    // Clear secure storage mock between tests
    if (SecureStore.__clearMockStorage) {
      SecureStore.__clearMockStorage();
    }
  });

  describe("initial state", () => {
    it("should have default theme mode", () => {
      const { themeMode } = useSettingsStore.getState();
      expect(themeMode).toBe("light");
    });

    it("should have empty device ID", () => {
      const { deviceId } = useSettingsStore.getState();
      expect(deviceId).toBe("");
    });

    it("should have default variant", () => {
      const { variant } = useSettingsStore.getState();
      expect(variant).toBe("default");
    });

    it("should have null merchant ID", () => {
      const { merchantId } = useSettingsStore.getState();
      expect(merchantId).toBeNull();
    });

    it("should have isMerchantApiKeySet as false", () => {
      const { isMerchantApiKeySet } = useSettingsStore.getState();
      expect(isMerchantApiKeySet).toBe(false);
    });

    it("should have zero failed PIN attempts", () => {
      const { pinFailedAttempts } = useSettingsStore.getState();
      expect(pinFailedAttempts).toBe(0);
    });

    it("should have null lockout time", () => {
      const { pinLockoutUntil } = useSettingsStore.getState();
      expect(pinLockoutUntil).toBeNull();
    });

    it("should have biometric disabled", () => {
      const { biometricEnabled } = useSettingsStore.getState();
      expect(biometricEnabled).toBe(false);
    });
  });

  describe("setThemeMode", () => {
    it("should set theme to dark", () => {
      const { setThemeMode } = useSettingsStore.getState();

      setThemeMode("dark");

      expect(useSettingsStore.getState().themeMode).toBe("dark");
    });

    it("should set theme to light", () => {
      // First set to dark
      useSettingsStore.getState().setThemeMode("dark");
      expect(useSettingsStore.getState().themeMode).toBe("dark");

      // Then set to light
      useSettingsStore.getState().setThemeMode("light");
      expect(useSettingsStore.getState().themeMode).toBe("light");
    });
  });

  describe("setDeviceId", () => {
    it("should set device ID", () => {
      const { setDeviceId } = useSettingsStore.getState();

      setDeviceId("device-123-abc");

      expect(useSettingsStore.getState().deviceId).toBe("device-123-abc");
    });
  });

  describe("setVariant", () => {
    it("should set variant", () => {
      const { setVariant } = useSettingsStore.getState();

      setVariant("solflare");

      expect(useSettingsStore.getState().variant).toBe("solflare");
    });

    it("should update theme when variant has defaultTheme", () => {
      // Solflare variant has defaultTheme: "dark"
      const { setVariant } = useSettingsStore.getState();

      // Start with light theme
      useSettingsStore.getState().setThemeMode("light");
      expect(useSettingsStore.getState().themeMode).toBe("light");

      // Set solflare variant which has dark as default
      setVariant("solflare");

      expect(useSettingsStore.getState().variant).toBe("solflare");
      expect(useSettingsStore.getState().themeMode).toBe("dark");
    });

    it("should support all variant types", () => {
      const variants = [
        "default",
        "solflare",
        "binance",
        "phantom",
        "solana",
      ] as const;

      variants.forEach((variantName) => {
        useSettingsStore.getState().setVariant(variantName);
        expect(useSettingsStore.getState().variant).toBe(variantName);
      });
    });
  });

  describe("setMerchantId / clearMerchantId", () => {
    it("should set merchant ID", () => {
      const { setMerchantId } = useSettingsStore.getState();

      setMerchantId("merchant-123");

      expect(useSettingsStore.getState().merchantId).toBe("merchant-123");
    });

    it("should allow setting null merchant ID", () => {
      // First set a value
      useSettingsStore.getState().setMerchantId("merchant-123");
      expect(useSettingsStore.getState().merchantId).toBe("merchant-123");

      // Then set to null
      useSettingsStore.getState().setMerchantId(null);
      expect(useSettingsStore.getState().merchantId).toBeNull();
    });

    it("should clear merchant ID", () => {
      // First set a value
      useSettingsStore.getState().setMerchantId("merchant-123");
      expect(useSettingsStore.getState().merchantId).toBe("merchant-123");

      // Clear it
      useSettingsStore.getState().clearMerchantId();
      expect(useSettingsStore.getState().merchantId).toBeNull();
    });
  });

  describe("setMerchantApiKey / clearMerchantApiKey / getMerchantApiKey", () => {
    it("should store API key in secure storage", async () => {
      const { setMerchantApiKey } = useSettingsStore.getState();

      await setMerchantApiKey("api-key-123");

      expect(useSettingsStore.getState().isMerchantApiKeySet).toBe(true);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        "merchant_api_key",
        "api-key-123",
      );
    });

    it("should retrieve API key from secure storage", async () => {
      // First store the key
      await useSettingsStore.getState().setMerchantApiKey("api-key-456");

      // Then retrieve it
      const apiKey = await useSettingsStore.getState().getMerchantApiKey();

      expect(apiKey).toBe("api-key-456");
    });

    it("should clear API key from secure storage", async () => {
      // First store a key
      await useSettingsStore.getState().setMerchantApiKey("api-key-789");
      expect(useSettingsStore.getState().isMerchantApiKeySet).toBe(true);

      // Clear it
      await useSettingsStore.getState().clearMerchantApiKey();

      expect(useSettingsStore.getState().isMerchantApiKeySet).toBe(false);
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "merchant_api_key",
      );
    });

    it("should remove API key when setting null", async () => {
      // First store a key
      await useSettingsStore.getState().setMerchantApiKey("api-key-to-remove");

      // Set to null
      await useSettingsStore.getState().setMerchantApiKey(null);

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "merchant_api_key",
      );
    });

    it("should return null when no API key is stored", async () => {
      const apiKey = await useSettingsStore.getState().getMerchantApiKey();
      expect(apiKey).toBeNull();
    });
  });

  describe("PIN management", () => {
    describe("setPin", () => {
      it("should hash and store PIN in secure storage", async () => {
        const { setPin } = useSettingsStore.getState();

        await setPin("1234");

        expect(SecureStore.setItemAsync).toHaveBeenCalled();
        // The first argument should be the PIN_HASH key
        const [[key, hashedValue]] = SecureStore.setItemAsync.mock.calls.filter(
          ([k]: [string]) => k === "pin_hash",
        );
        expect(key).toBe("pin_hash");
        expect(hashedValue).toBeDefined();
        expect(hashedValue).not.toBe("1234"); // Should be hashed
      });

      it("should reset failed attempts and lockout when PIN is set", async () => {
        // Simulate some failed attempts
        useSettingsStore.setState({
          pinFailedAttempts: 2,
          pinLockoutUntil: Date.now() + 60000,
        });

        await useSettingsStore.getState().setPin("5678");

        expect(useSettingsStore.getState().pinFailedAttempts).toBe(0);
        expect(useSettingsStore.getState().pinLockoutUntil).toBeNull();
      });
    });

    describe("verifyPin", () => {
      it("should return true for correct PIN", async () => {
        // Set a PIN first
        await useSettingsStore.getState().setPin("1234");

        // Verify with correct PIN
        const result = await useSettingsStore.getState().verifyPin("1234");

        expect(result).toBe(true);
      });

      it("should return false for incorrect PIN", async () => {
        // Set a PIN first
        await useSettingsStore.getState().setPin("1234");

        // Verify with wrong PIN
        const result = await useSettingsStore.getState().verifyPin("9999");

        expect(result).toBe(false);
      });

      it("should increment failed attempts on wrong PIN", async () => {
        await useSettingsStore.getState().setPin("1234");

        // Wrong PIN attempt
        await useSettingsStore.getState().verifyPin("9999");

        expect(useSettingsStore.getState().pinFailedAttempts).toBe(1);
      });

      it("should reset failed attempts on successful verification", async () => {
        await useSettingsStore.getState().setPin("1234");

        // Simulate some failed attempts
        useSettingsStore.setState({ pinFailedAttempts: 2 });

        // Correct PIN
        await useSettingsStore.getState().verifyPin("1234");

        expect(useSettingsStore.getState().pinFailedAttempts).toBe(0);
      });

      it("should lock out after 3 failed attempts", async () => {
        await useSettingsStore.getState().setPin("1234");

        // 3 wrong attempts
        await useSettingsStore.getState().verifyPin("1111");
        await useSettingsStore.getState().verifyPin("2222");
        await useSettingsStore.getState().verifyPin("3333");

        expect(useSettingsStore.getState().pinFailedAttempts).toBe(3);
        expect(useSettingsStore.getState().pinLockoutUntil).not.toBeNull();
      });

      it("should return false when locked out even with correct PIN", async () => {
        await useSettingsStore.getState().setPin("1234");

        // Set lockout
        useSettingsStore.setState({
          pinLockoutUntil: Date.now() + 300000, // 5 minutes in the future
        });

        // Try correct PIN while locked out
        const result = await useSettingsStore.getState().verifyPin("1234");

        expect(result).toBe(false);
      });

      it("should clear lockout after lockout time expires", async () => {
        await useSettingsStore.getState().setPin("1234");

        // Set an expired lockout
        useSettingsStore.setState({
          pinLockoutUntil: Date.now() - 1000, // 1 second in the past
          pinFailedAttempts: 3,
        });

        // Verify PIN - should work and clear lockout
        const result = await useSettingsStore.getState().verifyPin("1234");

        expect(result).toBe(true);
        expect(useSettingsStore.getState().pinLockoutUntil).toBeNull();
        expect(useSettingsStore.getState().pinFailedAttempts).toBe(0);
      });

      it("should use timing-safe comparison for PIN verification", async () => {
        // This test verifies the behavior is correct regardless of timing
        // The actual timing-safe implementation prevents timing attacks
        await useSettingsStore.getState().setPin("1234");

        // Test with correct PIN
        const correctResult = await useSettingsStore.getState().verifyPin("1234");
        expect(correctResult).toBe(true);

        // Test with wrong PIN of same length
        const wrongSameLength = await useSettingsStore.getState().verifyPin("5678");
        expect(wrongSameLength).toBe(false);

        // Reset attempts for next test
        useSettingsStore.getState().resetPinAttempts();

        // Test with wrong PIN of different length
        const wrongDiffLength = await useSettingsStore.getState().verifyPin("12345");
        expect(wrongDiffLength).toBe(false);

        // Reset attempts
        useSettingsStore.getState().resetPinAttempts();

        // Test with empty PIN
        const emptyPin = await useSettingsStore.getState().verifyPin("");
        expect(emptyPin).toBe(false);
      });
    });

    describe("isPinSet", () => {
      it("should return false when no PIN is set", async () => {
        const result = await useSettingsStore.getState().isPinSet();
        expect(result).toBe(false);
      });

      it("should return true when PIN is set", async () => {
        await useSettingsStore.getState().setPin("1234");

        const result = await useSettingsStore.getState().isPinSet();
        expect(result).toBe(true);
      });
    });

    describe("isLockedOut", () => {
      it("should return false when not locked out", () => {
        const result = useSettingsStore.getState().isLockedOut();
        expect(result).toBe(false);
      });

      it("should return true when locked out", () => {
        useSettingsStore.setState({
          pinLockoutUntil: Date.now() + 300000, // 5 minutes in the future
        });

        const result = useSettingsStore.getState().isLockedOut();
        expect(result).toBe(true);
      });

      it("should return false and clear lockout when lockout has expired", () => {
        useSettingsStore.setState({
          pinLockoutUntil: Date.now() - 1000, // 1 second in the past
          pinFailedAttempts: 3,
        });

        const result = useSettingsStore.getState().isLockedOut();

        expect(result).toBe(false);
        expect(useSettingsStore.getState().pinLockoutUntil).toBeNull();
        expect(useSettingsStore.getState().pinFailedAttempts).toBe(0);
      });
    });

    describe("getLockoutRemainingSeconds", () => {
      it("should return 0 when not locked out", () => {
        const result = useSettingsStore.getState().getLockoutRemainingSeconds();
        expect(result).toBe(0);
      });

      it("should return remaining seconds when locked out", () => {
        // Set lockout to 60 seconds from now
        useSettingsStore.setState({
          pinLockoutUntil: Date.now() + 60000,
        });

        const result = useSettingsStore.getState().getLockoutRemainingSeconds();

        // Should be approximately 60 seconds (allow some tolerance for test execution time)
        expect(result).toBeGreaterThanOrEqual(59);
        expect(result).toBeLessThanOrEqual(60);
      });

      it("should return 0 for expired lockout", () => {
        useSettingsStore.setState({
          pinLockoutUntil: Date.now() - 1000, // In the past
        });

        const result = useSettingsStore.getState().getLockoutRemainingSeconds();
        expect(result).toBe(0);
      });
    });

    describe("resetPinAttempts", () => {
      it("should reset failed attempts to 0", () => {
        useSettingsStore.setState({ pinFailedAttempts: 3 });

        useSettingsStore.getState().resetPinAttempts();

        expect(useSettingsStore.getState().pinFailedAttempts).toBe(0);
      });

      it("should clear lockout", () => {
        useSettingsStore.setState({
          pinFailedAttempts: 3,
          pinLockoutUntil: Date.now() + 300000,
        });

        useSettingsStore.getState().resetPinAttempts();

        expect(useSettingsStore.getState().pinLockoutUntil).toBeNull();
      });
    });
  });

  describe("setBiometricEnabled", () => {
    it("should enable biometric", () => {
      useSettingsStore.getState().setBiometricEnabled(true);
      expect(useSettingsStore.getState().biometricEnabled).toBe(true);
    });

    it("should disable biometric", () => {
      // First enable
      useSettingsStore.getState().setBiometricEnabled(true);
      expect(useSettingsStore.getState().biometricEnabled).toBe(true);

      // Then disable
      useSettingsStore.getState().setBiometricEnabled(false);
      expect(useSettingsStore.getState().biometricEnabled).toBe(false);
    });
  });

  describe("getVariantPrinterLogo", () => {
    it("should return default logo for default variant", () => {
      useSettingsStore.setState({ variant: "default" });

      const logo = useSettingsStore.getState().getVariantPrinterLogo();

      expect(logo).toBeDefined();
      expect(typeof logo).toBe("string");
    });

    it("should return variant-specific logo", () => {
      useSettingsStore.setState({ variant: "solflare" });

      const logo = useSettingsStore.getState().getVariantPrinterLogo();

      expect(logo).toBeDefined();
      expect(typeof logo).toBe("string");
    });
  });

  describe("setHasHydrated", () => {
    it("should set hydration state to true", () => {
      useSettingsStore.getState().setHasHydrated(true);
      expect(useSettingsStore.getState()._hasHydrated).toBe(true);
    });

    it("should set hydration state to false", () => {
      useSettingsStore.getState().setHasHydrated(true);
      useSettingsStore.getState().setHasHydrated(false);
      expect(useSettingsStore.getState()._hasHydrated).toBe(false);
    });
  });

  describe("persistence and hydration", () => {
    it("should maintain state after setting multiple values", () => {
      // Set multiple state values
      useSettingsStore.getState().setThemeMode("dark");
      useSettingsStore.getState().setMerchantId("merchant-persist-123");
      useSettingsStore.getState().setDeviceId("device-persist-456");
      useSettingsStore.getState().setVariant("solflare");

      // Verify all values are maintained
      const state = useSettingsStore.getState();
      expect(state.themeMode).toBe("dark");
      expect(state.merchantId).toBe("merchant-persist-123");
      expect(state.deviceId).toBe("device-persist-456");
      expect(state.variant).toBe("solflare");
    });

    it("should track hydration state correctly", () => {
      // Initial state should not be hydrated (reset in beforeEach)
      expect(useSettingsStore.getState()._hasHydrated).toBe(false);

      // Simulate hydration completion
      useSettingsStore.getState().setHasHydrated(true);
      expect(useSettingsStore.getState()._hasHydrated).toBe(true);

      // Setting other state should not affect hydration flag
      useSettingsStore.getState().setThemeMode("dark");
      expect(useSettingsStore.getState()._hasHydrated).toBe(true);
    });

    it("should allow state changes before hydration", () => {
      // Before hydration
      expect(useSettingsStore.getState()._hasHydrated).toBe(false);

      // State changes should still work
      useSettingsStore.getState().setThemeMode("dark");
      expect(useSettingsStore.getState().themeMode).toBe("dark");

      // After hydration, state should persist
      useSettingsStore.getState().setHasHydrated(true);
      expect(useSettingsStore.getState().themeMode).toBe("dark");
    });

    it("should preserve PIN-related state through state updates", async () => {
      // Set up PIN state
      await useSettingsStore.getState().setPin("1234");
      useSettingsStore.setState({ pinFailedAttempts: 2 });

      // Update other state
      useSettingsStore.getState().setThemeMode("dark");
      useSettingsStore.getState().setMerchantId("test-merchant");

      // PIN state should be preserved
      expect(useSettingsStore.getState().pinFailedAttempts).toBe(2);
      const isPinSet = await useSettingsStore.getState().isPinSet();
      expect(isPinSet).toBe(true);
    });

    it("should preserve biometric setting through other state changes", () => {
      useSettingsStore.getState().setBiometricEnabled(true);

      // Change other settings
      useSettingsStore.getState().setThemeMode("dark");
      useSettingsStore.getState().setVariant("binance");

      // Biometric should still be enabled
      expect(useSettingsStore.getState().biometricEnabled).toBe(true);
    });

    it("should have correct persist configuration", () => {
      // Verify the store has persist middleware configured
      const persistOptions = useSettingsStore.persist?.getOptions?.();

      // Check persist name and version are set (for storage key)
      expect(persistOptions?.name).toBe("settings");
      expect(persistOptions?.version).toBe(9);

      // Verify storage is configured (MMKV in production, mock in tests)
      expect(persistOptions?.storage).toBeDefined();
    });

    it("should have rehydrate and persist methods available", () => {
      // Verify persist API is available for manual control if needed
      expect(useSettingsStore.persist).toBeDefined();
      expect(typeof useSettingsStore.persist.rehydrate).toBe("function");
      expect(typeof useSettingsStore.persist.hasHydrated).toBe("function");
      expect(typeof useSettingsStore.persist.getOptions).toBe("function");
    });
  });
});
