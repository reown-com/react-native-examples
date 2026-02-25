import { renderHook, act } from "@testing-library/react-native";
import { Platform } from "react-native";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useLogsStore } from "@/store/useLogsStore";
import {
  tryBase64Decode,
  useUrlCredentials,
} from "@/hooks/use-url-credentials";
import { resetSettingsStore, resetLogsStore } from "../utils/store-helpers";
import { waitForAsync } from "../utils/test-helpers";

// Mock window for node test environment
const mockReplaceState = jest.fn();

function setWindowLocation(search: string) {
  const href = `http://localhost${search}`;
  (global as any).window = {
    location: { search, href },
    history: { replaceState: mockReplaceState },
  };
}

function clearWindow() {
  delete (global as any).window;
}

beforeEach(() => {
  resetSettingsStore();
  resetLogsStore();
  mockReplaceState.mockClear();
  (Platform as any).OS = "web";
  clearWindow();
});

afterEach(() => {
  (Platform as any).OS = "ios";
  clearWindow();
});

describe("tryBase64Decode", () => {
  it("decodes a valid base64 string", () => {
    // btoa is available in Node 16+
    const encoded = Buffer.from("my-merchant-id").toString("base64");
    expect(tryBase64Decode(encoded)).toBe("my-merchant-id");
  });

  it("returns raw value when input is not valid base64", () => {
    expect(tryBase64Decode("!!!not-base64!!!")).toBe("!!!not-base64!!!");
  });

  it("returns raw value when decoded result has control characters", () => {
    const binaryWithControlChars = String.fromCharCode(0x01, 0x02, 0x03);
    const encoded = Buffer.from(binaryWithControlChars).toString("base64");
    expect(tryBase64Decode(encoded)).toBe(encoded);
  });

  it("decodes UUID-like merchant IDs correctly", () => {
    const merchantId = "550e8400-e29b-41d4-a716-446655440000";
    const encoded = Buffer.from(merchantId).toString("base64");
    expect(tryBase64Decode(encoded)).toBe(merchantId);
  });

  it("handles plain text that is not valid base64", () => {
    const raw = "550e8400-e29b-41d4-a716-446655440000";
    expect(tryBase64Decode(raw)).toBe(raw);
  });
});

describe("useUrlCredentials", () => {
  it("applies both merchantId and partnerApiKey from base64-encoded URL params", async () => {
    const merchantId = "test-merchant-123";
    const apiKey = "test-api-key-456";
    const encodedMerchant = Buffer.from(merchantId).toString("base64");
    const encodedKey = Buffer.from(apiKey).toString("base64");
    setWindowLocation(
      `?merchantId=${encodedMerchant}&partnerApiKey=${encodedKey}`,
    );

    useSettingsStore.setState({ _hasHydrated: true });

    renderHook(() => useUrlCredentials());
    await act(() => waitForAsync());

    const state = useSettingsStore.getState();
    expect(state.merchantId).toBe(merchantId);
    expect(state.isPartnerApiKeySet).toBe(true);
    expect(mockReplaceState).toHaveBeenCalled();
  });

  it("applies raw (non-encoded) URL params", async () => {
    const merchantId = "raw-merchant-id";
    const apiKey = "raw-api-key";
    setWindowLocation(`?merchantId=${merchantId}&partnerApiKey=${apiKey}`);

    useSettingsStore.setState({ _hasHydrated: true });

    renderHook(() => useUrlCredentials());
    await act(() => waitForAsync());

    const state = useSettingsStore.getState();
    expect(state.merchantId).toBe(merchantId);
    expect(state.isPartnerApiKeySet).toBe(true);
  });

  it("applies only merchantId when partnerApiKey is absent", async () => {
    const merchantId = "only-merchant";
    const encoded = Buffer.from(merchantId).toString("base64");
    setWindowLocation(`?merchantId=${encoded}`);

    useSettingsStore.setState({ _hasHydrated: true });

    renderHook(() => useUrlCredentials());
    await act(() => waitForAsync());

    const state = useSettingsStore.getState();
    expect(state.merchantId).toBe(merchantId);
    expect(state.isPartnerApiKeySet).toBe(false);
  });

  it("applies only partnerApiKey when merchantId is absent", async () => {
    const apiKey = "only-api-key";
    const encoded = Buffer.from(apiKey).toString("base64");
    setWindowLocation(`?partnerApiKey=${encoded}`);

    useSettingsStore.setState({ _hasHydrated: true, merchantId: null });

    renderHook(() => useUrlCredentials());
    await act(() => waitForAsync());

    const state = useSettingsStore.getState();
    expect(state.merchantId).toBeNull();
    expect(state.isPartnerApiKeySet).toBe(true);
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
    expect(mockReplaceState).not.toHaveBeenCalled();
  });

  it("does nothing on native platforms", async () => {
    (Platform as any).OS = "ios";

    const merchantId = "should-not-apply";
    const encoded = Buffer.from(merchantId).toString("base64");
    setWindowLocation(`?merchantId=${encoded}`);

    useSettingsStore.setState({ _hasHydrated: true });

    renderHook(() => useUrlCredentials());
    await act(() => waitForAsync());

    const state = useSettingsStore.getState();
    expect(state.merchantId).toBeNull();
  });

  it("waits for store hydration before processing", async () => {
    const merchantId = "hydration-test";
    const encoded = Buffer.from(merchantId).toString("base64");
    setWindowLocation(`?merchantId=${encoded}`);

    // Start with _hasHydrated false
    useSettingsStore.setState({ _hasHydrated: false });

    const { rerender } = renderHook(() => useUrlCredentials());
    await act(() => waitForAsync());

    // Should not have applied yet
    expect(useSettingsStore.getState().merchantId).toBeNull();

    // Now hydrate
    useSettingsStore.setState({ _hasHydrated: true });
    rerender({});
    await act(() => waitForAsync());

    expect(useSettingsStore.getState().merchantId).toBe(merchantId);
  });

  it("logs actions when credentials are applied", async () => {
    const encoded = Buffer.from("log-test").toString("base64");
    const encodedKey = Buffer.from("log-key").toString("base64");
    setWindowLocation(
      `?merchantId=${encoded}&partnerApiKey=${encodedKey}`,
    );

    useSettingsStore.setState({ _hasHydrated: true });

    renderHook(() => useUrlCredentials());
    await act(() => waitForAsync());

    const logs = useLogsStore.getState().logs;
    const infoLogs = logs.filter((l) => l.level === "info");
    expect(infoLogs).toHaveLength(2);
    expect(infoLogs[0].message).toContain("Merchant ID set from URL");
    expect(infoLogs[1].message).toContain("Partner API key set from URL");
  });

  it("cleans only credential params from URL, preserving others", async () => {
    const encoded = Buffer.from("clean-test").toString("base64");
    setWindowLocation(`?merchantId=${encoded}&other=keep`);

    useSettingsStore.setState({ _hasHydrated: true });

    renderHook(() => useUrlCredentials());
    await act(() => waitForAsync());

    expect(mockReplaceState).toHaveBeenCalledWith(
      {},
      "",
      expect.stringContaining("other=keep"),
    );
    expect(mockReplaceState).toHaveBeenCalledWith(
      {},
      "",
      expect.not.stringContaining("merchantId"),
    );
  });
});
