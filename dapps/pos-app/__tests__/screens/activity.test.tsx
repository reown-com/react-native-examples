import { fireEvent, render } from "@testing-library/react-native";
import { router } from "expo-router";
import React from "react";

import ActivityScreen from "@/app/activity";
import { useTransactions } from "@/services/hooks";
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
    ActivityIndicator: host("ActivityIndicator"),
    RefreshControl: host("RefreshControl"),
    Text: host("Text"),
    View: host("View"),
    Pressable: host("Pressable"),
    // Only the empty state matters here: render ListEmptyComponent when there
    // are no rows.
    FlatList: ({ data, ListEmptyComponent }: any) =>
      !data?.length && ListEmptyComponent
        ? mockReact.createElement(ListEmptyComponent)
        : null,
  };
});

jest.mock("@/services/hooks", () => ({
  useTransactions: jest.fn(),
}));

jest.mock("@/hooks/use-theme-color", () => ({
  useTheme: () =>
    new Proxy({}, { get: (_target, property) => String(property) }),
  useThemeColor: (colorName: string) => colorName,
}));

jest.mock("@/components/empty-state", () => {
  const mockReact = jest.requireActual("react");
  const { Text, Pressable } = jest.requireMock("react-native");

  return {
    EmptyState: ({ title, subtitle, cta }: any) =>
      mockReact.createElement(
        mockReact.Fragment,
        null,
        mockReact.createElement(Text, null, title),
        mockReact.createElement(Text, null, subtitle),
        cta &&
          mockReact.createElement(
            Pressable,
            { onPress: cta.onPress },
            mockReact.createElement(Text, null, cta.label),
          ),
      ),
  };
});

jest.mock("@/components/filter-buttons", () => ({
  FilterButtons: () => null,
}));
jest.mock("@/components/settings-bottom-sheet", () => ({
  SettingsBottomSheet: () => null,
}));
jest.mock("@/components/radio-list", () => ({ RadioList: () => null }));
jest.mock("@/components/test-mode-pill", () => ({
  TestModeOverlay: () => null,
}));
jest.mock("@/components/transaction-card", () => ({
  TransactionCard: () => null,
}));
jest.mock("@/components/transaction-detail-modal", () => ({
  TransactionDetailModal: () => null,
}));

const mockUseTransactions = useTransactions as jest.Mock;
const refetch = jest.fn();

function mockTransactionsResult(overrides: Record<string, unknown> = {}) {
  mockUseTransactions.mockReturnValue({
    transactions: [],
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch,
    isRefetching: false,
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    ...overrides,
  });
}

describe("ActivityScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetSettingsStore();
    mockTransactionsResult();
  });

  describe("without merchant credentials in live mode", () => {
    beforeEach(() => {
      useSettingsStore.setState({
        testMode: false,
        merchantId: null,
        isCustomerApiKeySet: false,
      });
    });

    it("points the merchant to Settings instead of a network error", () => {
      mockTransactionsResult({ isError: true, error: new Error("401") });
      const { getByText, queryByText } = render(<ActivityScreen />);

      expect(getByText("Set up your merchant details")).toBeTruthy();
      expect(queryByText("We couldn't load payments")).toBeNull();

      fireEvent.press(getByText("Go to Settings"));
      expect(router.push).toHaveBeenCalledWith("/settings");
    });

    it("does not request payments", () => {
      render(<ActivityScreen />);

      expect(mockUseTransactions).toHaveBeenCalledWith(
        expect.objectContaining({ enabled: false }),
      );
    });

    it("still needs setup with only a merchant ID", () => {
      useSettingsStore.setState({ merchantId: "merchant-1" });
      const { getByText } = render(<ActivityScreen />);

      expect(getByText("Set up your merchant details")).toBeTruthy();
    });
  });

  it("keeps the retry error when credentials are set and the fetch fails", () => {
    useSettingsStore.setState({
      testMode: false,
      merchantId: "merchant-1",
      isCustomerApiKeySet: true,
    });
    mockTransactionsResult({ isError: true, error: new Error("Network") });
    const { getByText, queryByText } = render(<ActivityScreen />);

    expect(getByText("We couldn't load payments")).toBeTruthy();
    expect(queryByText("Set up your merchant details")).toBeNull();
    expect(mockUseTransactions).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: true }),
    );

    fireEvent.press(getByText("Try again"));
    expect(refetch).toHaveBeenCalled();
  });

  it("does not ask for setup in Test Mode", () => {
    useSettingsStore.setState({
      testMode: true,
      merchantId: null,
      isCustomerApiKeySet: false,
    });
    const { getByText, queryByText } = render(<ActivityScreen />);

    expect(getByText("No payments yet")).toBeTruthy();
    expect(queryByText("Set up your merchant details")).toBeNull();
  });
});
