/**
 * Secure Storage Tests
 *
 * Tests for the secure storage migration function.
 */

import {
  clearStaleSecureStorage,
  migrateCustomerApiKey,
} from "@/utils/secure-storage";
import { storage } from "@/utils/storage";

// Get the mocked secure store
const SecureStore = require("expo-secure-store");

describe("migrateCustomerApiKey", () => {
  beforeEach(() => {
    // Clear secure storage mock between tests
    if (SecureStore.__clearMockStorage) {
      SecureStore.__clearMockStorage();
    }
    // Clear the migration completed flag
    storage.removeItem("migration_customer_api_key_completed");
    storage.removeItem("app_has_launched");
  });

  it("should migrate from old merchant key to new customer key", async () => {
    await SecureStore.setItemAsync("merchant_api_key", "test-api-key-123");

    const migrated = await migrateCustomerApiKey();

    expect(migrated).toBe(true);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      "customer_api_key",
      "test-api-key-123",
    );
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      "merchant_api_key",
    );
  });

  it("should migrate from old partner key to new customer key", async () => {
    await SecureStore.setItemAsync("partner_api_key", "partner-key-456");

    const migrated = await migrateCustomerApiKey();

    expect(migrated).toBe(true);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      "customer_api_key",
      "partner-key-456",
    );
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      "partner_api_key",
    );
  });

  it("should migrate from merchant key when both old keys exist", async () => {
    await SecureStore.setItemAsync("merchant_api_key", "merchant-value");
    await SecureStore.setItemAsync("partner_api_key", "partner-value");

    jest.clearAllMocks();

    const migrated = await migrateCustomerApiKey();

    expect(migrated).toBe(true);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      "customer_api_key",
      "merchant-value",
    );
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      "merchant_api_key",
    );
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      "partner_api_key",
    );
  });

  it("should not overwrite existing customer key", async () => {
    await SecureStore.setItemAsync("partner_api_key", "old-value");
    await SecureStore.setItemAsync("customer_api_key", "existing-value");

    jest.clearAllMocks();

    const migrated = await migrateCustomerApiKey();

    expect(migrated).toBe(false);
    expect(SecureStore.setItemAsync).not.toHaveBeenCalledWith(
      "customer_api_key",
      expect.anything(),
    );
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      "partner_api_key",
    );
  });

  it("should do nothing when no old keys exist", async () => {
    const migrated = await migrateCustomerApiKey();

    expect(migrated).toBe(false);
    expect(SecureStore.setItemAsync).not.toHaveBeenCalledWith(
      "customer_api_key",
      expect.anything(),
    );
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
  });

  it("should track migration completion and skip on subsequent calls", async () => {
    await SecureStore.setItemAsync("merchant_api_key", "test-api-key");

    const firstResult = await migrateCustomerApiKey();
    expect(firstResult).toBe(true);

    jest.clearAllMocks();

    await SecureStore.setItemAsync("merchant_api_key", "another-key");

    const secondResult = await migrateCustomerApiKey();
    expect(secondResult).toBe(false);

    expect(SecureStore.getItemAsync).not.toHaveBeenCalledWith(
      "merchant_api_key",
    );
  });

  it("should properly clean up old keys after migration", async () => {
    await SecureStore.setItemAsync("merchant_api_key", "api-key-to-migrate");

    await migrateCustomerApiKey();

    const oldValue = await SecureStore.getItemAsync("merchant_api_key");
    expect(oldValue).toBeNull();

    const newValue = await SecureStore.getItemAsync("customer_api_key");
    expect(newValue).toBe("api-key-to-migrate");
  });
});

describe("clearStaleSecureStorage", () => {
  beforeEach(() => {
    if (SecureStore.__clearMockStorage) {
      SecureStore.__clearMockStorage();
    }
    storage.removeItem("app_has_launched");
  });

  it("should clear current and legacy API keys on fresh install", async () => {
    await SecureStore.setItemAsync("customer_api_key", "new-key");
    await SecureStore.setItemAsync("merchant_api_key", "merchant-key");
    await SecureStore.setItemAsync("partner_api_key", "partner-key");
    await SecureStore.setItemAsync("pin_hash", "pin-hash");

    jest.clearAllMocks();

    await clearStaleSecureStorage();

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("customer_api_key");
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("merchant_api_key");
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("partner_api_key");
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("pin_hash");
    expect(await SecureStore.getItemAsync("customer_api_key")).toBeNull();
    expect(await SecureStore.getItemAsync("merchant_api_key")).toBeNull();
    expect(await SecureStore.getItemAsync("partner_api_key")).toBeNull();
    expect(await SecureStore.getItemAsync("pin_hash")).toBeNull();
    expect(storage.getItem("app_has_launched")).toBe(true);
  });

  it("should not clear keys after first launch", async () => {
    storage.setItem("app_has_launched", true);
    await SecureStore.setItemAsync("partner_api_key", "partner-key");

    jest.clearAllMocks();

    await clearStaleSecureStorage();

    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
    expect(await SecureStore.getItemAsync("partner_api_key")).toBe("partner-key");
  });
});
