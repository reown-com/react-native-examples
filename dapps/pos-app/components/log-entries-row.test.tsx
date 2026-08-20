import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

import { LogEntriesRow } from "@/components/log-entries-row";
import { Colors } from "@/constants/theme";

const mockColors = Colors;

jest.mock("react-native", () => ({
  StyleSheet: {
    create: (styles: Record<string, unknown>) => styles,
    flatten: (style: unknown) =>
      Array.isArray(style) ? Object.assign({}, ...style) : style,
  },
  Platform: {
    OS: "ios",
    select: (options: Record<string, unknown>) =>
      options.ios ?? options.default,
  },
  Text: "Text",
  View: "View",
}));

jest.mock("expo-image", () => ({
  Image: "Image",
}));

jest.mock("@/hooks/use-theme-color", () => ({
  useTheme: () => mockColors.light,
  useThemeColor: (colorName: keyof typeof mockColors.light) =>
    mockColors.light[colorName],
}));

jest.mock("./pressable", () => {
  const mockReact = jest.requireActual("react");

  return {
    Pressable: ({ children, ...props }: React.PropsWithChildren<any>) =>
      mockReact.createElement("View", props, children),
  };
});

describe("LogEntriesRow", () => {
  it("renders a pluralized count", () => {
    const { getByText } = render(
      <LogEntriesRow count={42} onPress={() => {}} />,
    );

    expect(getByText("42 Log entries")).toBeTruthy();
  });

  it("renders the singular label for a single entry", () => {
    const { getByText } = render(
      <LogEntriesRow count={1} onPress={() => {}} />,
    );

    expect(getByText("1 Log entry")).toBeTruthy();
  });

  it("calls onPress when the row is pressed", () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <LogEntriesRow count={3} onPress={onPress} testID="settings-view-logs" />,
    );

    fireEvent.press(getByTestId("settings-view-logs"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
