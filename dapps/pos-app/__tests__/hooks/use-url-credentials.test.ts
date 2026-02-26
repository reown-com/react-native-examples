import { renderHook, act } from "@testing-library/react-native";
import { Platform } from "react-native";
import { router } from "expo-router";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useLogsStore } from "@/store/useLogsStore";
import { useUrlCredentials } from "@/hooks/use-url-credentials";
import { resetSettingsStore, resetLogsStore } from "../utils/store-helpers";
import { waitForAsync } from "../utils/test-helpers";

function setWindowLocation(search: string) {
  const href = `http://localhost${search}`;
  (global as any).window = {
    ...((global as any).window || {}),
    location: { search, href },
  };
}

function clearWindow() {
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
