import type { VercelResponse } from "@vercel/node";

const CORE_URL = "https://api.pay.example.com/v1";
const MERCHANT_URL = "https://staging.api.pay.example.org/v1";

function loadUtils(env: Record<string, string | undefined>) {
  const original = { ...process.env };
  Object.assign(process.env, env);
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) delete process.env[key];
  }

  let utils: typeof import("../../api/_utils") | undefined;
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    utils = require("../../api/_utils");
  });
  process.env = original;
  return utils!;
}

function mockResponse() {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res as unknown as VercelResponse;
}

describe("proxy base URLs", () => {
  it("sends /merchants/* to the merchant API URL when it is set", () => {
    const utils = loadUtils({
      EXPO_PUBLIC_API_URL: CORE_URL,
      EXPO_PUBLIC_MERCHANT_DEV_API_URL: MERCHANT_URL,
    });

    expect(utils.getApiBaseUrl(mockResponse())).toBe(CORE_URL);
    expect(utils.getMerchantApiBaseUrl(mockResponse())).toBe(MERCHANT_URL);
  });

  it("falls back to the main API URL when no merchant API URL is set", () => {
    const utils = loadUtils({
      EXPO_PUBLIC_API_URL: CORE_URL,
      EXPO_PUBLIC_MERCHANT_DEV_API_URL: undefined,
    });

    expect(utils.getMerchantApiBaseUrl(mockResponse())).toBe(CORE_URL);
  });

  it("answers 500 when neither URL is configured", () => {
    const utils = loadUtils({
      EXPO_PUBLIC_API_URL: undefined,
      EXPO_PUBLIC_MERCHANT_DEV_API_URL: undefined,
    });
    const res = mockResponse();

    expect(utils.getMerchantApiBaseUrl(res)).toBeNull();
    expect(res.status).toHaveBeenCalledWith(500);
    // Names both variables so the misconfiguration is clear from the logs.
    expect(res.json).toHaveBeenCalledWith({
      message:
        "Merchant API base URL is not configured (set EXPO_PUBLIC_MERCHANT_DEV_API_URL or EXPO_PUBLIC_API_URL)",
    });
  });
});
