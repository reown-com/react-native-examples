function loadMerchantConfig(env: {
  merchantId?: string;
  apiKey?: string;
}): typeof import("@/utils/merchant-config").MerchantConfig {
  const original = { ...process.env };
  delete process.env.EXPO_PUBLIC_DEFAULT_MERCHANT_ID;
  delete process.env.EXPO_PUBLIC_DEFAULT_CUSTOMER_API_KEY;
  if (env.merchantId !== undefined) {
    process.env.EXPO_PUBLIC_DEFAULT_MERCHANT_ID = env.merchantId;
  }
  if (env.apiKey !== undefined) {
    process.env.EXPO_PUBLIC_DEFAULT_CUSTOMER_API_KEY = env.apiKey;
  }

  let config: typeof import("@/utils/merchant-config").MerchantConfig;
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    config = require("@/utils/merchant-config").MerchantConfig;
  });
  process.env = original;
  // @ts-expect-error assigned inside isolateModules
  return config;
}

describe("MerchantConfig", () => {
  it("uses the env defaults", () => {
    const config = loadMerchantConfig({
      merchantId: "mrch_1",
      apiKey: "wcp_key",
    });

    expect(config.getDefaultMerchantId()).toBe("mrch_1");
    expect(config.getDefaultCustomerApiKey()).toBe("wcp_key");
    expect(config.hasEnvDefaults()).toBe(true);
  });

  it("has no defaults when the env doesn't set them", () => {
    const config = loadMerchantConfig({});

    expect(config.getDefaultMerchantId()).toBeNull();
    expect(config.getDefaultCustomerApiKey()).toBeNull();
    expect(config.hasEnvDefaults()).toBe(false);
  });

  // Temporary: remove with the pos-demo-1 workaround in merchant-config.ts.
  it("ignores both defaults for the revoked pos-demo-1 merchant", () => {
    const config = loadMerchantConfig({
      merchantId: "pos-demo-1",
      apiKey: "wcp_revoked",
    });

    expect(config.getDefaultMerchantId()).toBeNull();
    expect(config.getDefaultCustomerApiKey()).toBeNull();
    expect(config.hasEnvDefaults()).toBe(false);
  });
});
