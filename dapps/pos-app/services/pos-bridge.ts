import { usePosBridgeStore } from "@/store/usePosBridgeStore";
import { StartPaymentRequest } from "@/utils/types";

const PROTOCOL_VERSION = 1;
const REQUEST_TIMEOUT_MS = 30_000;

export interface GetTransactionsBridgeOptions {
  status?: string | string[];
  sortBy?: "date" | "amount";
  sortDir?: "asc" | "desc";
  limit?: number;
  cursor?: string;
  startTs?: string;
  endTs?: string;
}

export type PosBridgeRequest =
  | { operation: "start-payment"; payload: StartPaymentRequest }
  | { operation: "get-payment-status"; payload: { paymentId: string } }
  | { operation: "cancel-payment"; payload: { paymentId: string } }
  | { operation: "get-transactions"; payload: GetTransactionsBridgeOptions };

export interface PosBridgeError {
  message: string;
  code?: string;
  status?: number;
}

type PosApiResponseMessage = {
  type: "pos-api-response";
  protocolVersion: typeof PROTOCOL_VERSION;
  requestId: string;
  result: { ok: true; data: unknown } | { ok: false; error: PosBridgeError };
};

type PendingRequest = {
  resolve: (value: unknown) => void;
  reject: (reason: PosBridgeError) => void;
  timeout: ReturnType<typeof setTimeout>;
};

let parentWindow: Window | null = null;
let parentOrigin: string | null = null;
let requestSequence = 0;
const pendingRequests = new Map<string, PendingRequest>();

function createRequestId(): string {
  requestSequence += 1;
  const randomId = globalThis.crypto?.randomUUID?.();
  return randomId ?? `pos-${Date.now()}-${requestSequence}`;
}

function isValidResponseMessage(data: unknown): data is PosApiResponseMessage {
  if (!data || typeof data !== "object") return false;

  const message = data as Record<string, unknown>;
  if (
    message.type !== "pos-api-response" ||
    message.protocolVersion !== PROTOCOL_VERSION ||
    typeof message.requestId !== "string" ||
    message.requestId.length === 0 ||
    !message.result ||
    typeof message.result !== "object"
  ) {
    return false;
  }

  const result = message.result as Record<string, unknown>;
  if (result.ok === true)
    return Object.prototype.hasOwnProperty.call(result, "data");
  if (
    result.ok !== false ||
    !result.error ||
    typeof result.error !== "object"
  ) {
    return false;
  }

  const error = result.error as Record<string, unknown>;
  return (
    typeof error.message === "string" &&
    error.message.length > 0 &&
    (error.code === undefined || typeof error.code === "string") &&
    (error.status === undefined || typeof error.status === "number")
  );
}

export function isBridgeConfigured(): boolean {
  return parentWindow !== null && parentOrigin !== null;
}

/** Locks the bridge to its first trusted parent origin and window. */
export function configureBridge(
  source: Window,
  origin: string,
  merchantId: string,
): boolean {
  if (isBridgeConfigured()) return false;
  if (!origin || origin === "null") return false;

  parentWindow = source;
  parentOrigin = origin;
  usePosBridgeStore.getState().configure(merchantId);
  return true;
}

export function resetBridge(reason = "POS bridge was reset"): void {
  for (const pending of pendingRequests.values()) {
    clearTimeout(pending.timeout);
    pending.reject({ message: reason });
  }
  pendingRequests.clear();
  parentWindow = null;
  parentOrigin = null;
  usePosBridgeStore.getState().reset();
}

export function handleBridgeResponse(event: MessageEvent): boolean {
  if (
    event.source !== parentWindow ||
    event.origin !== parentOrigin ||
    !isValidResponseMessage(event.data)
  ) {
    return false;
  }

  const pending = pendingRequests.get(event.data.requestId);
  if (!pending) return false;

  pendingRequests.delete(event.data.requestId);
  clearTimeout(pending.timeout);
  if (event.data.result.ok) {
    pending.resolve(event.data.result.data);
  } else {
    pending.reject(event.data.result.error);
  }
  return true;
}

export function requestBridge<T>(request: PosBridgeRequest): Promise<T> {
  const targetWindow = parentWindow;
  const targetOrigin = parentOrigin;
  if (!targetWindow || !targetOrigin) {
    return Promise.reject({ message: "POS bridge is not configured" });
  }

  const requestId = createRequestId();
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingRequests.delete(requestId);
      reject({ message: "POS bridge request timed out" });
    }, REQUEST_TIMEOUT_MS);

    pendingRequests.set(requestId, {
      resolve: (value) => resolve(value as T),
      reject: (reason) => reject(reason),
      timeout,
    });
    try {
      targetWindow.postMessage(
        {
          type: "pos-api-request",
          protocolVersion: PROTOCOL_VERSION,
          requestId,
          request,
        },
        targetOrigin,
      );
    } catch {
      pendingRequests.delete(requestId);
      clearTimeout(timeout);
      reject({ message: "Failed to send POS bridge request" });
    }
  });
}

export { PROTOCOL_VERSION };
