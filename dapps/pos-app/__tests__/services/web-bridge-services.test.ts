import {
  configureBridge,
  handleBridgeResponse,
  resetBridge,
} from "@/services/pos-bridge";
import {
  cancelPayment,
  getPaymentStatus,
  sendReceipt,
  startPayment,
} from "@/services/payment.web";
import { getTransactions } from "@/services/transactions.web";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Platform } from "react-native";
import { clearTestMerchant, setupTestMerchant } from "../utils/store-helpers";

const parentPostMessage = jest.fn();
const parentWindow = { postMessage: parentPostMessage } as unknown as Window;
const parentOrigin = "https://dashboard.example.com";
let originalWindow: Window & typeof globalThis;
let originalPlatform: string;

function setEmbeddedWindow() {
  (global as any).window = {
    self: {},
    top: {},
    parent: parentWindow,
  };
}

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
    originalWindow = global.window;
    originalPlatform = Platform.OS;
    (Platform as any).OS = "web";
    resetBridge();
    parentPostMessage.mockClear();
    jest.clearAllMocks();
    useSettingsStore.setState({
      merchantId: "merchant-direct",
      isCustomerApiKeySet: true,
      testMode: false,
      getCustomerApiKey: jest.fn(async () => "local-key"),
    });
  });

  afterEach(async () => {
    (global as any).window = originalWindow;
    (Platform as any).OS = originalPlatform;
    resetBridge();
    await clearTestMerchant();
  });

  it("uses the four bridge operations without reading the local key or fetching proxies", async () => {
    setEmbeddedWindow();
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

  it("posts email receipts through the proxy when bridge mode is disabled", async () => {
    await setupTestMerchant("merchant-direct", "local-key");
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });

    await expect(
      sendReceipt("pay-direct", "lea@example.com"),
    ).resolves.toBeUndefined();
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/send-receipt?paymentId=pay-direct",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "lea@example.com" }),
        headers: expect.objectContaining({
          "x-api-key": "local-key",
          "x-merchant-id": "merchant-direct",
        }),
      }),
    );
  });

  it("rejects email receipts in the dashboard iframe without calling the bridge or proxy", async () => {
    setEmbeddedWindow();
    configureBridge(parentWindow, parentOrigin, "merchant-bridge");

    await expect(sendReceipt("pay-1", "lea@example.com")).rejects.toThrow(
      "Email receipts aren't available in the dashboard",
    );
    expect(parentPostMessage).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("simulates email receipts for Test Mode payments", async () => {
    setEmbeddedWindow();
    configureBridge(parentWindow, parentOrigin, "merchant-bridge");
    jest.useFakeTimers();

    const promise = sendReceipt("test_123", "lea@example.com");
    await jest.advanceTimersByTimeAsync(1000);
    await expect(promise).resolves.toBeUndefined();
    jest.useRealTimers();

    expect(parentPostMessage).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("surfaces proxy errors when sending an email receipt", async () => {
    await setupTestMerchant("merchant-direct", "local-key");
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: jest.fn().mockResolvedValue({ message: "Not found" }),
    });

    await expect(sendReceipt("pay-missing", "lea@example.com")).rejects.toEqual(
      { message: "Not found", code: undefined, status: 404 },
    );
  });

  it("uses local test transactions instead of the proxy in standalone Test Mode", async () => {
    useSettingsStore.setState({ testMode: true });

    await expect(
      getTransactions({ status: ["succeeded"] }),
    ).resolves.toMatchObject({
      data: [expect.objectContaining({ paymentId: "test_succeeded" })],
      nextCursor: null,
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("ignores a saved Test Mode in the dashboard iframe and uses the bridge", async () => {
    setEmbeddedWindow();
    configureBridge(parentWindow, parentOrigin, "merchant-bridge");
    useSettingsStore.setState({ testMode: true });

    const transactions = getTransactions({ status: ["succeeded"] });
    expect(
      parentPostMessage.mock.calls[parentPostMessage.mock.calls.length - 1]?.[0]
        .request,
    ).toEqual({
      operation: "get-transactions",
      payload: { status: ["succeeded"] },
    });
    respondWithSuccess({ data: [] });
    await expect(transactions).resolves.toEqual({ data: [] });
    // The saved flag is left alone for the standalone POS.
    expect(useSettingsStore.getState().testMode).toBe(true);
  });

  it("times out a hung email receipt request", async () => {
    await setupTestMerchant("merchant-direct", "local-key");
    (global.fetch as jest.Mock).mockImplementationOnce(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener("abort", () => {
            const abortError = new Error("Aborted");
            abortError.name = "AbortError";
            reject(abortError);
          });
        }),
    );
    jest.useFakeTimers();

    const promise = sendReceipt("pay-hung", "lea@example.com");
    const assertion = expect(promise).rejects.toMatchObject({
      code: "TIMEOUT",
    });
    await jest.advanceTimersByTimeAsync(30000);
    await assertion;
    jest.useRealTimers();
  });

  it("does not fall back to standalone credentials while an iframe awaits bridge configuration", async () => {
    setEmbeddedWindow();
    const getCustomerApiKey = useSettingsStore.getState()
      .getCustomerApiKey as jest.Mock;

    await expect(
      startPayment({
        referenceId: "reference-iframe",
        amount: { value: "100", unit: "cents" },
      }),
    ).rejects.toEqual({ message: "POS bridge is not configured" });
    await expect(getPaymentStatus("pay-iframe")).rejects.toEqual({
      message: "POS bridge is not configured",
    });
    await expect(cancelPayment("pay-iframe")).rejects.toEqual({
      message: "POS bridge is not configured",
    });
    await expect(getTransactions()).rejects.toEqual({
      message: "POS bridge is not configured",
    });

    expect(getCustomerApiKey).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
