import {
  getMerchantIdForSession,
  getConnectionSetupRemaining,
  isTerminalConfigured,
  shouldRouteInvalidApiKeyToSettings,
  shouldShowConnectionSection,
} from "@/utils/pos-bridge-ui";

describe("POS bridge UI state", () => {
  it("uses the runtime bridge merchant only for iframe sessions", () => {
    expect(
      getMerchantIdForSession(true, "merchant-standalone", "merchant-bridge"),
    ).toBe("merchant-bridge");
    expect(
      getMerchantIdForSession(false, "merchant-standalone", "merchant-bridge"),
    ).toBe("merchant-standalone");
  });

  it("allows home payment setup with a merchant ID and bridge, but not without either credential path", () => {
    expect(isTerminalConfigured("merchant-1", false, true)).toBe(true);
    expect(isTerminalConfigured("merchant-1", true, false)).toBe(true);
    expect(isTerminalConfigured("merchant-1", false, false)).toBe(false);
    expect(isTerminalConfigured(null, true, true)).toBe(false);
  });

  it("hides the bridge-managed setup warning but retains a non-empty Connection section", () => {
    expect(getConnectionSetupRemaining(false, false, true)).toBe(0);
    expect(getConnectionSetupRemaining(false, false, false)).toBe(2);
    expect(shouldShowConnectionSection(true, true, false)).toBe(true);
    expect(shouldShowConnectionSection(true, false, false)).toBe(false);
    expect(shouldShowConnectionSection(true, false, true)).toBe(true);
    expect(shouldShowConnectionSection(false, false, false)).toBe(true);
  });

  it("keeps invalid API key failures in the payment flow for bridge mode", () => {
    expect(shouldRouteInvalidApiKeyToSettings(true, true)).toBe(false);
    expect(shouldRouteInvalidApiKeyToSettings(true, false)).toBe(true);
    expect(shouldRouteInvalidApiKeyToSettings(false, false)).toBe(false);
  });
});
