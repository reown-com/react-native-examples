import { act, renderHook } from "@testing-library/react-native";
import { useMerchantFlow } from "@/hooks/use-merchant-flow";
import { useSettingsStore } from "@/store/useSettingsStore";
import { resetSettingsStore } from "../utils/store-helpers";

const renderFlow = () =>
  renderHook(() =>
    useMerchantFlow({
      canUseBiometric: false,
      authenticate: jest.fn(),
      biometricLabel: "Face ID",
    }),
  );

describe("useMerchantFlow scanned setup", () => {
  beforeEach(() => {
    resetSettingsStore();
  });

  it("saves the merchant ID and API key together behind one PIN setup", async () => {
    const { result } = renderFlow();

    act(() => {
      result.current.handleScannedSetup({
        apiKey: "scanned-key",
        merchantId: "scanned-merchant",
      });
    });

    // Nothing is saved until the PIN step completes.
    expect(result.current.activeModal).toBe("pin-setup");
    expect(useSettingsStore.getState().merchantId).toBeNull();

    await act(async () => {
      await result.current.handlePinSetupComplete("1234");
    });

    const settings = useSettingsStore.getState();
    expect(settings.merchantId).toBe("scanned-merchant");
    expect(settings.isCustomerApiKeySet).toBe(true);
    await expect(settings.getCustomerApiKey()).resolves.toBe("scanned-key");
    expect(result.current.activeModal).toBe("none");
  });

  it("asks for the existing PIN and saves nothing when cancelled", async () => {
    await useSettingsStore.getState().setPin("1234");
    const { result } = renderFlow();

    act(() => {
      result.current.handleScannedSetup({
        apiKey: "scanned-key",
        merchantId: "scanned-merchant",
      });
    });
    expect(result.current.activeModal).toBe("pin-verify");

    act(() => {
      result.current.handleCancelSecurityFlow();
    });

    expect(result.current.activeModal).toBe("none");
    expect(useSettingsStore.getState().merchantId).toBeNull();
    expect(useSettingsStore.getState().isCustomerApiKeySet).toBe(false);
  });
});
