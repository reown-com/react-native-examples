import { act, renderHook } from "@testing-library/react-native";
import { Platform } from "react-native";
import { useUrlCredentials } from "@/hooks/use-url-credentials";
import { resetBridge } from "@/services/pos-bridge";
import { usePosBridgeStore } from "@/store/usePosBridgeStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { resetSettingsStore } from "../utils/store-helpers";
import { waitForAsync } from "../utils/test-helpers";

type MessageHandler = (event: {
  data: unknown;
  source?: unknown;
  origin?: string;
}) => void;

const messageListeners: MessageHandler[] = [];
const parentPostMessage = jest.fn();
const parentWindow = { postMessage: parentPostMessage } as unknown as Window;
const otherWindow = { postMessage: jest.fn() } as unknown as Window;
const parentOrigin = "https://dashboard.example.com";

function setWindowLocation(search = "") {
  (global as any).window = {
    location: { search, href: `http://localhost${search}` },
    addEventListener: (type: string, handler: MessageHandler) => {
      if (type === "message") messageListeners.push(handler);
    },
    removeEventListener: (type: string, handler: MessageHandler) => {
      const index = messageListeners.indexOf(handler);
      if (type === "message" && index >= 0) messageListeners.splice(index, 1);
    },
    parent: parentWindow,
  };
}

function dispatchMessage(
  data: unknown,
  source: unknown = parentWindow,
  origin = parentOrigin,
) {
  for (const handler of [...messageListeners])
    handler({ data, source, origin });
}

beforeEach(() => {
  resetSettingsStore();
  resetBridge();
  parentPostMessage.mockClear();
  messageListeners.length = 0;
  (Platform as any).OS = "web";
  setWindowLocation();
});

afterEach(() => {
  resetBridge();
  messageListeners.length = 0;
  delete (global as any).window;
  (Platform as any).OS = "ios";
});

describe("useUrlCredentials", () => {
  it("clears an embedded stale key and announces bridge readiness", async () => {
    await useSettingsStore.getState().setCustomerApiKey("stale-key");
    useSettingsStore.setState({ _hasHydrated: true });

    renderHook(() => useUrlCredentials());
    await act(() => waitForAsync());

    expect(useSettingsStore.getState().isCustomerApiKeySet).toBe(false);
    expect(parentPostMessage).toHaveBeenCalledWith(
      { type: "pos-ready", protocolVersion: 1 },
      "*",
    );
  });

  it("configures the locked bridge and stores only the non-secret merchant ID", async () => {
    await useSettingsStore.getState().setCustomerApiKey("stale-key");
    useSettingsStore.setState({ _hasHydrated: true });
    renderHook(() => useUrlCredentials());
    await act(() => waitForAsync());

    await act(async () => {
      dispatchMessage({
        type: "pos-bridge-config",
        protocolVersion: 1,
        merchantId: " merchant-bridge ",
      });
      await waitForAsync();
    });

    expect(useSettingsStore.getState()).toMatchObject({
      merchantId: "merchant-bridge",
      isCustomerApiKeySet: false,
    });
    expect(usePosBridgeStore.getState()).toMatchObject({
      isConfigured: true,
      merchantId: "merchant-bridge",
    });
  });

  it("ignores malformed, wrong-version, wrong-window, and subsequent configs", async () => {
    useSettingsStore.setState({ _hasHydrated: true });
    renderHook(() => useUrlCredentials());
    await act(() => waitForAsync());

    await act(async () => {
      dispatchMessage({
        type: "pos-bridge-config",
        protocolVersion: 2,
        merchantId: "wrong-version",
      });
      dispatchMessage(
        {
          type: "pos-bridge-config",
          protocolVersion: 1,
          merchantId: "wrong-window",
        },
        otherWindow,
      );
      dispatchMessage({
        type: "pos-bridge-config",
        protocolVersion: 1,
        merchantId: "   ",
      });
      await waitForAsync();
    });
    expect(usePosBridgeStore.getState().isConfigured).toBe(false);

    await act(async () => {
      dispatchMessage({
        type: "pos-bridge-config",
        protocolVersion: 1,
        merchantId: "merchant-bridge",
      });
      dispatchMessage({
        type: "pos-bridge-config",
        protocolVersion: 1,
        merchantId: "other-merchant",
      });
      await waitForAsync();
    });
    expect(usePosBridgeStore.getState().merchantId).toBe("merchant-bridge");
  });

  it("ignores legacy URL and postMessage credentials", async () => {
    setWindowLocation(
      "?merchantId=bGVnYWN5LW1lcmNoYW50JmN1c3RvbWVyQXBpS2V5PWxlZ2FjeS1rZXk=",
    );
    useSettingsStore.setState({ _hasHydrated: true });
    renderHook(() => useUrlCredentials());
    await act(() => waitForAsync());

    await act(async () => {
      dispatchMessage({
        type: "pos-credentials",
        merchantId: "legacy-merchant",
        customerApiKey: "legacy-key",
      });
      await waitForAsync();
    });

    expect(useSettingsStore.getState()).toMatchObject({
      merchantId: null,
      isCustomerApiKeySet: false,
    });
    expect(usePosBridgeStore.getState().isConfigured).toBe(false);
  });

  it("does nothing on native platforms", async () => {
    (Platform as any).OS = "ios";
    useSettingsStore.setState({ _hasHydrated: true });
    renderHook(() => useUrlCredentials());
    await act(() => waitForAsync());

    expect(parentPostMessage).not.toHaveBeenCalled();
  });

  it("resets bridge mode when the listener unmounts", async () => {
    useSettingsStore.setState({ _hasHydrated: true });
    const { unmount } = renderHook(() => useUrlCredentials());
    await act(() => waitForAsync());
    await act(async () => {
      dispatchMessage({
        type: "pos-bridge-config",
        protocolVersion: 1,
        merchantId: "merchant-bridge",
      });
      await waitForAsync();
    });

    unmount();
    expect(usePosBridgeStore.getState().isConfigured).toBe(false);
  });
});
