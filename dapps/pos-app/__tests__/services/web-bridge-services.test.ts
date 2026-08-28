import {
  configureBridge,
  handleBridgeResponse,
  resetBridge,
} from "@/services/pos-bridge";
import {
  cancelPayment,
  getPaymentStatus,
  startPayment,
} from "@/services/payment.web";
import { getTransactions } from "@/services/transactions.web";
import { useSettingsStore } from "@/store/useSettingsStore";
import { clearTestMerchant, setupTestMerchant } from "../utils/store-helpers";

const parentPostMessage = jest.fn();
const parentWindow = { postMessage: parentPostMessage } as unknown as Window;
const parentOrigin = "https://dashboard.example.com";

function respondWithSuccess(data: unknown) {
  const message = parentPostMessage.mock.calls[
    parentPostMessage.mock.calls.length - 1
  ]?.[0] as {
    requestId: string;
  };
  handleBridgeResponse({
    source: parentWindow,
    origin: parentOrigin,
    data: {
      type: "pos-api-response",
      protocolVersion: 1,
      requestId: message.requestId,
      result: { ok: true, data },
    },
  } as MessageEvent);
}

describe("web services with the POS bridge", () => {
  beforeEach(() => {
    resetBridge();
    parentPostMessage.mockClear();
    jest.clearAllMocks();
    useSettingsStore.setState({
      merchantId: "merchant-direct",
      isCustomerApiKeySet: true,
      getCustomerApiKey: jest.fn(async () => "local-key"),
    });
  });

  afterEach(async () => {
    resetBridge();
    await clearTestMerchant();
  });

  it("uses the four bridge operations without reading the local key or fetching proxies", async () => {
    const getCustomerApiKey = useSettingsStore.getState()
      .getCustomerApiKey as jest.Mock;
    configureBridge(parentWindow, parentOrigin, "merchant-bridge");

    const start = startPayment({
      referenceId: "reference-1",
      amount: { value: "100", unit: "cents" },
    });
    expect(
      parentPostMessage.mock.calls[parentPostMessage.mock.calls.length - 1]?.[0]
        .request,
    ).toEqual({
      operation: "start-payment",
      payload: {
        referenceId: "reference-1",
        amount: { value: "100", unit: "cents" },
      },
    });
    respondWithSuccess({
      paymentId: "pay-1",
      expiresAt: null,
      gatewayUrl: "url",
    });
    await expect(start).resolves.toMatchObject({ paymentId: "pay-1" });

    const status = getPaymentStatus("pay-1");
    expect(
      parentPostMessage.mock.calls[parentPostMessage.mock.calls.length - 1]?.[0]
        .request,
    ).toEqual({
      operation: "get-payment-status",
      payload: { paymentId: "pay-1" },
    });
    respondWithSuccess({
      status: "processing",
      isFinal: false,
      pollInMs: 1000,
    });
    await expect(status).resolves.toMatchObject({ status: "processing" });

    const cancel = cancelPayment("pay-1");
    expect(
      parentPostMessage.mock.calls[parentPostMessage.mock.calls.length - 1]?.[0]
        .request,
    ).toEqual({
      operation: "cancel-payment",
      payload: { paymentId: "pay-1" },
    });
    respondWithSuccess(undefined);
    await expect(cancel).resolves.toBeUndefined();

    const transactions = getTransactions({ limit: 10, status: ["succeeded"] });
    expect(
      parentPostMessage.mock.calls[parentPostMessage.mock.calls.length - 1]?.[0]
        .request,
    ).toEqual({
      operation: "get-transactions",
      payload: { limit: 10, status: ["succeeded"] },
    });
    respondWithSuccess({ data: [] });
    await expect(transactions).resolves.toEqual({ data: [] });

    expect(getCustomerApiKey).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("keeps direct proxy behavior when bridge mode is disabled", async () => {
    await setupTestMerchant("merchant-direct", "local-key");
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        paymentId: "pay-direct",
        expiresAt: null,
        gatewayUrl: "url",
      }),
    });

    await expect(
      startPayment({
        referenceId: "reference-direct",
        amount: { value: "100", unit: "cents" },
      }),
    ).resolves.toMatchObject({ paymentId: "pay-direct" });
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/payment",
      expect.objectContaining({
        headers: expect.objectContaining({
          "x-api-key": "local-key",
          "x-merchant-id": "merchant-direct",
        }),
      }),
    );
  });
});
