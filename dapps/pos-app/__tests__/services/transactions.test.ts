jest.mock("@/services/client", () => ({
  getApiHeaders: jest.fn(async () => ({ "Api-Key": "local-key" })),
  merchantApiClient: { get: jest.fn() },
}));

import { getTransactions } from "@/services/transactions";
import { merchantApiClient } from "@/services/client";
import { useSettingsStore } from "@/store/useSettingsStore";

describe("native transaction service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSettingsStore.setState({ testMode: false, currency: "USD" });
  });

  it("uses local records only while Test Mode is enabled", async () => {
    useSettingsStore.setState({ testMode: true });

    await expect(
      getTransactions({ status: ["succeeded"] }),
    ).resolves.toMatchObject({
      data: [expect.objectContaining({ paymentId: "test_succeeded" })],
      nextCursor: null,
    });
    expect(merchantApiClient.get).not.toHaveBeenCalled();
  });

  it("uses the merchant API while Test Mode is disabled", async () => {
    (merchantApiClient.get as jest.Mock).mockResolvedValueOnce({ data: [] });

    await expect(getTransactions()).resolves.toEqual({ data: [] });
    expect(merchantApiClient.get).toHaveBeenCalledWith(
      "/merchants/payments",
      expect.objectContaining({ headers: { "Api-Key": "local-key" } }),
    );
  });
});
