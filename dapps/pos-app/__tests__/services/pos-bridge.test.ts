import {
  configureBridge,
  handleBridgeResponse,
  isBridgeConfigured,
  requestBridge,
  resetBridge,
} from "@/services/pos-bridge";
import { usePosBridgeStore } from "@/store/usePosBridgeStore";

const parentPostMessage = jest.fn();
const parentWindow = { postMessage: parentPostMessage } as unknown as Window;
const otherWindow = { postMessage: jest.fn() } as unknown as Window;
const parentOrigin = "https://dashboard.example.com";

function postedRequest(index = 0) {
  return parentPostMessage.mock.calls[index][0] as {
    requestId: string;
    request: { operation: string; payload: unknown };
  };
}

function response(
  requestId: string,
  result: unknown,
  source: MessageEventSource | null = parentWindow,
  origin = parentOrigin,
) {
  return handleBridgeResponse({
    source,
    origin,
    data: {
      type: "pos-api-response",
      protocolVersion: 1,
      requestId,
      result,
    },
  } as MessageEvent);
}

describe("POS dashboard bridge transport", () => {
  beforeEach(() => {
    resetBridge();
    parentPostMessage.mockClear();
  });

  afterEach(() => resetBridge());

  it("locks the first parent and resolves a successful response", async () => {
    expect(configureBridge(parentWindow, parentOrigin, "merchant-1")).toBe(
      true,
    );
    expect(
      configureBridge(otherWindow, "https://other.example.com", "other"),
    ).toBe(false);
    expect(usePosBridgeStore.getState()).toMatchObject({
      isConfigured: true,
      merchantId: "merchant-1",
    });

    const promise = requestBridge<{ paymentId: string }>({
      operation: "start-payment",
      payload: {
        referenceId: "reference-1",
        amount: { value: "100", unit: "cents" },
      },
    });

    const request = postedRequest();
    expect(parentPostMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "pos-api-request",
        protocolVersion: 1,
        request: expect.objectContaining({ operation: "start-payment" }),
      }),
      parentOrigin,
    );
    expect(
      response(request.requestId, { ok: true, data: { paymentId: "pay-1" } }),
    ).toBe(true);
    await expect(promise).resolves.toEqual({ paymentId: "pay-1" });
  });

  it("rejects structured bridge errors without changing their fields", async () => {
    configureBridge(parentWindow, parentOrigin, "merchant-1");
    const promise = requestBridge({
      operation: "get-payment-status",
      payload: { paymentId: "pay-1" },
    });

    response(postedRequest().requestId, {
      ok: false,
      error: { message: "Payment not found", code: "not_found", status: 404 },
    });

    await expect(promise).rejects.toEqual({
      message: "Payment not found",
      code: "not_found",
      status: 404,
    });
  });

  it("matches concurrent responses by request ID even when they arrive out of order", async () => {
    configureBridge(parentWindow, parentOrigin, "merchant-1");
    const first = requestBridge({
      operation: "get-payment-status",
      payload: { paymentId: "pay-1" },
    });
    const second = requestBridge({
      operation: "cancel-payment",
      payload: { paymentId: "pay-2" },
    });
    const firstRequest = postedRequest(0);
    const secondRequest = postedRequest(1);

    response(secondRequest.requestId, { ok: true, data: undefined });
    response(firstRequest.requestId, {
      ok: true,
      data: { status: "processing" },
    });

    await expect(second).resolves.toBeUndefined();
    await expect(first).resolves.toEqual({ status: "processing" });
  });

  it("ignores wrong-window, wrong-origin, malformed, and unknown responses", async () => {
    configureBridge(parentWindow, parentOrigin, "merchant-1");
    const promise = requestBridge({
      operation: "cancel-payment",
      payload: { paymentId: "pay-1" },
    });
    const requestId = postedRequest().requestId;

    expect(
      response(requestId, { ok: true, data: undefined }, otherWindow),
    ).toBe(false);
    expect(
      response(
        requestId,
        { ok: true, data: undefined },
        parentWindow,
        "https://other.example.com",
      ),
    ).toBe(false);
    expect(response("unknown", { ok: true, data: undefined })).toBe(false);
    expect(
      handleBridgeResponse({
        source: parentWindow,
        origin: parentOrigin,
        data: { type: "pos-api-response", protocolVersion: 2, requestId },
      } as MessageEvent),
    ).toBe(false);

    response(requestId, { ok: true, data: undefined });
    await expect(promise).resolves.toBeUndefined();
  });

  it("times out and rejects pending requests when reset", async () => {
    jest.useFakeTimers();
    configureBridge(parentWindow, parentOrigin, "merchant-1");
    const timedOut = requestBridge({
      operation: "get-transactions",
      payload: {},
    });
    jest.advanceTimersByTime(30_000);
    await expect(timedOut).rejects.toEqual({
      message: "POS bridge request timed out",
    });

    const pending = requestBridge({
      operation: "cancel-payment",
      payload: { paymentId: "pay-1" },
    });
    resetBridge();
    await expect(pending).rejects.toEqual({ message: "POS bridge was reset" });
    expect(isBridgeConfigured()).toBe(false);
    expect(usePosBridgeStore.getState().isConfigured).toBe(false);
    jest.useRealTimers();
  });
});
