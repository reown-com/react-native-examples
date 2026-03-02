import { renderHook, act } from "@testing-library/react-native";
import { Platform } from "react-native";
import { router } from "expo-router";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useLogsStore } from "@/store/useLogsStore";
import { useUrlCredentials } from "@/hooks/use-url-credentials";
import { resetSettingsStore, resetLogsStore } from "../utils/store-helpers";
import { waitForAsync } from "../utils/test-helpers";

type MessageHandler = (event: { data: unknown }) => void;
const messageListeners: MessageHandler[] = [];
const parentPostMessage = jest.fn();

function setWindowLocation(search: string) {
  const href = `http://localhost${search}`;
  (global as any).window = {
    ...((global as any).window || {}),
    location: { search, href },
    addEventListener: (type: string, handler: MessageHandler) => {
      if (type === "message") messageListeners.push(handler);
    },
    removeEventListener: (type: string, handler: MessageHandler) => {
      if (type === "message") {
        const idx = messageListeners.indexOf(handler);
        if (idx !== -1) messageListeners.splice(idx, 1);
      }
    },
    parent: { postMessage: parentPostMessage },
  };
}

function dispatchPostMessage(data: unknown) {
  for (const handler of [...messageListeners]) {
    handler({ data });
  }
}

function clearWindow() {
  messageListeners.length = 0;
  parentPostMessage.mockClear();
  delete (global as any).window;
}

function toBase64(value: string) {
  return Buffer.from(value).toString("base64");
}

beforeEach(() => {
  resetSettingsStore();
  resetLogsStore();
  (Platform as any).OS = "web";
  clearWindow();
});

afterEach(() => {
  (Platform as any).OS = "ios";
  clearWindow();
});

describe("useUrlCredentials", () => {
  it("applies both merchantId and customerApiKey from base64-encoded URL params", async () => {
    const merchantId = "test-merchant-123";
    const apiKey = "test-api-key-456";
    setWindowLocation(
      `?merchantId=${toBase64(merchantId)}&customerApiKey=${toBase64(apiKey)}`,
    );

    useSettingsStore.setState({ _hasHydrated: true });

    renderHook(() => useUrlCredentials());
    await act(() => waitForAsync());

    const state = useSettingsStore.getState();
    expect(state.merchantId).toBe(merchantId);
    expect(state.isCustomerApiKeySet).toBe(true);
    expect(router.replace).toHaveBeenCalledWith("/");
  });

  it("applies only merchantId when customerApiKey is absent", async () => {
    const merchantId = "only-merchant";
    setWindowLocation(`?merchantId=${toBase64(merchantId)}`);

    useSettingsStore.setState({ _hasHydrated: true });

    renderHook(() => useUrlCredentials());
    await act(() => waitForAsync());

    const state = useSettingsStore.getState();
    expect(state.merchantId).toBe(merchantId);
    expect(state.isCustomerApiKeySet).toBe(false);
  });

  it("applies only customerApiKey when merchantId is absent", async () => {
    const apiKey = "only-api-key";
    setWindowLocation(`?customerApiKey=${toBase64(apiKey)}`);

    useSettingsStore.setState({ _hasHydrated: true, merchantId: null });

    renderHook(() => useUrlCredentials());
    await act(() => waitForAsync());

    const state = useSettingsStore.getState();
    expect(state.merchantId).toBeNull();
    expect(state.isCustomerApiKeySet).toBe(true);
  });

  it("does nothing when no URL params are present", async () => {
    setWindowLocation("");

    useSettingsStore.setState({
      _hasHydrated: true,
      merchantId: "existing-merchant",
    });

    renderHook(() => useUrlCredentials());
    await act(() => waitForAsync());

    const state = useSettingsStore.getState();
    expect(state.merchantId).toBe("existing-merchant");
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("does nothing on native platforms", async () => {
    (Platform as any).OS = "ios";

    setWindowLocation(`?merchantId=${toBase64("should-not-apply")}`);

    useSettingsStore.setState({ _hasHydrated: true });

    renderHook(() => useUrlCredentials());
    await act(() => waitForAsync());

    const state = useSettingsStore.getState();
    expect(state.merchantId).toBeNull();
  });

  it("waits for store hydration before processing", async () => {
    const merchantId = "hydration-test";
    setWindowLocation(`?merchantId=${toBase64(merchantId)}`);

    useSettingsStore.setState({ _hasHydrated: false });

    const { rerender } = renderHook(() => useUrlCredentials());
    await act(() => waitForAsync());

    expect(useSettingsStore.getState().merchantId).toBeNull();

    useSettingsStore.setState({ _hasHydrated: true });
    rerender({});
    await act(() => waitForAsync());

    expect(useSettingsStore.getState().merchantId).toBe(merchantId);
  });

  it("logs actions when credentials are applied", async () => {
    setWindowLocation(
      `?merchantId=${toBase64("log-test")}&customerApiKey=${toBase64("log-key")}`,
    );

    useSettingsStore.setState({ _hasHydrated: true });

    renderHook(() => useUrlCredentials());
    await act(() => waitForAsync());

    const logs = useLogsStore.getState().logs;
    const infoLogs = logs.filter((l) => l.level === "info");
    expect(infoLogs).toHaveLength(2);
    expect(infoLogs[0].message).toContain("Merchant ID set from URL");
    expect(infoLogs[1].message).toContain("Customer API key set from URL");
  });
});

describe("useUrlCredentials — postMessage", () => {
  it("applies both merchantId and customerApiKey from postMessage", async () => {
    setWindowLocation("");
    useSettingsStore.setState({ _hasHydrated: true });

    renderHook(() => useUrlCredentials());
    await act(() => waitForAsync());

    await act(async () => {
      dispatchPostMessage({
        type: "pos-credentials",
        merchantId: "pm-merchant-123",
        customerApiKey: "pm-key-456",
      });
      await waitForAsync();
    });

    const state = useSettingsStore.getState();
    expect(state.merchantId).toBe("pm-merchant-123");
    expect(state.isCustomerApiKeySet).toBe(true);
  });

  it("applies only merchantId from postMessage", async () => {
    setWindowLocation("");
    useSettingsStore.setState({ _hasHydrated: true });

    renderHook(() => useUrlCredentials());
    await act(() => waitForAsync());

    await act(async () => {
      dispatchPostMessage({
        type: "pos-credentials",
        merchantId: "pm-only-merchant",
      });
      await waitForAsync();
    });

    expect(useSettingsStore.getState().merchantId).toBe("pm-only-merchant");
    expect(useSettingsStore.getState().isCustomerApiKeySet).toBe(false);
  });

  it("applies only customerApiKey from postMessage", async () => {
    setWindowLocation("");
    useSettingsStore.setState({ _hasHydrated: true, merchantId: null });

    renderHook(() => useUrlCredentials());
    await act(() => waitForAsync());

    await act(async () => {
      dispatchPostMessage({
        type: "pos-credentials",
        customerApiKey: "pm-only-key",
      });
      await waitForAsync();
    });

    expect(useSettingsStore.getState().merchantId).toBeNull();
    expect(useSettingsStore.getState().isCustomerApiKeySet).toBe(true);
  });

  it("ignores messages with wrong type", async () => {
    setWindowLocation("");
    useSettingsStore.setState({
      _hasHydrated: true,
      merchantId: "existing",
    });

    renderHook(() => useUrlCredentials());
    await act(() => waitForAsync());

    await act(async () => {
      dispatchPostMessage({
        type: "some-other-message",
        merchantId: "should-not-apply",
      });
      await waitForAsync();
    });

    expect(useSettingsStore.getState().merchantId).toBe("existing");
  });

  it("ignores non-object messages", async () => {
    setWindowLocation("");
    useSettingsStore.setState({ _hasHydrated: true });

    renderHook(() => useUrlCredentials());
    await act(() => waitForAsync());

    await act(async () => {
      dispatchPostMessage("just a string");
      dispatchPostMessage(null);
      dispatchPostMessage(42);
      await waitForAsync();
    });

    expect(useSettingsStore.getState().merchantId).toBeNull();
  });

  it("does nothing on native platforms", async () => {
    (Platform as any).OS = "ios";
    setWindowLocation("");
    useSettingsStore.setState({ _hasHydrated: true });

    renderHook(() => useUrlCredentials());
    await act(() => waitForAsync());

    await act(async () => {
      dispatchPostMessage({
        type: "pos-credentials",
        merchantId: "should-not-apply",
      });
      await waitForAsync();
    });

    expect(useSettingsStore.getState().merchantId).toBeNull();
  });

  it("logs source as postMessage", async () => {
    setWindowLocation("");
    useSettingsStore.setState({ _hasHydrated: true });

    renderHook(() => useUrlCredentials());
    await act(() => waitForAsync());

    await act(async () => {
      dispatchPostMessage({
        type: "pos-credentials",
        merchantId: "log-pm-test",
        customerApiKey: "log-pm-key",
      });
      await waitForAsync();
    });

    const logs = useLogsStore.getState().logs;
    const infoLogs = logs.filter((l) => l.level === "info");
    expect(infoLogs).toHaveLength(2);
    expect(infoLogs[0].message).toContain("Merchant ID set from postMessage");
    expect(infoLogs[1].message).toContain(
      "Customer API key set from postMessage",
    );
  });

  it("cleans up listener on unmount", async () => {
    setWindowLocation("");
    useSettingsStore.setState({ _hasHydrated: true });

    const { unmount } = renderHook(() => useUrlCredentials());
    await act(() => waitForAsync());

    unmount();

    await act(async () => {
      dispatchPostMessage({
        type: "pos-credentials",
        merchantId: "after-unmount",
      });
      await waitForAsync();
    });

    expect(useSettingsStore.getState().merchantId).toBeNull();
  });
});

describe("useUrlCredentials — outbound events", () => {
  it("posts pos-ready to parent after listener is set up", async () => {
    setWindowLocation("");
    useSettingsStore.setState({ _hasHydrated: true });

    renderHook(() => useUrlCredentials());
    await act(() => waitForAsync());

    expect(parentPostMessage).toHaveBeenCalledWith(
      { type: "pos-ready" },
      "*",
    );
  });

  it("posts pos-credentials-updated after successful postMessage credentials", async () => {
    setWindowLocation("");
    useSettingsStore.setState({ _hasHydrated: true });

    renderHook(() => useUrlCredentials());
    await act(() => waitForAsync());

    parentPostMessage.mockClear();

    await act(async () => {
      dispatchPostMessage({
        type: "pos-credentials",
        merchantId: "outbound-test",
      });
      await waitForAsync();
    });

    expect(parentPostMessage).toHaveBeenCalledWith(
      { type: "pos-credentials-updated" },
      "*",
    );
  });

  it("posts pos-credentials-updated after successful URL param credentials", async () => {
    setWindowLocation(
      `?merchantId=${toBase64("url-outbound-test")}&customerApiKey=${toBase64("url-key")}`,
    );
    useSettingsStore.setState({ _hasHydrated: true });

    renderHook(() => useUrlCredentials());
    await act(() => waitForAsync());

    expect(parentPostMessage).toHaveBeenCalledWith(
      { type: "pos-credentials-updated" },
      "*",
    );
  });

  it("does not post events on native platforms", async () => {
    (Platform as any).OS = "ios";
    setWindowLocation("");
    useSettingsStore.setState({ _hasHydrated: true });

    renderHook(() => useUrlCredentials());
    await act(() => waitForAsync());

    expect(parentPostMessage).not.toHaveBeenCalled();
  });
});
