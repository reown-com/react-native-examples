import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

import { TransactionCard } from "./transaction-card";

jest.mock("react-native", () => ({
  Platform: {
    OS: "ios",
    select: (options: Record<string, unknown>) =>
      options.ios ?? options.default,
  },
  StyleSheet: {
    create: (styles: Record<string, unknown>) => styles,
    flatten: (style: unknown) => style,
  },
  Text: "Text",
  View: "View",
}));

jest.mock("@/hooks/use-theme-color", () => ({
  useTheme: () =>
    new Proxy({}, { get: (_target, property) => String(property) }),
  useThemeColor: (colorName: string) => colorName,
}));

jest.mock("./pressable", () => {
  const mockReact = jest.requireActual("react");

  return {
    Pressable: ({ children, ...props }: React.PropsWithChildren<any>) =>
      mockReact.createElement(
        "View",
        { ...props, testID: "transaction-card-pressable" },
        children,
      ),
  };
});

jest.mock("expo-image", () => {
  const mockReact = jest.requireActual("react");

  return {
    Image: (props: Record<string, unknown>) =>
      mockReact.createElement("View", props),
  };
});

describe("TransactionCard", () => {
  it("invokes its detail callback through the shared Pressable", () => {
    const onPress = jest.fn();
    const card = render(
      <TransactionCard
        payment={{
          paymentId: "payment-1",
          status: "succeeded",
          isTerminal: true,
          fiatAmount: { value: "1250", unit: "iso4217/USD" },
          createdAt: "2026-08-21T12:00:00.000Z",
        }}
        onPress={onPress}
      />,
    ).getByTestId("transaction-card-pressable");

    fireEvent.press(card);

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
