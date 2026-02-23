/**
 * Secure Storage Tests
 *
 * Tests for the secure storage migration function.
 */

import { migratePartnerApiKey } from "@/utils/secure-storage";
import { storage } from "@/utils/storage";

// Get the mocked secure store
const SecureStore = require("expo-secure-store");

describe("migratePartnerApiKey", () => {
  beforeEach(() => {
    // Clear secure storage mock between tests
    if (SecureStore.__clearMockStorage) {
      SecureStore.__clearMockStorage();
    }
    // Clear the migration completed flag
    storage.removeItem("migration_partner_api_key_completed");
  });

  it("should migrate from old key to new key when old key exists", async () => {
    // Set up old key
    await SecureStore.setItemAsync("merchant_api_key", "test-api-key-123");

    const migrated = await migratePartnerApiKey();

    expect(migrated).toBe(true);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      "partner_api_key",
      "test-api-key-123",
    );
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("merchant_api_key");
  });

  it("should not overwrite existing new key", async () => {
    // Set up both old and new keys
    await SecureStore.setItemAsync("merchant_api_key", "old-api-key");
    await SecureStore.setItemAsync("partner_api_key", "existing-new-key");

    // Clear mock calls from setup
    jest.clearAllMocks();

    const migrated = await migratePartnerApiKey();

    // Should still delete old key but not set new key (existing value preserved)
    expect(migrated).toBe(false);
    expect(SecureStore.setItemAsync).not.toHaveBeenCalledWith(
      "partner_api_key",
      expect.anything(),
    );
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("merchant_api_key");
  });

  it("should do nothing when old key does not exist", async () => {
    // No keys set up

    const migrated = await migratePartnerApiKey();

    expect(migrated).toBe(false);
    expect(SecureStore.setItemAsync).not.toHaveBeenCalledWith(
      "partner_api_key",
      expect.anything(),
    );
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
  });

  it("should track migration completion and skip on subsequent calls", async () => {
    // Set up old key
    await SecureStore.setItemAsync("merchant_api_key", "test-api-key");

    // First call should perform migration
    const firstResult = await migratePartnerApiKey();
    expect(firstResult).toBe(true);

    // Clear mocks but keep storage state
    jest.clearAllMocks();

    // Set up old key again to simulate what would happen if migration ran again
    await SecureStore.setItemAsync("merchant_api_key", "another-key");

    // Second call should skip due to completion flag
    const secondResult = await migratePartnerApiKey();
    expect(secondResult).toBe(false);

    // Should not have attempted to read/write secure storage for migration
    // (only the setup call above)
    expect(SecureStore.getItemAsync).not.toHaveBeenCalledWith("merchant_api_key");
  });

  it("should properly clean up old key after migration", async () => {
    await SecureStore.setItemAsync("merchant_api_key", "api-key-to-migrate");

    await migratePartnerApiKey();

    // Verify old key was deleted
    const oldValue = await SecureStore.getItemAsync("merchant_api_key");
    expect(oldValue).toBeNull();

    // Verify new key has the value
    const newValue = await SecureStore.getItemAsync("partner_api_key");
    expect(newValue).toBe("api-key-to-migrate");
  });
});
