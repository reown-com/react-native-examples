import { fireEvent, render } from "@testing-library/react-native";
import { router } from "expo-router";
import React from "react";

import HomeScreen from "@/app/index";
import MerchantSetupScreen from "@/app/merchant-setup";
import { useSettingsStore } from "@/store/useSettingsStore";

import { resetSettingsStore } from "../utils/store-helpers";

jest.mock("react-native", () => {
  const mockReact = jest.requireActual("react");
  const host =
    (name: string) =>
    ({ children, ...props }: React.PropsWithChildren<any>) =>
      mockReact.createElement(name, props, children);

  return {
    Platform: {
      OS: "ios",
      select: (options: Record<string, unknown>) =>
        options.ios ?? options.default,
    },
    StyleSheet: {
      create: (styles: Record<string, unknown>) => styles,
      flatten: (style: unknown) => style,
    },
    useWindowDimensions: () => ({ width: 390, height: 844 }),
    Text: host("Text"),
    View: host("View"),
  };
});

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("expo-asset", () => ({ useAssets: () => [[]] }));
jest.mock("expo-image", () => ({ Image: () => null }));

jest.mock("@/hooks/use-theme-color", () => ({
  useTheme: () =>
    new Proxy({}, { get: (_target, property) => String(property) }),
  useThemeColor: (colorName: string) => colorName,
}));

jest.mock("@/hooks/use-is-tablet", () => ({ useIsTablet: () => false }));

jest.mock("@/components/pressable", () => {
  const mockReact = jest.requireActual("react");
  return {
    Pressable: ({ children, ...props }: React.PropsWithChildren<any>) =>
      mockReact.createElement("Pressable", props, children),
  };
});

jest.mock("@/components/themed-text", () => {
  const mockReact = jest.requireActual("react");
  return {
    ThemedText: ({ children }: React.PropsWithChildren) =>
      mockReact.createElement("Text", null, children),
  };
});

jest.mock("@/components/empty-state", () => {
  const mockReact = jest.requireActual("react");

  return {
    EmptyState: ({ title, subtitle, cta }: any) =>
      mockReact.createElement(
        mockReact.Fragment,
        null,
        mockReact.createElement("Text", null, title),
        mockReact.createElement("Text", null, subtitle),
        mockReact.createElement(
          "Pressable",
          { onPress: cta.onPress },
          mockReact.createElement("Text", null, cta.label),
        ),
      ),
  };
});

describe("HomeScreen New payment", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetSettingsStore();
  });

  it("shows the merchant setup screen when credentials are missing", () => {
    useSettingsStore.setState({
      testMode: false,
      merchantId: null,
      isCustomerApiKeySet: false,
    });
    const { getByTestId } = render(<HomeScreen />);

    fireEvent.press(getByTestId("start-payment-button"));

    expect(router.push).toHaveBeenCalledWith("/merchant-setup");
    expect(router.push).not.toHaveBeenCalledWith("/amount");
  });

  it("starts a payment when the terminal is configured", () => {
    useSettingsStore.setState({
      testMode: false,
      merchantId: "merchant-1",
      isCustomerApiKeySet: true,
    });
    const { getByTestId } = render(<HomeScreen />);

    fireEvent.press(getByTestId("start-payment-button"));

    expect(router.push).toHaveBeenCalledWith("/amount");
  });

  it("starts a payment in Test Mode without credentials", () => {
    useSettingsStore.setState({
      testMode: true,
      merchantId: null,
      isCustomerApiKeySet: false,
    });
    const { getByTestId } = render(<HomeScreen />);

    fireEvent.press(getByTestId("start-payment-button"));

    expect(router.push).toHaveBeenCalledWith("/amount");
  });
});

describe("MerchantSetupScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("asks for merchant details and replaces itself with Settings", () => {
    const { getByText } = render(<MerchantSetupScreen />);

    expect(getByText("Set up your merchant details")).toBeTruthy();

    fireEvent.press(getByText("Go to Settings"));
    expect(router.replace).toHaveBeenCalledWith("/settings");
  });
});
